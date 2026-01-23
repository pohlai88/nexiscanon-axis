"use client";

import type { ReactNode } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@workspace/design-system/lib/utils";

/**
 * AFANDA Metric Card Widget
 *
 * Displays a single KPI with value, label, trend, and optional sparkline.
 *
 * @see AFANDA.md §5.2 Dashboard Widgets
 * @see B11-AFANDA.md §4.2 Widget Type Configurations
 */

export interface MetricCardProps {
  /** Metric label/title */
  label: string;
  /** Current value (formatted) */
  value: string | number;
  /** Trend direction */
  trend?: "up" | "down" | "neutral";
  /** Change amount/percentage */
  change?: string;
  /** Whether up trend is good (default: true) */
  upIsGood?: boolean;
  /** Optional icon */
  icon?: ReactNode;
  /** Optional description */
  description?: string;
  /** Additional CSS classes */
  className?: string;
}

export function MetricCard({
  label,
  value,
  trend = "neutral",
  change,
  upIsGood = true,
  icon,
  description,
  className,
}: MetricCardProps) {
  // Determine if the trend is positive based on direction and whether up is good
  const isPositive =
    trend === "neutral" ? null : trend === "up" ? upIsGood : !upIsGood;

  return (
    <div
      className={cn(
        "afanda-widget rounded-xl border border-border bg-card/60 p-4 backdrop-blur-sm transition-all duration-300 hover:bg-card/80 hover:shadow-md",
        className
      )}
    >
      <div className="afanda-widget-header mb-3 flex items-center justify-between">
        <span className="afanda-metric-label text-sm font-medium text-muted-foreground">
          {label}
        </span>
        {icon && (
          <span className="afanda-widget-action text-muted-foreground">
            {icon}
          </span>
        )}
      </div>

      <div className="afanda-metric flex flex-col gap-1">
        <span className="afanda-metric-value text-3xl font-bold tracking-tight text-foreground">
          {value}
        </span>

        {change && (
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "afanda-metric-trend inline-flex items-center gap-1 text-sm font-medium",
                isPositive === true && "text-green-500",
                isPositive === false && "text-red-500",
                isPositive === null && "text-muted-foreground"
              )}
              data-trend={trend}
            >
              {trend === "up" && <TrendingUp className="h-3.5 w-3.5" />}
              {trend === "down" && <TrendingDown className="h-3.5 w-3.5" />}
              {trend === "neutral" && <Minus className="h-3.5 w-3.5" />}
              {change}
            </span>
            {description && (
              <span className="text-xs text-muted-foreground">
                {description}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Metric Card Group
 *
 * A responsive grid of metric cards.
 */
export interface MetricCardGroupProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function MetricCardGroup({
  children,
  columns = 4,
  className,
}: MetricCardGroupProps) {
  const gridClass = {
    2: "afanda-grid-2",
    3: "afanda-grid-3",
    4: "afanda-grid-4",
  }[columns];

  return <div className={cn(gridClass, className)}>{children}</div>;
}
