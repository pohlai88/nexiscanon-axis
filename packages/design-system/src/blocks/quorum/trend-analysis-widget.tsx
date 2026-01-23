"use client"

/**
 * Trend Analysis Widget - Quorum Kernel Component
 *
 * Visualize trends over time with comparative analysis.
 * Implements A01-CANONICAL.md §4 — "Surface the truth before they ask"
 *
 * Features:
 * - Multi-period comparison
 * - Trend direction indicators
 * - Sparkline visualizations
 * - Anomaly highlighting
 * - Drill-down to details
 *
 * @example
 * ```tsx
 * import { TrendAnalysisWidget } from "@workspace/design-system"
 *
 * <TrendAnalysisWidget
 *   metrics={trendData}
 *   periods={["This Month", "Last Month", "Last Year"]}
 *   onDrillDown={(metricId, period) => viewDetails(metricId, period)}
 * />
 * ```
 */

import * as React from "react"
import { cn } from "../../lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/card"
import { Button } from "../../components/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/tooltip"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Calendar,
  RefreshCw,
  Download,
  Sparkles,
  ChevronRight,
} from "lucide-react"

// ============================================================================
// Types (TrendDirection imported from shared types to avoid conflicts)
// ============================================================================

import type { TrendDirection } from "../types"

export interface TrendDataPoint {
  period: string
  value: number
  label?: string
}

export interface TrendMetric {
  id: string
  name: string
  description?: string
  currentValue: number
  formattedValue: string
  unit?: string
  trend: {
    direction: TrendDirection
    percentage: number
    isPositive: boolean // Whether this direction is good (e.g., revenue up = good, costs up = bad)
  }
  dataPoints: TrendDataPoint[]
  comparisons?: {
    period: string
    value: number
    formattedValue: string
    change: number
  }[]
  anomaly?: {
    detected: boolean
    message: string
    severity: "info" | "warning" | "critical"
  }
  aiInsight?: string
}

export interface TrendAnalysisWidgetProps {
  /** Trend metrics data */
  metrics: TrendMetric[]
  /** Available comparison periods */
  periods?: string[]
  /** Selected comparison period */
  selectedPeriod?: string
  /** Period change callback */
  onPeriodChange?: (period: string) => void
  /** Drill-down callback */
  onDrillDown?: (metricId: string, period?: string) => void
  /** Refresh callback */
  onRefresh?: () => Promise<void>
  /** Export callback */
  onExport?: (format: "csv" | "pdf") => void
  /** Show AI insights */
  showAIInsights?: boolean
  /** Compact mode */
  compact?: boolean
  /** Custom className */
  className?: string
}

// ============================================================================
// Helper Components
// ============================================================================

function MiniSparkline({
  dataPoints,
  trend,
  width = 80,
  height = 24,
}: {
  dataPoints: TrendDataPoint[]
  trend: TrendMetric["trend"]
  width?: number
  height?: number
}) {
  if (!dataPoints || dataPoints.length < 2) return null

  const values = dataPoints.map((d) => d.value)
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = max - min || 1

  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width
      const y = height - ((value - min) / range) * height
      return `${x},${y}`
    })
    .join(" ")

  const color = trend.isPositive
    ? trend.direction === "up"
      ? "#22c55e"
      : trend.direction === "down"
      ? "#ef4444"
      : "#6b7280"
    : trend.direction === "up"
    ? "#ef4444"
    : trend.direction === "down"
    ? "#22c55e"
    : "#6b7280"

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End point dot */}
      <circle
        cx={width}
        cy={height - ((values[values.length - 1] - min) / range) * height}
        r="3"
        fill={color}
      />
    </svg>
  )
}

function TrendIndicator({
  direction,
  percentage,
  isPositive,
  size = "default",
}: {
  direction: TrendDirection
  percentage: number
  isPositive: boolean
  size?: "sm" | "default" | "lg"
}) {
  const Icon = direction === "up" ? TrendingUp : direction === "down" ? TrendingDown : Minus

  const isGood = (direction === "up" && isPositive) || (direction === "down" && !isPositive)
  const isBad = (direction === "up" && !isPositive) || (direction === "down" && isPositive)

  const sizes = {
    sm: { icon: "h-3 w-3", text: "text-xs", padding: "px-1.5 py-0.5" },
    default: { icon: "h-4 w-4", text: "text-sm", padding: "px-2 py-1" },
    lg: { icon: "h-5 w-5", text: "text-base", padding: "px-3 py-1.5" },
  }

  const s = sizes[size]

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md font-medium",
        s.padding,
        s.text,
        isGood && "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
        isBad && "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
        !isGood && !isBad && "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
      )}
    >
      <Icon className={s.icon} />
      {percentage !== 0 && (
        <>
          {percentage > 0 ? "+" : ""}
          {percentage.toFixed(1)}%
        </>
      )}
      {percentage === 0 && "No change"}
    </span>
  )
}

function AnomalyBadge({ anomaly }: { anomaly: TrendMetric["anomaly"] }) {
  if (!anomaly?.detected) return null

  const colors = {
    info: "bg-blue-100 text-blue-700 border-blue-300",
    warning: "bg-amber-100 text-amber-700 border-amber-300",
    critical: "bg-red-100 text-red-700 border-red-300 animate-pulse",
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium",
              colors[anomaly.severity]
            )}
          >
            <AlertTriangle className="h-3 w-3" />
            Anomaly
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{anomaly.message}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// ============================================================================
// Metric Card
// ============================================================================

function MetricCard({
  metric,
  onDrillDown,
  showAIInsights,
  compact,
}: {
  metric: TrendMetric
  onDrillDown?: (metricId: string, period?: string) => void
  showAIInsights: boolean
  compact: boolean
}) {
  return (
    <Card
      className={cn(
        "transition-all",
        onDrillDown && "cursor-pointer hover:shadow-md hover:border-primary/50"
      )}
      onClick={() => onDrillDown?.(metric.id)}
    >
      <CardContent className={cn("pt-4", compact ? "pb-3" : "pb-4")}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-medium text-sm text-muted-foreground">{metric.name}</h4>
              <AnomalyBadge anomaly={metric.anomaly} />
            </div>

            {/* Value */}
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold">{metric.formattedValue}</span>
              {metric.unit && (
                <span className="text-sm text-muted-foreground">{metric.unit}</span>
              )}
            </div>

            {/* Trend */}
            <div className="mt-2 flex items-center gap-3">
              <TrendIndicator
                direction={metric.trend.direction}
                percentage={metric.trend.percentage}
                isPositive={metric.trend.isPositive}
                size="sm"
              />
            </div>

            {/* Comparisons */}
            {!compact && metric.comparisons && metric.comparisons.length > 0 && (
              <div className="mt-3 space-y-1">
                {metric.comparisons.slice(0, 2).map((comparison) => (
                  <div
                    key={comparison.period}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-muted-foreground">{comparison.period}:</span>
                    <span className="font-medium">
                      {comparison.formattedValue}
                      <span
                        className={cn(
                          "ml-1",
                          comparison.change > 0 ? "text-green-600" : comparison.change < 0 ? "text-red-600" : "text-muted-foreground"
                        )}
                      >
                        ({comparison.change > 0 ? "+" : ""}
                        {comparison.change.toFixed(1)}%)
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* AI Insight */}
            {showAIInsights && metric.aiInsight && !compact && (
              <div className="mt-3 rounded-lg bg-primary/5 p-2 text-xs">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">{metric.aiInsight}</p>
                </div>
              </div>
            )}
          </div>

          {/* Sparkline */}
          <div className="shrink-0">
            <MiniSparkline dataPoints={metric.dataPoints} trend={metric.trend} />
          </div>
        </div>

        {/* Drill-down indicator */}
        {onDrillDown && (
          <div className="mt-3 flex items-center justify-end text-xs text-muted-foreground">
            <span>View details</span>
            <ChevronRight className="h-3 w-3 ml-1" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function TrendAnalysisWidget({
  metrics,
  periods = ["This Week", "This Month", "This Quarter", "This Year"],
  selectedPeriod = "This Month",
  onPeriodChange,
  onDrillDown,
  onRefresh,
  onExport,
  showAIInsights = true,
  compact = false,
  className,
}: TrendAnalysisWidgetProps) {
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [localPeriod, setLocalPeriod] = React.useState(selectedPeriod)

  const handlePeriodChange = (period: string | null) => {
    if (!period) return
    setLocalPeriod(period)
    onPeriodChange?.(period)
  }

  const handleRefresh = async () => {
    if (!onRefresh) return
    setIsRefreshing(true)
    try {
      await onRefresh()
    } finally {
      setIsRefreshing(false)
    }
  }

  // Summary stats
  const upTrends = metrics.filter((m) => m.trend.direction === "up").length
  const downTrends = metrics.filter((m) => m.trend.direction === "down").length
  const anomalies = metrics.filter((m) => m.anomaly?.detected).length

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Trend Analysis
            </CardTitle>
            <CardDescription>
              {metrics.length} metric{metrics.length !== 1 ? "s" : ""} •{" "}
              <span className="text-green-600">{upTrends} up</span> •{" "}
              <span className="text-red-600">{downTrends} down</span>
              {anomalies > 0 && (
                <>
                  {" "}
                  • <span className="text-amber-600">{anomalies} anomal{anomalies !== 1 ? "ies" : "y"}</span>
                </>
              )}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={localPeriod} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-[140px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periods.map((period) => (
                  <SelectItem key={period} value={period}>
                    {period}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
              </Button>
            )}
            {onExport && (
              <Button variant="outline" size="sm" onClick={() => onExport("csv")}>
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {metrics.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 font-semibold">No trend data</h3>
            <p className="text-sm text-muted-foreground">
              Configure metrics to track trends over time
            </p>
          </div>
        ) : (
          <div className={cn("grid gap-4", compact ? "md:grid-cols-3" : "md:grid-cols-2")}>
            {metrics.map((metric) => (
              <MetricCard
                key={metric.id}
                metric={metric}
                onDrillDown={onDrillDown}
                showAIInsights={showAIInsights}
                compact={compact}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Exports
// ============================================================================

export type { TrendDataPoint, TrendMetric }
// TrendDirection is re-exported from blocks/types.ts
