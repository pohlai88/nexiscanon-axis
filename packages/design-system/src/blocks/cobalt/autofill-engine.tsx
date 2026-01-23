"use client"

/**
 * Autofill Engine - Cobalt Kernel Component
 *
 * Context-aware field population with AI suggestions.
 * Implements A01-CANONICAL.md §4 — Cobalt Kernel (Smart Execution)
 *
 * Features:
 * - Context detection from related records
 * - AI-powered value suggestions
 * - Confidence indicators
 * - One-click autofill
 * - Learning from user corrections
 *
 * @example
 * ```tsx
 * import { AutofillEngine, useAutofill } from "@workspace/design-system"
 *
 * const { suggestions, applyAll, dismiss } = useAutofill({
 *   context: { customerId: "123" },
 *   fields: formFields,
 * })
 *
 * <AutofillEngine
 *   suggestions={suggestions}
 *   onApply={(fieldId) => applyField(fieldId)}
 *   onApplyAll={() => applyAll()}
 * />
 * ```
 */

import * as React from "react"
import { cn } from "../../lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/card"
import { Badge } from "../../components/badge"
import { Button } from "../../components/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/tooltip"
import {
  Sparkles,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Zap,
  History,
  AlertCircle,
  Lightbulb,
  Loader2,
  RefreshCw,
} from "lucide-react"

// ============================================================================
// Types
// ============================================================================

export type SuggestionSource = "history" | "related" | "ai" | "default" | "pattern"

export interface AutofillSuggestion {
  fieldId: string
  fieldLabel: string
  suggestedValue: string | number | boolean
  displayValue?: string
  confidence: number // 0-100
  source: SuggestionSource
  reasoning?: string
  alternatives?: {
    value: string | number | boolean
    displayValue?: string
    confidence: number
  }[]
}

export interface AutofillEngineProps {
  /** Field suggestions */
  suggestions: AutofillSuggestion[]
  /** Apply single suggestion */
  onApply?: (fieldId: string, value: AutofillSuggestion["suggestedValue"]) => void
  /** Apply all suggestions */
  onApplyAll?: () => void
  /** Dismiss single suggestion */
  onDismiss?: (fieldId: string) => void
  /** Dismiss all */
  onDismissAll?: () => void
  /** Refresh suggestions */
  onRefresh?: () => Promise<void>
  /** Title */
  title?: string
  /** Compact mode */
  compact?: boolean
  /** Auto-collapse threshold */
  collapseThreshold?: number
  /** Custom className */
  className?: string
}

export interface UseAutofillOptions {
  /** Context for suggestions (e.g., related record IDs) */
  context: Record<string, unknown>
  /** Field definitions */
  fields: { id: string; label: string; type: string }[]
  /** Fetch suggestions callback */
  fetchSuggestions?: (context: Record<string, unknown>) => Promise<AutofillSuggestion[]>
}

// ============================================================================
// Constants
// ============================================================================

const SOURCE_CONFIG: Record<SuggestionSource, { icon: React.ElementType; label: string; color: string }> = {
  history: { icon: History, label: "From History", color: "text-blue-600" },
  related: { icon: Zap, label: "Related Record", color: "text-purple-600" },
  ai: { icon: Sparkles, label: "AI Suggested", color: "text-primary" },
  default: { icon: Lightbulb, label: "Default Value", color: "text-gray-600" },
  pattern: { icon: Zap, label: "Pattern Match", color: "text-amber-600" },
}

// ============================================================================
// Hook
// ============================================================================

export function useAutofill(options: UseAutofillOptions) {
  const [suggestions, setSuggestions] = React.useState<AutofillSuggestion[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [appliedFields, setAppliedFields] = React.useState<Set<string>>(new Set())

  const refresh = React.useCallback(async () => {
    if (!options.fetchSuggestions) return
    setIsLoading(true)
    try {
      const result = await options.fetchSuggestions(options.context)
      setSuggestions(result)
    } finally {
      setIsLoading(false)
    }
  }, [options.context, options.fetchSuggestions])

  const apply = React.useCallback((fieldId: string) => {
    setAppliedFields((prev) => new Set([...prev, fieldId]))
  }, [])

  const applyAll = React.useCallback(() => {
    setAppliedFields(new Set(suggestions.map((s) => s.fieldId)))
  }, [suggestions])

  const dismiss = React.useCallback((fieldId: string) => {
    setSuggestions((prev) => prev.filter((s) => s.fieldId !== fieldId))
  }, [])

  const dismissAll = React.useCallback(() => {
    setSuggestions([])
  }, [])

  return {
    suggestions: suggestions.filter((s) => !appliedFields.has(s.fieldId)),
    isLoading,
    refresh,
    apply,
    applyAll,
    dismiss,
    dismissAll,
    appliedCount: appliedFields.size,
  }
}

// ============================================================================
// Confidence Badge
// ============================================================================

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const getColor = () => {
    if (confidence >= 90) return "bg-green-100 text-green-700"
    if (confidence >= 70) return "bg-blue-100 text-blue-700"
    if (confidence >= 50) return "bg-amber-100 text-amber-700"
    return "bg-gray-100 text-gray-700"
  }

  return (
    <Badge className={cn("text-xs", getColor())}>
      {confidence}%
    </Badge>
  )
}

// ============================================================================
// Suggestion Card
// ============================================================================

function SuggestionCard({
  suggestion,
  onApply,
  onDismiss,
  isApplying,
  compact,
}: {
  suggestion: AutofillSuggestion
  onApply?: () => void
  onDismiss?: () => void
  isApplying: boolean
  compact: boolean
}) {
  const [showAlternatives, setShowAlternatives] = React.useState(false)
  const sourceConfig = SOURCE_CONFIG[suggestion.source]
  const SourceIcon = sourceConfig.icon

  return (
    <div
      className={cn(
        "rounded-lg border p-3 transition-all hover:shadow-sm",
        suggestion.confidence >= 90 && "border-green-200 bg-green-50/50 dark:bg-green-950/20",
        suggestion.confidence < 50 && "border-amber-200 bg-amber-50/50 dark:bg-amber-950/20"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{suggestion.fieldLabel}</span>
            <ConfidenceBadge confidence={suggestion.confidence} />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <span className={cn("flex items-center gap-1 text-xs", sourceConfig.color)}>
                    <SourceIcon className="h-3 w-3" />
                    {sourceConfig.label}
                  </span>
                </TooltipTrigger>
                {suggestion.reasoning && (
                  <TooltipContent>
                    <p className="max-w-xs">{suggestion.reasoning}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <code className="rounded bg-muted px-2 py-0.5 text-sm font-mono">
              {suggestion.displayValue ?? String(suggestion.suggestedValue)}
            </code>
          </div>

          {/* Alternatives */}
          {!compact && suggestion.alternatives && suggestion.alternatives.length > 0 && (
            <div className="mt-2">
              <button
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setShowAlternatives(!showAlternatives)}
              >
                {showAlternatives ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
                {suggestion.alternatives.length} alternative{suggestion.alternatives.length > 1 ? "s" : ""}
              </button>
              {showAlternatives && (
                <div className="mt-1 space-y-1 ml-4">
                  {suggestion.alternatives.map((alt, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      <code className="rounded bg-muted/50 px-1.5 py-0.5 font-mono">
                        {alt.displayValue ?? String(alt.value)}
                      </code>
                      <span className="text-muted-foreground">{alt.confidence}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {onApply && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
              onClick={onApply}
              disabled={isApplying}
            >
              {isApplying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
            </Button>
          )}
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
              onClick={onDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function AutofillEngine({
  suggestions,
  onApply,
  onApplyAll,
  onDismiss,
  onDismissAll,
  onRefresh,
  title = "Smart Autofill",
  compact = false,
  collapseThreshold = 5,
  className,
}: AutofillEngineProps) {
  const [isExpanded, setIsExpanded] = React.useState(suggestions.length <= collapseThreshold)
  const [applyingField, setApplyingField] = React.useState<string | null>(null)
  const [isApplyingAll, setIsApplyingAll] = React.useState(false)
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  const displayedSuggestions = isExpanded ? suggestions : suggestions.slice(0, collapseThreshold)
  const hiddenCount = suggestions.length - collapseThreshold

  const handleApply = async (fieldId: string, value: AutofillSuggestion["suggestedValue"]) => {
    if (!onApply) return
    setApplyingField(fieldId)
    try {
      onApply(fieldId, value)
    } finally {
      setApplyingField(null)
    }
  }

  const handleApplyAll = async () => {
    if (!onApplyAll) return
    setIsApplyingAll(true)
    try {
      onApplyAll()
    } finally {
      setIsApplyingAll(false)
    }
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

  if (suggestions.length === 0) {
    return null
  }

  // Average confidence
  const avgConfidence =
    suggestions.reduce((sum, s) => sum + s.confidence, 0) / suggestions.length

  return (
    <Card className={cn("border-primary/30 bg-primary/5", className)}>
      <CardHeader className={cn(compact && "pb-2")}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-primary" />
              {title}
            </CardTitle>
            {!compact && (
              <CardDescription>
                {suggestions.length} suggestion{suggestions.length > 1 ? "s" : ""} •{" "}
                {avgConfidence.toFixed(0)}% avg confidence
              </CardDescription>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
              </Button>
            )}
            {onApplyAll && (
              <Button
                variant="default"
                size="sm"
                onClick={handleApplyAll}
                disabled={isApplyingAll}
              >
                {isApplyingAll ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="mr-2 h-4 w-4" />
                )}
                Apply All
              </Button>
            )}
            {onDismissAll && (
              <Button variant="ghost" size="sm" onClick={onDismissAll}>
                Dismiss
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className={cn("space-y-2", compact && "pt-0")}>
        {displayedSuggestions.map((suggestion) => (
          <SuggestionCard
            key={suggestion.fieldId}
            suggestion={suggestion}
            onApply={
              onApply
                ? () => handleApply(suggestion.fieldId, suggestion.suggestedValue)
                : undefined
            }
            onDismiss={onDismiss ? () => onDismiss(suggestion.fieldId) : undefined}
            isApplying={applyingField === suggestion.fieldId}
            compact={compact}
          />
        ))}

        {/* Expand/Collapse */}
        {suggestions.length > collapseThreshold && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="mr-2 h-4 w-4" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="mr-2 h-4 w-4" />
                Show {hiddenCount} More
              </>
            )}
          </Button>
        )}

        {/* Low confidence warning */}
        {avgConfidence < 50 && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950 p-2 text-xs">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
            <span className="text-amber-700 dark:text-amber-300">
              Suggestions have low confidence. Review carefully before applying.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Exports
// ============================================================================

export type { SuggestionSource, AutofillSuggestion, UseAutofillOptions }
