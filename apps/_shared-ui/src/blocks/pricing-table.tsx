import React from "react";
import { Card } from "@workspace/design-system/components/card";
import { Badge } from "@workspace/design-system/components/badge";
import { Button } from "@workspace/design-system/components/button";
import { cn } from "@workspace/design-system/lib/utils";

export interface PricingTier {
  name: string;
  description: string;
  price: {
    monthly: number;
    annual?: number;
  };
  currency?: string;
  features: string[];
  highlighted?: boolean;
  cta: {
    label: string;
    href: string;
  };
  badge?: string;
}

export interface PricingTableProps {
  tiers: PricingTier[];
  billingPeriod?: "monthly" | "annual";
  onBillingChange?: (period: "monthly" | "annual") => void;
  className?: string;
}

/**
 * Pricing Table
 * 
 * Beautiful, responsive pricing table with tier comparison.
 * Optimized with design system components for consistency.
 * 
 * Features:
 * - Monthly/Annual toggle
 * - Highlighted popular tiers
 * - Responsive 3-column grid
 * - Hover animations
 * - Badge support for "Most Popular", "Best Value"
 * 
 * @meta
 * - Category: Marketing
 * - Section: pricing
 * - Use Cases: SaaS pricing, Product tiers, Subscription plans
 */
export function PricingTable({
  tiers,
  billingPeriod = "monthly",
  onBillingChange,
  className,
}: PricingTableProps) {
  return (
    <div className={cn("w-full", className)}>
      {/* Billing Toggle */}
      {onBillingChange && (
        <div className="mb-12 flex items-center justify-center gap-4">
          <span
            className={cn(
              "text-sm font-medium transition-colors",
              billingPeriod === "monthly"
                ? "text-foreground"
                : "text-muted-foreground"
            )}
          >
            Monthly
          </span>
          <button
            onClick={() =>
              onBillingChange(billingPeriod === "monthly" ? "annual" : "monthly")
            }
            className={cn(
              "relative h-6 w-11 rounded-full transition-colors",
              billingPeriod === "annual" ? "bg-primary" : "bg-muted"
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 h-5 w-5 rounded-full bg-background shadow-sm transition-transform",
                billingPeriod === "annual" ? "left-5" : "left-0.5"
              )}
            />
          </button>
          <span
            className={cn(
              "text-sm font-medium transition-colors",
              billingPeriod === "annual"
                ? "text-foreground"
                : "text-muted-foreground"
            )}
          >
            Annual
            <span className="ml-2 text-xs text-green-600">Save 20%</span>
          </span>
        </div>
      )}

      {/* Pricing Tiers Grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {tiers.map((tier, idx) => (
          <Card
            key={idx}
            className={cn(
              "relative flex flex-col transition-all hover:shadow-xl",
              tier.highlighted &&
                "scale-105 border-primary shadow-lg ring-2 ring-primary/20"
            )}
          >
            {/* Badge */}
            {tier.badge && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary px-4 py-1 text-xs font-medium">
                  {tier.badge}
                </Badge>
              </div>
            )}

            {/* Header */}
            <div className="border-b p-6">
              <h3 className="text-xl font-bold">{tier.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {tier.description}
              </p>
            </div>

            {/* Pricing */}
            <div className="p-6">
              <div className="flex items-baseline gap-1">
                <span className="text-sm text-muted-foreground">
                  {tier.currency || "$"}
                </span>
                <span className="text-4xl font-bold">
                  {billingPeriod === "annual" && tier.price.annual
                    ? tier.price.annual
                    : tier.price.monthly}
                </span>
                <span className="text-sm text-muted-foreground">
                  /{billingPeriod === "annual" ? "year" : "month"}
                </span>
              </div>
            </div>

            {/* Features */}
            <div className="flex-1 p-6 pt-0">
              <ul className="space-y-3">
                {tier.features.map((feature, featureIdx) => (
                  <li key={featureIdx} className="flex items-start gap-3 text-sm">
                    <svg
                      className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary"
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
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div className="p-6 pt-0">
              <Button
                asChild
                className="w-full"
                variant={tier.highlighted ? "default" : "outline"}
              >
                <a href={tier.cta.href}>{tier.cta.label}</a>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
