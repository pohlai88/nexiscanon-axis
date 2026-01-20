import React from "react";
import { Card } from "@workspace/design-system/components/card";
import { Badge } from "@workspace/design-system/components/badge";
import { Button } from "@workspace/design-system/components/button";
import { cn } from "@workspace/design-system/lib/utils";
import { ExternalLink } from "lucide-react";

export interface ComparisonFeature {
  feature: string;
  basic: boolean | string;
  pro: boolean | string;
  enterprise: boolean | string;
}

export interface ComparisonTableProps {
  features: ComparisonFeature[];
  tiers: {
    basic: { name: string; price: string; cta: { label: string; href: string } };
    pro: { name: string; price: string; cta: { label: string; href: string }; highlighted?: boolean };
    enterprise: { name: string; price: string; cta: { label: string; href: string } };
  };
  className?: string;
}

/**
 * Feature Comparison Table
 * 
 * Detailed feature comparison across pricing tiers.
 * Optimized for SaaS products and service comparisons.
 * 
 * Features:
 * - Clear visual hierarchy
 * - Highlighted recommended tier
 * - Boolean and text values
 * - Responsive stacking
 * - Sticky header on scroll
 * 
 * @meta
 * - Category: Marketing
 * - Section: comparison
 * - Use Cases: SaaS feature comparison, Plan differences, Product tiers
 */
export function ComparisonTable({ features, tiers, className }: ComparisonTableProps) {
  const renderValue = (value: boolean | string) => {
    if (typeof value === "boolean") {
      return value ? (
        <svg
          className="h-5 w-5 text-green-500"
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
      ) : (
        <svg
          className="h-5 w-5 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      );
    }
    return <span className="text-sm font-medium">{value}</span>;
  };

  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <table className="w-full border-collapse">
        {/* Header */}
        <thead className="sticky top-0 z-10 bg-background">
          <tr>
            <th className="border-b p-4 text-left">
              <span className="text-sm font-medium text-muted-foreground">Features</span>
            </th>
            <th className="border-b p-4 text-center">
              <div className="flex flex-col items-center gap-2">
                <span className="text-lg font-bold">{tiers.basic.name}</span>
                <span className="text-2xl font-bold">{tiers.basic.price}</span>
                <Button asChild variant="outline" size="sm">
                  <a href={tiers.basic.cta.href}>{tiers.basic.cta.label}</a>
                </Button>
              </div>
            </th>
            <th className="relative border-b p-4 text-center">
              {tiers.pro.highlighted && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                  Most Popular
                </Badge>
              )}
              <div className={cn(
                "flex flex-col items-center gap-2 rounded-lg p-4",
                tiers.pro.highlighted && "bg-primary/5 ring-2 ring-primary/20"
              )}>
                <span className="text-lg font-bold">{tiers.pro.name}</span>
                <span className="text-2xl font-bold">{tiers.pro.price}</span>
                <Button asChild size="sm">
                  <a href={tiers.pro.cta.href}>{tiers.pro.cta.label}</a>
                </Button>
              </div>
            </th>
            <th className="border-b p-4 text-center">
              <div className="flex flex-col items-center gap-2">
                <span className="text-lg font-bold">{tiers.enterprise.name}</span>
                <span className="text-2xl font-bold">{tiers.enterprise.price}</span>
                <Button asChild variant="outline" size="sm">
                  <a href={tiers.enterprise.cta.href}>{tiers.enterprise.cta.label}</a>
                </Button>
              </div>
            </th>
          </tr>
        </thead>

        {/* Features */}
        <tbody>
          {features.map((feature, idx) => (
            <tr
              key={idx}
              className="border-b transition-colors hover:bg-muted/50"
            >
              <td className="p-4">
                <span className="text-sm font-medium">{feature.feature}</span>
              </td>
              <td className="p-4 text-center">{renderValue(feature.basic)}</td>
              <td className={cn(
                "p-4 text-center",
                tiers.pro.highlighted && "bg-primary/5"
              )}>
                {renderValue(feature.pro)}
              </td>
              <td className="p-4 text-center">{renderValue(feature.enterprise)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
