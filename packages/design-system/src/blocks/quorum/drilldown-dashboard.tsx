"use client"

/**
 * Drilldown Dashboard - Quorum Kernel Component
 *
 * Interactive dashboard with click-to-drill-down functionality.
 * Implements A01-CANONICAL.md §4 — "Surface the truth before they ask"
 *
 * Features:
 * - KPI cards with drill-down
 * - Breadcrumb navigation for drill path
 * - Compare periods
 * - Trend sparklines
 * - Export functionality
 *
 * @example
 * ```tsx
 * import { DrilldownDashboard } from "@workspace/design-system"
 *
 * <DrilldownDashboard
 *   kpis={kpiData}
 *   onDrillDown={(kpiId, dimension) => loadDetails(kpiId, dimension)}
 *   onExport={(kpiId) => exportData(kpiId)}
 * />
 * ```
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/card"
import { Badge } from "@/components/badge"
import { Button } from "@/components/button"
import { Progress } from "@/components/progress"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/tooltip"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  Download,
  RefreshCw,
  MoreVertical,
  ArrowLeft,
  Loader2,
  Sparkles,
  Target,
  ChevronDown,
} from "lucide-react"

// ============================================================================
// Types (TrendDirection imported from shared types to avoid conflicts)
// ============================================================================

import type { TrendDirection } from "../types"

export type KPIStatus = "on_track" | "at_risk" | "off_track" | "achieved"

export interface DrillDimension {
  id: string
  label: string
  type: "time" | "category" | "entity" | "location" | "custom"
}

export interface SparklineData {
  values: number[]
  labels?: string[]
}

export interface KPIData {
  id: string
  name: string
  value: number | string
  formattedValue: string
  previousValue?: number | string
  target?: number | string
  formattedTarget?: string
  unit?: string
  trend?: {
    direction: TrendDirection
    percentage: number
    period: string
  }
  status?: KPIStatus
  sparkline?: SparklineData
  drillDimensions?: DrillDimension[]
  description?: string
  lastUpdated?: string | Date
  isLoading?: boolean
  aiInsight?: string
}

export interface DrilldownLevel {
  kpiId: string
  dimensionId: string
  dimensionValue: string
  label: string
}

export interface DrilldownDashboardProps {
  /** KPI data */
  kpis: KPIData[]
  /** Drill down callback - returns new KPIs for the drill level */
  onDrillDown?: (kpiId: string, dimension: DrillDimension, currentPath: DrilldownLevel[]) => Promise<KPIData[]>
  /** Export callback */
  onExport?: (kpiId: string, format: "csv" | "excel" | "pdf") => void
  /** Refresh callback */
  onRefresh?: (kpiId?: string) => Promise<void>
  /** Current drill path */
  drillPath?: DrilldownLevel[]
  /** Title */
  title?: string
  /** Description */
  description?: string
  /** Show AI insights */
  showAIInsights?: boolean
  /** Grid columns */
  columns?: 2 | 3 | 4
  /** Custom className */
  className?: string
}

// ============================================================================
// Constants
// ============================================================================

const STATUS_CONFIG: Record<
  KPIStatus,
  { color: string; bgColor: string; label: string }
> = {
  on_track: { color: "text-green-600", bgColor: "bg-green-100", label: "On Track" },
  at_risk: { color: "text-amber-600", bgColor: "bg-amber-100", label: "At Risk" },
  off_track: { color: "text-red-600", bgColor: "bg-red-100", label: "Off Track" },
  achieved: { color: "text-blue-600", bgColor: "bg-blue-100", label: "Achieved" },
}

// ============================================================================
// Helper Components
// ============================================================================

function TrendIndicator({ trend }: { trend: KPIData["trend"] }) {
  if (!trend) return null

  const Icon =
    trend.direction === "up"
      ? TrendingUp
      : trend.direction === "down"
      ? TrendingDown
      : Minus

  const isPositive = trend.direction === "up"
  const isNegative = trend.direction === "down"

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div
            className={cn(
              "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium",
              isPositive && "bg-green-100 text-green-700",
              isNegative && "bg-red-100 text-red-700",
              !isPositive && !isNegative && "bg-gray-100 text-gray-700"
            )}
          >
            <Icon className="h-3 w-3" />
            {trend.percentage > 0 ? "+" : ""}
            {trend.percentage}%
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {trend.direction === "up" ? "Increased" : trend.direction === "down" ? "Decreased" : "No change"}{" "}
            {trend.percentage}% vs {trend.period}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function StatusBadge({ status }: { status?: KPIStatus }) {
  if (!status) return null
  const config = STATUS_CONFIG[status]
  return (
    <Badge className={cn("text-xs", config.bgColor, config.color, "border-0")}>
      {config.label}
    </Badge>
  )
}

function MiniSparkline({ data }: { data: SparklineData }) {
  const { values } = data
  if (!values || values.length === 0) return null

  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = max - min || 1

  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100
      const y = 100 - ((value - min) / range) * 100
      return `${x},${y}`
    })
    .join(" ")

  const isPositive = values[values.length - 1] >= values[0]

  return (
    <svg className="h-8 w-24" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={isPositive ? "#22c55e" : "#ef4444"}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ProgressToTarget({ value, target }: { value: number; target: number }) {
  const percentage = Math.min((value / target) * 100, 100)
  const isComplete = value >= target

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">Target</span>
        <span className={cn(isComplete ? "text-green-600" : "text-muted-foreground")}>
          {percentage.toFixed(0)}%
        </span>
      </div>
      <Progress
        value={percentage}
        className={cn("h-1.5", isComplete && "[&>div]:bg-green-500")}
      />
    </div>
  )
}

// ============================================================================
// KPI Card
// ============================================================================

function KPICard({
  kpi,
  onDrillDown,
  onExport,
  onRefresh,
  showAIInsights,
}: {
  kpi: KPIData
  onDrillDown?: (dimension: DrillDimension) => void
  onExport?: (format: "csv" | "excel" | "pdf") => void
  onRefresh?: () => Promise<void>
  showAIInsights: boolean
}) {
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [showDrillMenu, setShowDrillMenu] = React.useState(false)

  const hasDrillDown = kpi.drillDimensions && kpi.drillDimensions.length > 0
  const numericValue = typeof kpi.value === "number" ? kpi.value : parseFloat(String(kpi.value))
  const numericTarget = typeof kpi.target === "number" ? kpi.target : kpi.target ? parseFloat(String(kpi.target)) : undefined

  const handleRefresh = async () => {
    if (!onRefresh) return
    setIsRefreshing(true)
    try {
      await onRefresh()
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <Card
      className={cn(
        "transition-all",
        hasDrillDown && "cursor-pointer hover:shadow-lg hover:border-primary/50",
        kpi.isLoading && "opacity-50"
      )}
      onClick={() => {
        if (hasDrillDown && kpi.drillDimensions!.length === 1) {
          onDrillDown?.(kpi.drillDimensions![0])
        } else if (hasDrillDown) {
          setShowDrillMenu(true)
        }
      }}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {kpi.name}
            </CardTitle>
            {kpi.description && (
              <CardDescription className="text-xs mt-0.5 line-clamp-1">
                {kpi.description}
              </CardDescription>
            )}
          </div>
          <div className="flex items-center gap-1">
            <StatusBadge status={kpi.status} />
            <DropdownMenu>
              <DropdownMenuTrigger onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onRefresh && (
                  <DropdownMenuItem onClick={handleRefresh}>
                    <RefreshCw className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")} />
                    Refresh
                  </DropdownMenuItem>
                )}
                {onExport && (
                  <>
                    <DropdownMenuItem onClick={() => onExport("csv")}>
                      <Download className="mr-2 h-4 w-4" />
                      Export CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onExport("excel")}>
                      <Download className="mr-2 h-4 w-4" />
                      Export Excel
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">
                {kpi.isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  kpi.formattedValue
                )}
              </span>
              {kpi.unit && (
                <span className="text-sm text-muted-foreground">{kpi.unit}</span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <TrendIndicator trend={kpi.trend} />
              {kpi.formattedTarget && (
                <span className="text-xs text-muted-foreground">
                  Target: {kpi.formattedTarget}
                </span>
              )}
            </div>
          </div>
          {kpi.sparkline && <MiniSparkline data={kpi.sparkline} />}
        </div>

        {/* Progress to Target */}
        {!isNaN(numericValue) && numericTarget && (
          <div className="mt-3">
            <ProgressToTarget value={numericValue} target={numericTarget} />
          </div>
        )}

        {/* AI Insight */}
        {showAIInsights && kpi.aiInsight && (
          <div className="mt-3 rounded-lg bg-primary/5 p-2 text-xs">
            <div className="flex items-start gap-2">
              <Sparkles className="h-3 w-3 text-primary shrink-0 mt-0.5" />
              <p className="text-muted-foreground">{kpi.aiInsight}</p>
            </div>
          </div>
        )}

        {/* Drill Down Indicator */}
        {hasDrillDown && (
          <div className="mt-3 flex items-center justify-between border-t pt-2">
            <span className="text-xs text-muted-foreground">
              Drill by: {kpi.drillDimensions!.map((d) => d.label).join(", ")}
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        )}

        {/* Drill Menu for multiple dimensions */}
        {showDrillMenu && hasDrillDown && kpi.drillDimensions!.length > 1 && (
          <div className="mt-2 space-y-1">
            {kpi.drillDimensions!.map((dimension) => (
              <Button
                key={dimension.id}
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={(e) => {
                  e.stopPropagation()
                  onDrillDown?.(dimension)
                  setShowDrillMenu(false)
                }}
              >
                <ChevronDown className="mr-2 h-3 w-3" />
                By {dimension.label}
              </Button>
            ))}
          </div>
        )}

        {/* Last Updated */}
        {kpi.lastUpdated && (
          <div className="mt-2 text-xs text-muted-foreground">
            Updated: {new Date(kpi.lastUpdated).toLocaleString()}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function DrilldownDashboard({
  kpis,
  onDrillDown,
  onExport,
  onRefresh,
  drillPath = [],
  title = "Dashboard",
  description,
  showAIInsights = true,
  columns = 4,
  className,
}: DrilldownDashboardProps) {
  const [currentKPIs, setCurrentKPIs] = React.useState<KPIData[]>(kpis)
  const [localDrillPath, setLocalDrillPath] = React.useState<DrilldownLevel[]>(drillPath)
  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
    setCurrentKPIs(kpis)
  }, [kpis])

  const handleDrillDown = async (kpiId: string, dimension: DrillDimension) => {
    if (!onDrillDown) return

    setIsLoading(true)
    try {
      const newKPIs = await onDrillDown(kpiId, dimension, localDrillPath)
      setCurrentKPIs(newKPIs)
      setLocalDrillPath((prev) => [
        ...prev,
        {
          kpiId,
          dimensionId: dimension.id,
          dimensionValue: dimension.label,
          label: `${kpis.find((k) => k.id === kpiId)?.name || kpiId} by ${dimension.label}`,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleNavigateBack = (index: number) => {
    if (index === -1) {
      // Go to root
      setLocalDrillPath([])
      setCurrentKPIs(kpis)
    } else {
      // Go to specific level
      setLocalDrillPath((prev) => prev.slice(0, index + 1))
      // Would need to reload data for this level - simplified for now
    }
  }

  const handleRefreshAll = async () => {
    if (!onRefresh) return
    setIsLoading(true)
    try {
      await onRefresh()
    } finally {
      setIsLoading(false)
    }
  }

  const gridCols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-2 lg:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {localDrillPath.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleNavigateBack(-1)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              {title}
            </CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshAll}
                disabled={isLoading}
              >
                <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} />
                Refresh All
              </Button>
            )}
          </div>
        </div>

        {/* Breadcrumb */}
        {localDrillPath.length > 0 && (
          <Breadcrumb className="mt-2">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  className="cursor-pointer"
                  onClick={() => handleNavigateBack(-1)}
                >
                  Overview
                </BreadcrumbLink>
              </BreadcrumbItem>
              {localDrillPath.map((level, index) => (
                <React.Fragment key={index}>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {index === localDrillPath.length - 1 ? (
                      <BreadcrumbPage>{level.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        className="cursor-pointer"
                        onClick={() => handleNavigateBack(index)}
                      >
                        {level.label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : currentKPIs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Target className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 font-semibold">No KPIs configured</h3>
            <p className="text-sm text-muted-foreground">
              Add KPIs to display metrics on this dashboard
            </p>
          </div>
        ) : (
          <div className={cn("grid gap-4", gridCols[columns])}>
            {currentKPIs.map((kpi) => (
              <KPICard
                key={kpi.id}
                kpi={kpi}
                onDrillDown={(dimension) => handleDrillDown(kpi.id, dimension)}
                onExport={onExport ? (format) => onExport(kpi.id, format) : undefined}
                onRefresh={onRefresh ? () => onRefresh(kpi.id) : undefined}
                showAIInsights={showAIInsights}
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

export type { KPIStatus, DrillDimension, SparklineData, KPIData, DrilldownLevel }
// TrendDirection is re-exported from blocks/types.ts
