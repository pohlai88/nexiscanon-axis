"use server";

/**
 * Billing server actions.
 *
 * Pattern: Server actions for Stripe billing operations.
 */

import { redirect } from "next/navigation";
import { getCurrentUser } from "../auth/session";
import { findTenantBySlug } from "../db/tenants";
import { getUserTenantMembership } from "../db/users";
import { query } from "../db";
import {
  createCustomer,
  createCheckoutSession,
  createPortalSession,
  PLAN_CONFIG,
  type PlanId,
} from "../billing";

export interface BillingActionResult {
  success: boolean;
  error?: string;
}

/**
 * Upgrade to a paid plan.
 */
export async function upgradePlanAction(
  tenantSlug: string,
  planId: PlanId
): Promise<BillingActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "You must be signed in" };
  }

  const tenant = await findTenantBySlug(tenantSlug);
  if (!tenant) {
    return { success: false, error: "Organization not found" };
  }

  // Only owner can manage billing
  const membership = await getUserTenantMembership(user.id, tenant.id);
  if (membership?.role !== "owner") {
    return { success: false, error: "Only the owner can manage billing" };
  }

  const planConfig = PLAN_CONFIG[planId];
  if (!planConfig || !planConfig.priceId) {
    return { success: false, error: "Invalid plan" };
  }

  try {
    // Get or create Stripe customer ID
    let customerId: string | undefined = tenant.settings.stripeCustomerId;

    if (!customerId) {
      const newCustomerId = await createCustomer({
        tenantId: tenant.id,
        tenantName: tenant.name,
        email: user.email,
      });

      if (!newCustomerId) {
        return { success: false, error: "Failed to create billing account" };
      }
      customerId = newCustomerId;

      // Save customer ID to tenant settings
      await query(async (sql) => {
        return sql`
          UPDATE tenants
          SET settings = settings || ${JSON.stringify({ stripeCustomerId: customerId })}::jsonb,
              updated_at = now()
          WHERE id = ${tenant.id}::uuid
        `;
      });
    }

    // Create checkout session
    const result = await createCheckoutSession({
      customerId,
      priceId: planConfig.priceId,
      tenantSlug,
      tenantId: tenant.id,
    });

    if (!result.success || !result.url) {
      return { success: false, error: result.error ?? "Failed to create checkout" };
    }

    // Redirect to Stripe checkout
    redirect(result.url);
  } catch (error) {
    // redirect() throws, so check if it's that
    if ((error as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Upgrade plan error:", error);
    return { success: false, error: "Failed to start upgrade" };
  }
}

/**
 * Open billing portal for managing subscription.
 */
export async function openBillingPortalAction(
  tenantSlug: string
): Promise<BillingActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "You must be signed in" };
  }

  const tenant = await findTenantBySlug(tenantSlug);
  if (!tenant) {
    return { success: false, error: "Organization not found" };
  }

  // Only owner can manage billing
  const membership = await getUserTenantMembership(user.id, tenant.id);
  if (membership?.role !== "owner") {
    return { success: false, error: "Only the owner can manage billing" };
  }

  const customerId = tenant.settings.stripeCustomerId;
  if (!customerId) {
    return { success: false, error: "No billing account found" };
  }

  try {
    const result = await createPortalSession({
      customerId,
      tenantSlug,
    });

    if (!result.success || !result.url) {
      return { success: false, error: result.error ?? "Failed to open portal" };
    }

    redirect(result.url);
  } catch (error) {
    // redirect() throws, so check if it's that
    if ((error as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Open billing portal error:", error);
    return { success: false, error: "Failed to open billing portal" };
  }
}
