"use client"

/**
 * Exception Hunter - Quorum Kernel Component
 *
 * AI-powered exception detection and drill-down analysis.
 * Implements A01-CANONICAL.md §4 — "Surface the truth before they ask"
 *
 * Features:
 * - Automatic anomaly detection
 * - Severity classification
 * - Drill-down investigation
 * - Related exceptions grouping
 * - Action recommendations
 *
 * @example
 * ```tsx
 * import { ExceptionHunter } from "@workspace/design-system"
 *
 * <ExceptionHunter
 *   exceptions={detectedExceptions}
 *   onInvestigate={(id) => drillDown(id)}
 *   onResolve={(id, action) => resolveException(id, action)}
 * />
 * ```
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/card"
import { Badge } from "@/components/badge"
import { Button } from "@/components/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/tooltip"
import {
  AlertTriangle,
  AlertCircle,
  Info,
  XCircle,
  ChevronDown,
  ChevronRight,
  Search,
  Zap,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  CheckCircle,
  Eye,
  Flag,
  Clock,
  ArrowRight,
  Sparkles,
  FileText,
  Users,
  DollarSign,
} from "lucide-react"

// ============================================================================
// Types
// ============================================================================

export type ExceptionSeverity = "critical" | "high" | "medium" | "low" | "info"
export type ExceptionCategory = "financial" | "operational" | "compliance" | "security" | "data_quality"
export type ExceptionStatus = "open" | "investigating" | "resolved" | "dismissed"

export interface ExceptionTrend {
  direction: "up" | "down" | "stable"
  percentage: number
  period: string
}

export interface RelatedEntity {
  id: string
  type: string
  label: string
  href?: string
}

export interface SuggestedAction {
  id: string
  label: string
  description?: string
  type: "auto_fix" | "investigate" | "escalate" | "dismiss"
  confidence?: number
}

export interface Exception {
  id: string
  title: string
  description: string
  severity: ExceptionSeverity
  category: ExceptionCategory
  status: ExceptionStatus
  detectedAt: string | Date
  value?: number | string
  expectedValue?: number | string
  threshold?: number | string
  trend?: ExceptionTrend
  relatedEntities?: RelatedEntity[]
  suggestedActions?: SuggestedAction[]
  affectedCount?: number
  metadata?: Record<string, unknown>
}

export interface ExceptionHunterProps {
  /** List of detected exceptions */
  exceptions: Exception[]
  /** Investigate callback */
  onInvestigate?: (id: string) => void
  /** Resolve callback */
  onResolve?: (id: string, actionId: string) => Promise<void>
  /** Dismiss callback */
  onDismiss?: (id: string, reason?: string) => void
  /** Escalate callback */
  onEscalate?: (id: string) => void
  /** View entity callback */
  onViewEntity?: (entity: RelatedEntity) => void
  /** Show AI recommendations */
  showAIRecommendations?: boolean
  /** Filter by severity */
  severityFilter?: ExceptionSeverity[]
  /** Filter by category */
  categoryFilter?: ExceptionCategory[]
  /** Group by category */
  groupByCategory?: boolean
  /** Custom className */
  className?: string
}

// ============================================================================
// Constants
// ============================================================================

const SEVERITY_CONFIG: Record<
  ExceptionSeverity,
  {
    icon: React.ComponentType<{ className?: string }>
    color: string
    bgColor: string
    borderColor: string
    label: string
  }
> = {
  critical: {
    icon: XCircle,
    color: "text-red-700",
    bgColor: "bg-red-100 dark:bg-red-950",
    borderColor: "border-red-300 dark:border-red-800",
    label: "Critical",
  },
  high: {
    icon: AlertTriangle,
    color: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-950/50",
    borderColor: "border-red-200 dark:border-red-900",
    label: "High",
  },
  medium: {
    icon: AlertCircle,
    color: "text-amber-600",
    bgColor: "bg-amber-50 dark:bg-amber-950/50",
    borderColor: "border-amber-200 dark:border-amber-900",
    label: "Medium",
  },
  low: {
    icon: Info,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/50",
    borderColor: "border-blue-200 dark:border-blue-900",
    label: "Low",
  },
  info: {
    icon: Info,
    color: "text-gray-600",
    bgColor: "bg-gray-50 dark:bg-gray-900",
    borderColor: "border-gray-200 dark:border-gray-800",
    label: "Info",
  },
}

const CATEGORY_CONFIG: Record<ExceptionCategory, { icon: React.ComponentType<{ className?: string }>; label: string }> = {
  financial: { icon: DollarSign, label: "Financial" },
  operational: { icon: Zap, label: "Operational" },
  compliance: { icon: Flag, label: "Compliance" },
  security: { icon: AlertTriangle, label: "Security" },
  data_quality: { icon: FileText, label: "Data Quality" },
}

const STATUS_CONFIG: Record<ExceptionStatus, { color: string; label: string }> = {
  open: { color: "bg-red-100 text-red-700", label: "Open" },
  investigating: { color: "bg-amber-100 text-amber-700", label: "Investigating" },
  resolved: { color: "bg-green-100 text-green-700", label: "Resolved" },
  dismissed: { color: "bg-gray-100 text-gray-700", label: "Dismissed" },
}

// ============================================================================
// Sub-components
// ============================================================================

function SeverityBadge({ severity }: { severity: ExceptionSeverity }) {
  const config = SEVERITY_CONFIG[severity]
  const Icon = config.icon
  return (
    <Badge className={cn("gap-1", config.bgColor, config.color, "border-0")}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}

function TrendIndicator({ trend }: { trend: ExceptionTrend }) {
  const isUp = trend.direction === "up"
  const Icon = isUp ? TrendingUp : trend.direction === "down" ? TrendingDown : null

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <span
            className={cn(
              "inline-flex items-center gap-1 text-xs",
              isUp ? "text-red-600" : "text-green-600"
            )}
          >
            {Icon && <Icon className="h-3 w-3" />}
            {trend.percentage > 0 && (isUp ? "+" : "-")}
            {trend.percentage}%
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {isUp ? "Increased" : "Decreased"} {trend.percentage}% over {trend.period}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function ExceptionCard({
  exception,
  onInvestigate,
  onResolve,
  onDismiss,
  onEscalate,
  onViewEntity,
  showAIRecommendations,
}: {
  exception: Exception
  onInvestigate?: (id: string) => void
  onResolve?: (id: string, actionId: string) => Promise<void>
  onDismiss?: (id: string) => void
  onEscalate?: (id: string) => void
  onViewEntity?: (entity: RelatedEntity) => void
  showAIRecommendations: boolean
}) {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [isResolving, setIsResolving] = React.useState<string | null>(null)

  const severityConfig = SEVERITY_CONFIG[exception.severity]
  const categoryConfig = CATEGORY_CONFIG[exception.category]
  const CategoryIcon = categoryConfig.icon

  const handleResolve = async (actionId: string) => {
    if (!onResolve) return
    setIsResolving(actionId)
    try {
      await onResolve(exception.id, actionId)
    } finally {
      setIsResolving(null)
    }
  }

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <Card
        className={cn(
          "transition-all",
          severityConfig.borderColor,
          exception.severity === "critical" && "animate-pulse border-2"
        )}
      >
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start gap-3">
            <CollapsibleTrigger>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 shrink-0">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <SeverityBadge severity={exception.severity} />
                    <Badge variant="outline" className="gap-1">
                      <CategoryIcon className="h-3 w-3" />
                      {categoryConfig.label}
                    </Badge>
                    <Badge className={STATUS_CONFIG[exception.status].color}>
                      {STATUS_CONFIG[exception.status].label}
                    </Badge>
                    {exception.trend && <TrendIndicator trend={exception.trend} />}
                  </div>
                  <h4 className="mt-2 font-semibold">{exception.title}</h4>
                  <p className="text-sm text-muted-foreground">{exception.description}</p>
                </div>

                {/* Quick Stats */}
                <div className="text-right shrink-0">
                  {exception.value !== undefined && (
                    <div>
                      <span className="text-lg font-bold">{exception.value}</span>
                      {exception.expectedValue !== undefined && (
                        <span className="text-sm text-muted-foreground">
                          {" "}
                          / {exception.expectedValue}
                        </span>
                      )}
                    </div>
                  )}
                  {exception.affectedCount !== undefined && (
                    <p className="text-xs text-muted-foreground">
                      {exception.affectedCount} affected
                    </p>
                  )}
                </div>
              </div>

              {/* Meta Info */}
              <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(exception.detectedAt).toLocaleString()}
                </span>
                {exception.relatedEntities && exception.relatedEntities.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {exception.relatedEntities.length} related
                  </span>
                )}
              </div>
            </div>

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onInvestigate?.(exception.id)}>
                  <Search className="mr-2 h-4 w-4" />
                  Investigate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEscalate?.(exception.id)}>
                  <Flag className="mr-2 h-4 w-4" />
                  Escalate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onDismiss?.(exception.id)}>
                  <XCircle className="mr-2 h-4 w-4" />
                  Dismiss
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Expanded Content */}
          <CollapsibleContent className="mt-4 space-y-4">
            {/* Related Entities */}
            {exception.relatedEntities && exception.relatedEntities.length > 0 && (
              <div>
                <h5 className="text-sm font-medium mb-2">Related Entities</h5>
                <div className="flex flex-wrap gap-2">
                  {exception.relatedEntities.map((entity) => (
                    <Button
                      key={entity.id}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => onViewEntity?.(entity)}
                    >
                      {entity.type}: {entity.label}
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* AI Recommendations */}
            {showAIRecommendations &&
              exception.suggestedActions &&
              exception.suggestedActions.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    AI Recommendations
                  </h5>
                  <div className="space-y-2">
                    {exception.suggestedActions.map((action) => (
                      <div
                        key={action.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">{action.label}</p>
                          {action.description && (
                            <p className="text-xs text-muted-foreground">
                              {action.description}
                            </p>
                          )}
                        </div>
                        {action.confidence !== undefined && (
                          <Badge variant="secondary" className="mr-2">
                            {action.confidence}% confident
                          </Badge>
                        )}
                        <Button
                          size="sm"
                          variant={action.type === "auto_fix" ? "default" : "outline"}
                          onClick={() => handleResolve(action.id)}
                          disabled={isResolving === action.id}
                        >
                          {isResolving === action.id ? (
                            <Clock className="mr-1 h-3 w-3 animate-spin" />
                          ) : action.type === "auto_fix" ? (
                            <Zap className="mr-1 h-3 w-3" />
                          ) : (
                            <CheckCircle className="mr-1 h-3 w-3" />
                          )}
                          {action.type === "auto_fix" ? "Auto Fix" : "Apply"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Quick Actions */}
            <div className="flex gap-2 pt-2">
              <Button size="sm" onClick={() => onInvestigate?.(exception.id)}>
                <Eye className="mr-1 h-3 w-3" />
                Drill Down
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDismiss?.(exception.id)}
              >
                Mark as False Positive
              </Button>
            </div>
          </CollapsibleContent>
        </CardContent>
      </Card>
    </Collapsible>
  )
}

// ============================================================================
// Summary Stats
// ============================================================================

function ExceptionSummary({ exceptions }: { exceptions: Exception[] }) {
  const openCount = exceptions.filter((e) => e.status === "open").length
  const criticalCount = exceptions.filter((e) => e.severity === "critical" && e.status === "open").length
  const highCount = exceptions.filter((e) => e.severity === "high" && e.status === "open").length

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Total Open</span>
        </div>
        <p className="mt-2 text-2xl font-bold">{openCount}</p>
      </Card>
      <Card className={cn("p-4", criticalCount > 0 && "border-red-300 bg-red-50 dark:bg-red-950/50")}>
        <div className="flex items-center gap-2">
          <XCircle className={cn("h-4 w-4", criticalCount > 0 ? "text-red-600" : "text-muted-foreground")} />
          <span className={cn("text-sm", criticalCount > 0 ? "text-red-700" : "text-muted-foreground")}>Critical</span>
        </div>
        <p className={cn("mt-2 text-2xl font-bold", criticalCount > 0 && "text-red-700")}>{criticalCount}</p>
      </Card>
      <Card className={cn("p-4", highCount > 0 && "border-amber-300 bg-amber-50 dark:bg-amber-950/50")}>
        <div className="flex items-center gap-2">
          <AlertTriangle className={cn("h-4 w-4", highCount > 0 ? "text-amber-600" : "text-muted-foreground")} />
          <span className={cn("text-sm", highCount > 0 ? "text-amber-700" : "text-muted-foreground")}>High</span>
        </div>
        <p className={cn("mt-2 text-2xl font-bold", highCount > 0 && "text-amber-700")}>{highCount}</p>
      </Card>
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-sm text-muted-foreground">Resolution Rate</span>
        </div>
        <p className="mt-2 text-2xl font-bold text-green-600">
          {exceptions.length > 0
            ? Math.round(
                (exceptions.filter((e) => e.status === "resolved").length / exceptions.length) * 100
              )
            : 100}
          %
        </p>
      </Card>
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function ExceptionHunter({
  exceptions,
  onInvestigate,
  onResolve,
  onDismiss,
  onEscalate,
  onViewEntity,
  showAIRecommendations = true,
  severityFilter,
  categoryFilter,
  groupByCategory = false,
  className,
}: ExceptionHunterProps) {
  // Filter exceptions
  const filteredExceptions = React.useMemo(() => {
    let result = exceptions

    if (severityFilter && severityFilter.length > 0) {
      result = result.filter((e) => severityFilter.includes(e.severity))
    }

    if (categoryFilter && categoryFilter.length > 0) {
      result = result.filter((e) => categoryFilter.includes(e.category))
    }

    // Sort by severity (critical first) and date
    return result.sort((a, b) => {
      const severityOrder: ExceptionSeverity[] = ["critical", "high", "medium", "low", "info"]
      const severityDiff = severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity)
      if (severityDiff !== 0) return severityDiff
      return new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()
    })
  }, [exceptions, severityFilter, categoryFilter])

  // Group by category if requested
  const groupedExceptions = React.useMemo(() => {
    if (!groupByCategory) return null

    const groups: Record<ExceptionCategory, Exception[]> = {
      financial: [],
      operational: [],
      compliance: [],
      security: [],
      data_quality: [],
    }

    filteredExceptions.forEach((e) => {
      groups[e.category].push(e)
    })

    return Object.entries(groups).filter(([, items]) => items.length > 0)
  }, [filteredExceptions, groupByCategory])

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Exception Hunter
        </CardTitle>
        <CardDescription>
          AI-powered anomaly detection and investigation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <ExceptionSummary exceptions={exceptions} />

        {/* Exception List */}
        {filteredExceptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <h3 className="mt-4 font-semibold">All Clear!</h3>
            <p className="text-sm text-muted-foreground">No exceptions detected</p>
          </div>
        ) : groupByCategory && groupedExceptions ? (
          <div className="space-y-6">
            {groupedExceptions.map(([category, items]) => {
              const config = CATEGORY_CONFIG[category as ExceptionCategory]
              const Icon = config.icon
              return (
                <div key={category}>
                  <h3 className="flex items-center gap-2 mb-3 font-semibold">
                    <Icon className="h-4 w-4" />
                    {config.label}
                    <Badge variant="secondary">{items.length}</Badge>
                  </h3>
                  <div className="space-y-3">
                    {items.map((exception) => (
                      <ExceptionCard
                        key={exception.id}
                        exception={exception}
                        onInvestigate={onInvestigate}
                        onResolve={onResolve}
                        onDismiss={onDismiss}
                        onEscalate={onEscalate}
                        onViewEntity={onViewEntity}
                        showAIRecommendations={showAIRecommendations}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredExceptions.map((exception) => (
              <ExceptionCard
                key={exception.id}
                exception={exception}
                onInvestigate={onInvestigate}
                onResolve={onResolve}
                onDismiss={onDismiss}
                onEscalate={onEscalate}
                onViewEntity={onViewEntity}
                showAIRecommendations={showAIRecommendations}
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

export type {
  ExceptionSeverity,
  ExceptionCategory,
  ExceptionStatus,
  ExceptionTrend,
  RelatedEntity,
  SuggestedAction,
  Exception,
}
