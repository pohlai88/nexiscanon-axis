import Link from "next/link";
import { findTenantBySlug } from "@/lib/db/tenants";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserTenantMembership } from "@/lib/db/users";
import { notFound, redirect } from "next/navigation";
import { UpgradeButton, ManageBillingButton } from "./billing-buttons";

interface BillingPageProps {
  params: Promise<{ tenant: string }>;
}

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    features: [
      "Up to 3 team members",
      "Basic features",
      "Community support",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    price: "$29",
    period: "per month",
    features: [
      "Up to 10 team members",
      "All free features",
      "Priority support",
      "API access",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    price: "$99",
    period: "per month",
    features: [
      "Unlimited team members",
      "All starter features",
      "Advanced analytics",
      "Custom integrations",
      "SLA guarantee",
    ],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    period: "contact us",
    features: [
      "Everything in Professional",
      "Dedicated support",
      "Custom contracts",
      "On-premise deployment",
      "SSO/SAML",
    ],
  },
] as const;

export default async function BillingPage({ params }: BillingPageProps) {
  const { tenant: slug } = await params;

  const [tenant, user] = await Promise.all([
    findTenantBySlug(slug),
    getCurrentUser(),
  ]);

  if (!tenant) {
    notFound();
  }

  if (!user) {
    redirect("/login");
  }

  const membership = await getUserTenantMembership(user.id, tenant.id);

  // Only owners can access billing
  if (membership?.role !== "owner") {
    redirect(`/${slug}/settings`);
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Billing & Plans</h1>
        <p className="text-[var(--muted-foreground)]">
          Manage your subscription and billing details
        </p>
      </div>

      {/* Current Plan */}
      <div className="bg-[var(--muted)] rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold mb-2">Current Plan</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold capitalize">{tenant.plan}</p>
            <p className="text-sm text-[var(--muted-foreground)]">
              {tenant.plan === "free"
                ? "Free forever"
                : "Billed monthly"}
            </p>
          </div>
          <ManageBillingButton
            tenantSlug={slug}
            hasSubscription={tenant.plan !== "free"}
          />
        </div>
      </div>

      {/* Plan Comparison */}
      <h2 className="text-lg font-semibold mb-4">Available Plans</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`border rounded-lg p-6 relative ${
              plan.id === tenant.plan
                ? "border-[var(--primary)] bg-[var(--primary)]/5"
                : "border-[var(--border)]"
            } ${"popular" in plan && plan.popular ? "ring-2 ring-[var(--primary)]" : ""}`}
          >
            {"popular" in plan && plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--primary)] text-[var(--primary-foreground)] text-xs px-3 py-1 rounded-full">
                Most Popular
              </span>
            )}
            <h3 className="text-lg font-semibold">{plan.name}</h3>
            <div className="mt-2 mb-4">
              <span className="text-3xl font-bold">{plan.price}</span>
              <span className="text-sm text-[var(--muted-foreground)]">
                /{plan.period}
              </span>
            </div>
            <ul className="space-y-2 mb-6">
              {plan.features.map((feature) => (
                <li
                  key={feature}
                  className="text-sm text-[var(--muted-foreground)] flex items-start gap-2"
                >
                  <svg
                    className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            {plan.id === "enterprise" ? (
              <Link
                href={`/${slug}/settings/billing/contact`}
                className="block w-full py-2 px-4 text-center border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors duration-200"
              >
                Contact Sales
              </Link>
            ) : (
              <UpgradeButton
                tenantSlug={slug}
                planId={plan.id}
                currentPlan={tenant.plan}
              />
            )}
          </div>
        ))}
      </div>

      {/* Billing History */}
      <div className="border border-[var(--border)] rounded-lg">
        <div className="p-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-semibold">Billing History</h2>
        </div>
        <div className="p-8 text-center text-[var(--muted-foreground)]">
          No billing history yet.
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-8 pt-6 border-t border-[var(--border)]">
        <Link
          href={`/${slug}/settings`}
          className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors duration-200"
        >
          ← Back to Settings
        </Link>
      </div>
    </div>
  );
}
