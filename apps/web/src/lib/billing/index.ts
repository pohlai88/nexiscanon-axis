/**
 * Stripe billing service.
 *
 * Pattern: Centralized billing operations with Stripe.
 */

import Stripe from "stripe";
import { logger } from "@/lib/logger";

if (!process.env.STRIPE_SECRET_KEY) {
  logger.warn("STRIPE_SECRET_KEY not configured");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  typescript: true,
});

/**
 * Plan configuration with Stripe price IDs.
 * In production, these should be stored in env vars or database.
 */
export const PLAN_CONFIG = {
  free: {
    name: "Free",
    priceId: null,
    price: 0,
  },
  starter: {
    name: "Starter",
    priceId: process.env.STRIPE_STARTER_PRICE_ID ?? "price_starter",
    price: 2900, // $29.00 in cents
  },
  professional: {
    name: "Professional",
    priceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID ?? "price_professional",
    price: 9900, // $99.00 in cents
  },
  enterprise: {
    name: "Enterprise",
    priceId: null, // Custom pricing
    price: null,
  },
} as const;

export type PlanId = keyof typeof PLAN_CONFIG;

export interface BillingResult {
  success: boolean;
  error?: string;
  url?: string;
  subscriptionId?: string;
}

/**
 * Create a Stripe customer for a tenant.
 */
export async function createCustomer(params: {
  tenantId: string;
  tenantName: string;
  email: string;
}): Promise<string | null> {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }

  try {
    const customer = await stripe.customers.create({
      email: params.email,
      name: params.tenantName,
      metadata: {
        tenantId: params.tenantId,
      },
    });
    return customer.id;
  } catch (error) {
    logger.error("Create customer error", error, { tenantId: params.tenantId });
    return null;
  }
}

/**
 * Create a checkout session for plan upgrade.
 */
export async function createCheckoutSession(params: {
  customerId: string;
  priceId: string;
  tenantSlug: string;
  tenantId: string;
}): Promise<BillingResult> {
  if (!process.env.STRIPE_SECRET_KEY) {
    return { success: false, error: "Billing not configured" };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    const session = await stripe.checkout.sessions.create({
      customer: params.customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: params.priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/${params.tenantSlug}/settings/billing?success=true`,
      cancel_url: `${baseUrl}/${params.tenantSlug}/settings/billing?canceled=true`,
      metadata: {
        tenantId: params.tenantId,
        tenantSlug: params.tenantSlug,
      },
    });

    return { success: true, url: session.url ?? undefined };
  } catch (error) {
    logger.error("Create checkout session error", error, { tenantId: params.tenantId });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create checkout",
    };
  }
}

/**
 * Create a billing portal session for managing subscription.
 */
export async function createPortalSession(params: {
  customerId: string;
  tenantSlug: string;
}): Promise<BillingResult> {
  if (!process.env.STRIPE_SECRET_KEY) {
    return { success: false, error: "Billing not configured" };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: params.customerId,
      return_url: `${baseUrl}/${params.tenantSlug}/settings/billing`,
    });

    return { success: true, url: session.url };
  } catch (error) {
    logger.error("Create portal session error", error, { customerId: params.customerId });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create portal",
    };
  }
}

/**
 * Get subscription details for a customer.
 */
export async function getSubscription(
  customerId: string
): Promise<Stripe.Subscription | null> {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }

  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    return subscriptions.data[0] ?? null;
  } catch (error) {
    logger.error("Get subscription error", error, { customerId });
    return null;
  }
}

/**
 * Cancel a subscription.
 */
export async function cancelSubscription(
  subscriptionId: string
): Promise<BillingResult> {
  if (!process.env.STRIPE_SECRET_KEY) {
    return { success: false, error: "Billing not configured" };
  }

  try {
    await stripe.subscriptions.cancel(subscriptionId);
    return { success: true };
  } catch (error) {
    logger.error("Cancel subscription error", error, { subscriptionId });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to cancel",
    };
  }
}
