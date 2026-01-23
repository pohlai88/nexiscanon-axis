/**
 * Stripe webhook handler.
 *
 * Pattern: Handle Stripe events for subscription lifecycle.
 * Protected by Arcjet shield (WAF).
 */

import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/billing";
import { query } from "@/lib/db";
import { logAuditEvent } from "@/lib/db/audit";
import { logger } from "@/lib/logger";
import { webhookProtection, isArcjetConfigured } from "@/lib/arcjet";
import { sendEmail } from "@/lib/email";
import { paymentFailedEmail } from "@/lib/email/templates";
import type Stripe from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? "unknown";
  const log = logger.child({ requestId, endpoint: "/api/webhooks/stripe" });

  // Arcjet protection (shield only - high rate limits for webhooks)
  if (isArcjetConfigured()) {
    const decision = await webhookProtection.protect(request);
    if (decision.isDenied()) {
      log.warn("Stripe webhook denied by Arcjet", { reason: decision.reason });
      return NextResponse.json({ error: "Request denied" }, { status: 403 });
    }
  }

  if (!webhookSecret) {
    log.error("STRIPE_WEBHOOK_SECRET not configured", new Error("Missing webhook secret"));
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    log.warn("Missing Stripe signature header");
    return NextResponse.json(
      { error: "Missing signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    log.error("Webhook signature verification failed", error);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  log.info("Processing Stripe webhook", { eventType: event.type, eventId: event.id });

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session, log);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription, log);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription, log);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice, log);
        break;
      }

      default:
        log.debug("Unhandled event type", { eventType: event.type });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    log.error("Webhook handler error", error, { eventType: event.type });
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

type ChildLogger = ReturnType<typeof logger.child>;

async function handleCheckoutComplete(session: Stripe.Checkout.Session, log: ChildLogger) {
  const tenantId = session.metadata?.tenantId;
  if (!tenantId) {
    log.error("No tenantId in checkout session metadata", new Error("Missing tenantId"));
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

async function handleSubscriptionUpdated(subscription: Stripe.Subscription, log: ChildLogger) {
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
    log.warn("No tenant found for Stripe customer", { customerId });
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

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, log: ChildLogger) {
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
    log.warn("No tenant found for Stripe customer", { customerId });
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

async function handlePaymentFailed(invoice: Stripe.Invoice, log: ChildLogger) {
  const customerId = invoice.customer as string;
  log.warn("Payment failed", { customerId, invoiceId: invoice.id });

  // Find tenant and owner by customer ID
  const tenants = await query(async (sql) => {
    return sql`
      SELECT t.id, t.name, t.slug, u.email
      FROM tenants t
      LEFT JOIN tenant_users tu ON tu.tenant_id = t.id AND tu.role = 'owner'
      LEFT JOIN users u ON u.id = tu.user_id
      WHERE t.settings->>'stripeCustomerId' = ${customerId}
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

  // Send payment failed email notification
  if (tenant.email) {
    const invoiceAmount = invoice.amount_due
      ? `$${(invoice.amount_due / 100).toFixed(2)}`
      : undefined;

    const emailTemplate = paymentFailedEmail({
      tenantName: tenant.name as string,
      invoiceAmount,
      invoiceId: invoice.id,
    });

    const emailResult = await sendEmail({
      to: tenant.email as string,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
    });

    if (!emailResult.success) {
      log.warn("Failed to send payment failed email", {
        email: tenant.email,
        error: emailResult.error,
      });
    } else {
      log.info("Payment failed email sent", { email: tenant.email });
    }
  } else {
    log.warn("No owner email found for tenant", { tenantId: tenant.id });
  }
}
