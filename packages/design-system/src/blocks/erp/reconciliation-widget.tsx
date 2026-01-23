"use client"

/**
 * Reconciliation Widget - ERP Domain Component
 *
 * Show subledger ↔ GL reconciliation gaps.
 * Implements A01-CANONICAL.md §3 — Three Pillars (Money)
 *
 * Features:
 * - Side-by-side comparison
 * - Difference highlighting
 * - Auto-match suggestions
 * - Drill-down to transactions
 * - Reconciliation actions
 *
 * @example
 * ```tsx
 * import { ReconciliationWidget } from "@workspace/design-system"
 *
 * <ReconciliationWidget
 *   subledger={arBalances}
 *   generalLedger={glBalances}
 *   onReconcile={(items) => markReconciled(items)}
 *   onDrillDown={(item) => viewTransactions(item)}
 * />
 * ```
 */

import * as React from "react"
import { cn } from "../../lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/card"
import { Badge } from "../../components/badge"
import { Button } from "../../components/button"
import { Progress } from "../../components/progress"
import { Checkbox } from "../../components/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/table"
import {
  CheckCircle,
  ArrowLeftRight,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Download,
  Loader2,
  XCircle,
  AlertCircle,
  Zap,
} from "lucide-react"

// ============================================================================
// Types
// ============================================================================

export type ReconciliationStatus = "matched" | "unmatched" | "partial" | "pending"

export interface ReconciliationItem {
  id: string
  reference: string
  description: string
  subledgerAmount: number
  glAmount: number
  difference: number
  status: ReconciliationStatus
  subledgerDate?: string | Date
  glDate?: string | Date
  suggestedMatch?: {
    itemId: string
    confidence: number
    reason: string
  }
  metadata?: Record<string, unknown>
}

export interface ReconciliationSummary {
  totalItems: number
  matchedCount: number
  unmatchedCount: number
  partialCount: number
  subledgerTotal: number
  glTotal: number
  totalDifference: number
  matchPercentage: number
}

export interface ReconciliationWidgetProps {
  /** Reconciliation items */
  items: ReconciliationItem[]
  /** Subledger name */
  subledgerName?: string
  /** GL account name */
  glAccountName?: string
  /** Reconcile callback */
  onReconcile?: (itemIds: string[]) => Promise<void>
  /** Drill-down callback */
  onDrillDown?: (item: ReconciliationItem, source: "subledger" | "gl") => void
  /** Auto-match callback */
  onAutoMatch?: () => Promise<void>
  /** Export callback */
  onExport?: (format: "csv" | "excel") => void
  /** Refresh callback */
  onRefresh?: () => Promise<void>
  /** Currency symbol */
  currency?: string
  /** Show suggested matches */
  showSuggestions?: boolean
  /** Custom className */
  className?: string
}

// ============================================================================
// Helpers
// ============================================================================

function formatCurrency(amount: number, currency: string = "$"): string {
  const absAmount = Math.abs(amount)
  const formatted = `${currency}${absAmount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
  return amount < 0 ? `(${formatted})` : formatted
}

function calculateSummary(items: ReconciliationItem[]): ReconciliationSummary {
  const matchedCount = items.filter((i) => i.status === "matched").length
  const unmatchedCount = items.filter((i) => i.status === "unmatched").length
  const partialCount = items.filter((i) => i.status === "partial").length

  const subledgerTotal = items.reduce((sum, i) => sum + i.subledgerAmount, 0)
  const glTotal = items.reduce((sum, i) => sum + i.glAmount, 0)

  return {
    totalItems: items.length,
    matchedCount,
    unmatchedCount,
    partialCount,
    subledgerTotal,
    glTotal,
    totalDifference: Math.abs(subledgerTotal - glTotal),
    matchPercentage: items.length > 0 ? (matchedCount / items.length) * 100 : 100,
  }
}

// ============================================================================
// Status Badge
// ============================================================================

function StatusBadge({ status }: { status: ReconciliationStatus }) {
  const config = {
    matched: { icon: CheckCircle, color: "bg-green-100 text-green-700", label: "Matched" },
    unmatched: { icon: XCircle, color: "bg-red-100 text-red-700", label: "Unmatched" },
    partial: { icon: AlertCircle, color: "bg-amber-100 text-amber-700", label: "Partial" },
    pending: { icon: RefreshCw, color: "bg-gray-100 text-gray-700", label: "Pending" },
  }

  const c = config[status]
  const Icon = c.icon

  return (
    <Badge className={cn("gap-1", c.color)}>
      <Icon className="h-3 w-3" />
      {c.label}
    </Badge>
  )
}

// ============================================================================
// Summary Card
// ============================================================================

function ReconciliationSummaryCard({
  summary,
  subledgerName,
  glAccountName,
  currency,
}: {
  summary: ReconciliationSummary
  subledgerName: string
  glAccountName: string
  currency: string
}) {
  const isReconciled = summary.totalDifference < 0.01

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Reconciliation Progress</span>
          <span className="font-medium">{summary.matchPercentage.toFixed(0)}%</span>
        </div>
        <Progress value={summary.matchPercentage} className="h-2" />
      </div>

      {/* Comparison */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">{subledgerName}</p>
          <p className="text-xl font-bold">{formatCurrency(summary.subledgerTotal, currency)}</p>
        </Card>
        <Card className="p-4 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5 text-muted-foreground" />
            <div
              className={cn(
                "text-lg font-bold",
                isReconciled ? "text-green-600" : "text-red-600"
              )}
            >
              {isReconciled ? "✓ Balanced" : formatCurrency(summary.totalDifference, currency)}
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">{glAccountName}</p>
          <p className="text-xl font-bold">{formatCurrency(summary.glTotal, currency)}</p>
        </Card>
      </div>

      {/* Status Counts */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span>{summary.matchedCount} matched</span>
        </div>
        <div className="flex items-center gap-1">
          <XCircle className="h-4 w-4 text-red-600" />
          <span>{summary.unmatchedCount} unmatched</span>
        </div>
        <div className="flex items-center gap-1">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <span>{summary.partialCount} partial</span>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function ReconciliationWidget({
  items,
  subledgerName = "Subledger",
  glAccountName = "General Ledger",
  onReconcile,
  onDrillDown,
  onAutoMatch,
  onExport,
  onRefresh,
  currency = "$",
  showSuggestions = true,
  className,
}: ReconciliationWidgetProps) {
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  const [isReconciling, setIsReconciling] = React.useState(false)
  const [isAutoMatching, setIsAutoMatching] = React.useState(false)
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  const summary = calculateSummary(items)
  const unmatchedItems = items.filter((i) => i.status !== "matched")

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleReconcile = async () => {
    if (!onReconcile || selectedIds.size === 0) return
    setIsReconciling(true)
    try {
      await onReconcile(Array.from(selectedIds))
      setSelectedIds(new Set())
    } finally {
      setIsReconciling(false)
    }
  }

  const handleAutoMatch = async () => {
    if (!onAutoMatch) return
    setIsAutoMatching(true)
    try {
      await onAutoMatch()
    } finally {
      setIsAutoMatching(false)
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

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5" />
              Reconciliation
            </CardTitle>
            <CardDescription>
              {subledgerName} ↔ {glAccountName}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {onAutoMatch && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAutoMatch}
                disabled={isAutoMatching}
              >
                {isAutoMatching ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Auto-Match
              </Button>
            )}
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

      <CardContent className="space-y-6">
        {/* Summary */}
        <ReconciliationSummaryCard
          summary={summary}
          subledgerName={subledgerName}
          glAccountName={glAccountName}
          currency={currency}
        />

        {/* Reconciliation Table */}
        {unmatchedItems.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold">Items Requiring Attention</h4>
              {selectedIds.size > 0 && onReconcile && (
                <Button
                  size="sm"
                  onClick={handleReconcile}
                  disabled={isReconciling}
                >
                  {isReconciling ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  )}
                  Reconcile ({selectedIds.size})
                </Button>
              )}
            </div>

            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {onReconcile && <TableHead className="w-10" />}
                    <TableHead>Reference</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">{subledgerName}</TableHead>
                    <TableHead className="text-right">{glAccountName}</TableHead>
                    <TableHead className="text-right">Difference</TableHead>
                    <TableHead className="w-24">Status</TableHead>
                    <TableHead className="w-20" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unmatchedItems.map((item) => (
                    <TableRow
                      key={item.id}
                      className={cn(selectedIds.has(item.id) && "bg-primary/5")}
                    >
                      {onReconcile && (
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.has(item.id)}
                            onCheckedChange={() => toggleSelection(item.id)}
                          />
                        </TableCell>
                      )}
                      <TableCell className="font-mono">{item.reference}</TableCell>
                      <TableCell>
                        <div>
                          <p>{item.description}</p>
                          {showSuggestions && item.suggestedMatch && (
                            <div className="mt-1 flex items-center gap-1 text-xs text-primary">
                              <Zap className="h-3 w-3" />
                              <span>
                                Match suggested ({item.suggestedMatch.confidence}% confidence)
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        <button
                          className="hover:text-primary hover:underline"
                          onClick={() => onDrillDown?.(item, "subledger")}
                        >
                          {formatCurrency(item.subledgerAmount, currency)}
                        </button>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        <button
                          className="hover:text-primary hover:underline"
                          onClick={() => onDrillDown?.(item, "gl")}
                        >
                          {formatCurrency(item.glAmount, currency)}
                        </button>
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right font-mono font-medium",
                          item.difference !== 0 && "text-red-600"
                        )}
                      >
                        {formatCurrency(item.difference, currency)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={item.status} />
                      </TableCell>
                      <TableCell>
                        {onDrillDown && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDrillDown(item, "subledger")}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* All Matched Message */}
        {unmatchedItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <h3 className="mt-4 font-semibold">Fully Reconciled!</h3>
            <p className="text-sm text-muted-foreground">
              All items are matched between {subledgerName} and {glAccountName}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Exports
// ============================================================================

export type { ReconciliationStatus, ReconciliationItem, ReconciliationSummary }
