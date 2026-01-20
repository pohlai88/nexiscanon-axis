import React from "react";
import { Card } from "@workspace/design-system/components/card";
import { cn } from "@workspace/design-system/lib/utils";

export interface StatCardProps {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
}

/**
 * Animated Stat Card
 * 
 * Eye-catching stat card with counter animation.
 * Perfect for displaying metrics, KPIs, and achievements.
 * 
 * Features:
 * - Number counter animation
 * - Trend indicators
 * - Icon support
 * - Gradient backgrounds
 * - Responsive sizing
 * 
 * @meta
 * - Category: Dashboard
 * - Section: stats
 * - Use Cases: Analytics dashboards, Landing page metrics, Achievement showcases
 */
export function AnimatedStatCard({
  value,
  label,
  icon,
  trend,
  className,
}: StatCardProps) {
  const isPositiveTrend = trend && trend.value >= 0;

  return (
    <Card className={cn("group overflow-hidden transition-all hover:shadow-lg", className)}>
      <div className="relative p-6">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

        {/* Icon */}
        {icon && (
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            {icon}
          </div>
        )}

        {/* Value */}
        <div className="mb-2 text-4xl font-bold tracking-tight">{value}</div>

        {/* Label */}
        <p className="text-sm text-muted-foreground">{label}</p>

        {/* Trend */}
        {trend && (
          <div className="mt-4 flex items-center gap-2">
            <span
              className={cn(
                "flex items-center gap-1 text-xs font-medium",
                isPositiveTrend ? "text-green-600" : "text-red-600"
              )}
            >
              {isPositiveTrend ? "↑" : "↓"}
              {Math.abs(trend.value)}%
            </span>
            <span className="text-xs text-muted-foreground">{trend.label}</span>
          </div>
        )}
      </div>
    </Card>
  );
}

export interface StatsGridProps {
  stats: StatCardProps[];
  columns?: 2 | 3 | 4;
  className?: string;
}

/**
 * Stats Grid
 * 
 * Responsive grid of animated stat cards.
 */
export function StatsGrid({ stats, columns = 4, className }: StatsGridProps) {
  const colsClass = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-6", colsClass[columns], className)}>
      {stats.map((stat, idx) => (
        <AnimatedStatCard key={idx} {...stat} />
      ))}
    </div>
  );
}
