/**
 * Stripe webhook handler.
 *
 * Pattern: Handle Stripe events for subscription lifecycle.
 */

import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/billing";
import { query } from "@/lib/db";
import { logAuditEvent } from "@/lib/db/audit";
import type Stripe from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not configured");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const tenantId = session.metadata?.tenantId;
  if (!tenantId) {
    console.error("No tenantId in checkout session metadata");
    return;
  }

  const subscriptionId = session.subscription as string;

  // Get subscription to determine plan
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = subscription.items.data[0]?.price.id;

  // Map price ID to plan
  let plan = "starter";
  if (priceId === process.env.STRIPE_PROFESSIONAL_PRICE_ID) {
    plan = "professional";
  }

  // Update tenant plan
  await query(async (sql) => {
    return sql`
      UPDATE tenants
      SET plan = ${plan},
          settings = settings || ${JSON.stringify({ stripeSubscriptionId: subscriptionId })}::jsonb,
          updated_at = now()
      WHERE id = ${tenantId}::uuid
    `;
  });

  await logAuditEvent({
    tenantId,
    action: "billing.upgraded",
    resourceType: "subscription",
    metadata: { plan, subscriptionId },
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0]?.price.id;

  // Find tenant by customer ID
  const tenants = await query(async (sql) => {
    return sql`
      SELECT id FROM tenants
      WHERE settings->>'stripeCustomerId' = ${customerId}
      LIMIT 1
    `;
  });

  const tenant = tenants[0];
  if (!tenant) {
    console.error("No tenant found for customer:", customerId);
    return;
  }

  // Map price ID to plan
  let plan = "starter";
  if (priceId === process.env.STRIPE_PROFESSIONAL_PRICE_ID) {
    plan = "professional";
  }

  await query(async (sql) => {
    return sql`
      UPDATE tenants
      SET plan = ${plan}, updated_at = now()
      WHERE id = ${tenant.id}::uuid
    `;
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // Find tenant by customer ID
  const tenants = await query(async (sql) => {
    return sql`
      SELECT id FROM tenants
      WHERE settings->>'stripeCustomerId' = ${customerId}
      LIMIT 1
    `;
  });

  const tenant = tenants[0];
  if (!tenant) {
    console.error("No tenant found for customer:", customerId);
    return;
  }

  // Downgrade to free
  await query(async (sql) => {
    return sql`
      UPDATE tenants
      SET plan = 'free',
          settings = settings - 'stripeSubscriptionId',
          updated_at = now()
      WHERE id = ${tenant.id}::uuid
    `;
  });

  await logAuditEvent({
    tenantId: tenant.id as string,
    action: "billing.canceled",
    resourceType: "subscription",
  });
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  // Find tenant by customer ID
  const tenants = await query(async (sql) => {
    return sql`
      SELECT id FROM tenants
      WHERE settings->>'stripeCustomerId' = ${customerId}
      LIMIT 1
    `;
  });

  const tenant = tenants[0];
  if (!tenant) {
    return;
  }

  await logAuditEvent({
    tenantId: tenant.id as string,
    action: "billing.payment_failed",
    resourceType: "invoice",
    metadata: { invoiceId: invoice.id },
  });

  // TODO: Send payment failed email notification
}
