"use client"

/**
 * Risk Score Display - Audit Component
 *
 * Real-time risk assessment visualization.
 * Implements A01-CANONICAL.md §5 — Nexus Doctrine (Risk Awareness)
 *
 * Features:
 * - Risk gauge visualization
 * - Contributing factors breakdown
 * - Historical trend
 * - Action recommendations
 * - Threshold alerts
 *
 * @example
 * ```tsx
 * import { RiskScoreDisplay } from "@workspace/design-system"
 *
 * <RiskScoreDisplay
 *   score={75}
 *   factors={riskFactors}
 *   trend={historicalScores}
 *   onViewDetails={() => openRiskDetails()}
 * />
 * ```
 */

import * as React from "react"
import { cn } from "../../lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/card"
import { Badge } from "../../components/badge"
import { Button } from "../../components/button"
import { Progress } from "../../components/progress"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/tooltip"
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Shield,
  Zap,
} from "lucide-react"

// ============================================================================
// Types
// ============================================================================

export type RiskLevel = "low" | "medium" | "high" | "critical"

export interface RiskFactor {
  id: string
  name: string
  description?: string
  impact: number // 0-100 contribution to total score
  category: string
  trend?: "improving" | "worsening" | "stable"
}

export interface RiskTrendPoint {
  date: string | Date
  score: number
}

export interface RiskAction {
  id: string
  label: string
  description?: string
  priority: "high" | "medium" | "low"
  action?: () => void
}

export interface RiskScoreDisplayProps {
  /** Risk score (0-100) */
  score: number
  /** Previous score for comparison */
  previousScore?: number
  /** Contributing factors */
  factors?: RiskFactor[]
  /** Historical trend */
  trend?: RiskTrendPoint[]
  /** Recommended actions */
  actions?: RiskAction[]
  /** View details callback */
  onViewDetails?: () => void
  /** Threshold configuration */
  thresholds?: {
    low: number
    medium: number
    high: number
  }
  /** Title */
  title?: string
  /** Compact mode */
  compact?: boolean
  /** Custom className */
  className?: string
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_THRESHOLDS = {
  low: 30,
  medium: 60,
  high: 80,
}

// ============================================================================
// Helpers
// ============================================================================

function getRiskLevel(score: number, thresholds = DEFAULT_THRESHOLDS): RiskLevel {
  if (score < thresholds.low) return "low"
  if (score < thresholds.medium) return "medium"
  if (score < thresholds.high) return "high"
  return "critical"
}

function getRiskConfig(level: RiskLevel) {
  return {
    low: {
      label: "Low Risk",
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900",
      borderColor: "border-green-300",
      gaugeColor: "#22c55e",
    },
    medium: {
      label: "Medium Risk",
      color: "text-amber-600",
      bgColor: "bg-amber-100 dark:bg-amber-900",
      borderColor: "border-amber-300",
      gaugeColor: "#f59e0b",
    },
    high: {
      label: "High Risk",
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900",
      borderColor: "border-orange-300",
      gaugeColor: "#f97316",
    },
    critical: {
      label: "Critical Risk",
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900",
      borderColor: "border-red-300",
      gaugeColor: "#ef4444",
    },
  }[level]
}

// ============================================================================
// Risk Gauge
// ============================================================================

function RiskGauge({
  score,
  previousScore,
  thresholds = DEFAULT_THRESHOLDS,
  size = 160,
}: {
  score: number
  previousScore?: number
  thresholds?: typeof DEFAULT_THRESHOLDS
  size?: number
}) {
  const level = getRiskLevel(score, thresholds)
  const config = getRiskConfig(level)

  // SVG calculations
  const strokeWidth = 12
  const radius = (size - strokeWidth) / 2
  const circumference = radius * Math.PI // Semi-circle
  const offset = circumference - (score / 100) * circumference

  const change = previousScore !== undefined ? score - previousScore : null

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size / 2 + 20 }}>
        <svg
          width={size}
          height={size / 2 + strokeWidth}
          viewBox={`0 0 ${size} ${size / 2 + strokeWidth}`}
        >
          {/* Background arc */}
          <path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted"
          />

          {/* Threshold markers */}
          {Object.entries(thresholds).map(([key, value]) => {
            const angle = (value / 100) * 180
            const x = size / 2 + radius * Math.cos((180 - angle) * (Math.PI / 180))
            const y = size / 2 - radius * Math.sin((180 - angle) * (Math.PI / 180))
            return (
              <circle
                key={key}
                cx={x}
                cy={y}
                r={3}
                fill="currentColor"
                className="text-muted-foreground"
              />
            )
          })}

          {/* Score arc */}
          <path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            fill="none"
            stroke={config.gaugeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-0">
          <span className={cn("text-4xl font-bold", config.color)}>{score}</span>
          <Badge className={cn("mt-1", config.bgColor, config.color, "border-0")}>
            {config.label}
          </Badge>
        </div>
      </div>

      {/* Change indicator */}
      {change !== null && (
        <div
          className={cn(
            "mt-2 flex items-center gap-1 text-sm",
            change > 0 ? "text-red-600" : change < 0 ? "text-green-600" : "text-muted-foreground"
          )}
        >
          {change > 0 ? (
            <TrendingUp className="h-4 w-4" />
          ) : change < 0 ? (
            <TrendingDown className="h-4 w-4" />
          ) : null}
          <span>
            {change > 0 ? "+" : ""}
            {change} from previous
          </span>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Mini Sparkline
// ============================================================================

function TrendSparkline({ data }: { data: RiskTrendPoint[] }) {
  if (!data || data.length < 2) return null

  const scores = data.map((d) => d.score)
  const max = Math.max(...scores)
  const min = Math.min(...scores)
  const range = max - min || 1

  const width = 120
  const height = 32

  const points = scores
    .map((score, index) => {
      const x = (index / (scores.length - 1)) * width
      const y = height - ((score - min) / range) * height
      return `${x},${y}`
    })
    .join(" ")

  const isImproving = scores[scores.length - 1] < scores[0]

  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">30-Day Trend</p>
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          points={points}
          fill="none"
          stroke={isImproving ? "#22c55e" : "#ef4444"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

// ============================================================================
// Factor List
// ============================================================================

function FactorList({ factors }: { factors: RiskFactor[] }) {
  const sortedFactors = [...factors].sort((a, b) => b.impact - a.impact)

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium">Contributing Factors</h4>
      <div className="space-y-2">
        {sortedFactors.slice(0, 5).map((factor) => (
          <div key={factor.id} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span>{factor.name}</span>
                {factor.trend && (
                  <span
                    className={cn(
                      "text-xs",
                      factor.trend === "improving"
                        ? "text-green-600"
                        : factor.trend === "worsening"
                        ? "text-red-600"
                        : "text-muted-foreground"
                    )}
                  >
                    {factor.trend === "improving" ? "↓" : factor.trend === "worsening" ? "↑" : "→"}
                  </span>
                )}
              </div>
              <span className="font-medium">{factor.impact}%</span>
            </div>
            <Progress value={factor.impact} className="h-1.5" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// Action List
// ============================================================================

function ActionList({ actions }: { actions: RiskAction[] }) {
  const sortedActions = [...actions].sort((a, b) => {
    const priority = { high: 0, medium: 1, low: 2 }
    return priority[a.priority] - priority[b.priority]
  })

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium flex items-center gap-2">
        <Zap className="h-4 w-4 text-primary" />
        Recommended Actions
      </h4>
      <div className="space-y-2">
        {sortedActions.slice(0, 3).map((action) => (
          <div
            key={action.id}
            className={cn(
              "flex items-start gap-3 rounded-lg border p-3",
              action.priority === "high" && "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950",
              action.priority === "medium" && "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950"
            )}
          >
            <div className="flex-1">
              <p className="font-medium text-sm">{action.label}</p>
              {action.description && (
                <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
              )}
            </div>
            {action.action && (
              <Button variant="ghost" size="sm" onClick={action.action}>
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function RiskScoreDisplay({
  score,
  previousScore,
  factors = [],
  trend = [],
  actions = [],
  onViewDetails,
  thresholds = DEFAULT_THRESHOLDS,
  title = "Risk Score",
  compact = false,
  className,
}: RiskScoreDisplayProps) {
  const level = getRiskLevel(score, thresholds)
  const config = getRiskConfig(level)

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <div
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer",
                config.bgColor,
                className
              )}
              onClick={onViewDetails}
            >
              <Shield className={cn("h-4 w-4", config.color)} />
              <span className={cn("font-bold", config.color)}>{score}</span>
              <Badge className={cn("text-xs", config.bgColor, config.color, "border-0")}>
                {config.label}
              </Badge>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Risk Score: {score}/100</p>
            <p className="text-xs text-muted-foreground">Click to view details</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <Card className={cn(level === "critical" && "border-red-300", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {title}
            </CardTitle>
            <CardDescription>Real-time risk assessment</CardDescription>
          </div>
          {onViewDetails && (
            <Button variant="outline" size="sm" onClick={onViewDetails}>
              View Details
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Risk Gauge */}
        <div className="flex justify-center">
          <RiskGauge score={score} previousScore={previousScore} thresholds={thresholds} />
        </div>

        {/* Trend Sparkline */}
        {trend.length > 1 && (
          <div className="flex justify-center">
            <TrendSparkline data={trend} />
          </div>
        )}

        {/* Factors */}
        {factors.length > 0 && <FactorList factors={factors} />}

        {/* Actions */}
        {actions.length > 0 && <ActionList actions={actions} />}

        {/* Alert for critical */}
        {level === "critical" && (
          <div className="flex items-start gap-3 rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
            <div>
              <p className="font-medium text-red-700 dark:text-red-300">Critical Risk Level</p>
              <p className="text-sm text-red-600 dark:text-red-400">
                Immediate action is required. Review contributing factors and recommended actions.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Exports
// ============================================================================

export type { RiskLevel, RiskFactor, RiskTrendPoint, RiskAction }
