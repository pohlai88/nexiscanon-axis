"use client";

/**
 * Billing action buttons.
 *
 * Pattern: Client components for billing actions.
 */

import { useTransition } from "react";
import { upgradePlanAction, openBillingPortalAction } from "@/lib/actions/billing";
import type { PlanId } from "@/lib/billing";

interface UpgradeButtonProps {
  tenantSlug: string;
  planId: PlanId;
  currentPlan: string;
  label?: string;
}

export function UpgradeButton({
  tenantSlug,
  planId,
  currentPlan,
  label,
}: UpgradeButtonProps) {
  const [isPending, startTransition] = useTransition();

  const isCurrentPlan = planId === currentPlan;
  const isDowngrade = getPlanOrder(planId) < getPlanOrder(currentPlan);

  const handleClick = () => {
    startTransition(async () => {
      await upgradePlanAction(tenantSlug, planId);
    });
  };

  if (isCurrentPlan) {
    return (
      <button
        disabled
        className="w-full py-2 px-4 bg-muted text-muted-foreground rounded-lg cursor-not-allowed"
      >
        Current Plan
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity duration-200 disabled:opacity-50"
    >
      {isPending ? "Loading..." : label ?? (isDowngrade ? "Downgrade" : "Upgrade")}
    </button>
  );
}

interface ManageBillingButtonProps {
  tenantSlug: string;
  hasSubscription: boolean;
}

export function ManageBillingButton({
  tenantSlug,
  hasSubscription,
}: ManageBillingButtonProps) {
  const [isPending, startTransition] = useTransition();

  if (!hasSubscription) {
    return null;
  }

  const handleClick = () => {
    startTransition(async () => {
      await openBillingPortalAction(tenantSlug);
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors duration-200 disabled:opacity-50"
    >
      {isPending ? "Loading..." : "Manage Subscription"}
    </button>
  );
}

function getPlanOrder(plan: string): number {
  const order: Record<string, number> = {
    free: 0,
    starter: 1,
    professional: 2,
    enterprise: 3,
  };
  return order[plan] ?? 0;
}
