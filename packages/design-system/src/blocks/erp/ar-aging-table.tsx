"use client"

/**
 * AR Aging Table - ERP Domain Component
 *
 * Accounts Receivable aging analysis.
 * Implements A01-CANONICAL.md §3 — Three Pillars (Obligations: "Who owes whom?")
 *
 * Features:
 * - Aging buckets (Current, 30, 60, 90, 90+)
 * - Customer drill-down
 * - Total outstanding
 * - Payment status indicators
 * - Overdue alerts
 * - Export functionality
 *
 * @example
 * ```tsx
 * import { ARAgingTable } from "@workspace/design-system"
 *
 * <ARAgingTable
 *   data={arAgingData}
 *   onCustomerClick={(customer) => router.push(`/customers/${customer.id}`)}
 *   onExport={(format) => exportAging(format)}
 * />
 * ```
 */

import * as React from "react"
import { cn } from "../../lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/card"
import { Badge } from "../../components/badge"
import { Button } from "../../components/button"
import { Progress } from "../../components/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/tooltip"
import {
  DollarSign,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Download,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react"

// ============================================================================
// Types (AgingBucket imported from shared types to avoid conflicts)
// ============================================================================

import type { AgingBucket } from "../types"

export interface CustomerAging {
  id: string
  name: string
  code?: string
  creditLimit?: number
  totalOutstanding: number
  buckets: AgingBucket
  lastPaymentDate?: string
  lastPaymentAmount?: number
  paymentTerms?: string
  trend?: "up" | "down" | "stable"
  riskLevel?: "low" | "medium" | "high"
}

export interface ARAgingSummary {
  totalOutstanding: number
  totalCurrent: number
  total30: number
  total60: number
  total90: number
  total90Plus: number
  totalOverdue: number
  overduePercentage: number
  customerCount: number
  averageDSO?: number
}

export interface ARAgingTableProps {
  /** Customer aging data */
  data: CustomerAging[]
  /** Summary totals (calculated if not provided) */
  summary?: ARAgingSummary
  /** Callback when customer is clicked */
  onCustomerClick?: (customer: CustomerAging) => void
  /** Export callback */
  onExport?: (format: "csv" | "excel" | "pdf") => void
  /** Currency symbol */
  currency?: string
  /** Show trend indicators */
  showTrends?: boolean
  /** Show risk indicators */
  showRisk?: boolean
  /** Collapsible customer details */
  collapsible?: boolean
  /** Initial sort column */
  sortBy?: keyof AgingBucket | "name" | "totalOutstanding"
  /** Sort direction */
  sortDirection?: "asc" | "desc"
  /** Custom className */
  className?: string
}

// ============================================================================
// Helpers
// ============================================================================

function formatCurrency(amount: number, currency: string = "$"): string {
  return `${currency}${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function calculateSummary(data: CustomerAging[]): ARAgingSummary {
  const totals = data.reduce(
    (acc, customer) => ({
      totalOutstanding: acc.totalOutstanding + customer.totalOutstanding,
      totalCurrent: acc.totalCurrent + customer.buckets.current,
      total30: acc.total30 + customer.buckets.days30,
      total60: acc.total60 + customer.buckets.days60,
      total90: acc.total90 + customer.buckets.days90,
      total90Plus: acc.total90Plus + customer.buckets.days90Plus,
    }),
    {
      totalOutstanding: 0,
      totalCurrent: 0,
      total30: 0,
      total60: 0,
      total90: 0,
      total90Plus: 0,
    }
  )

  const totalOverdue =
    totals.total30 + totals.total60 + totals.total90 + totals.total90Plus

  return {
    ...totals,
    totalOverdue,
    overduePercentage:
      totals.totalOutstanding > 0
        ? (totalOverdue / totals.totalOutstanding) * 100
        : 0,
    customerCount: data.length,
  }
}

// ============================================================================
// Sub-components
// ============================================================================

function AgingSummaryCards({
  summary,
  currency,
}: {
  summary: ARAgingSummary
  currency: string
}) {
  const cards = [
    {
      label: "Total Outstanding",
      value: summary.totalOutstanding,
      icon: DollarSign,
      color: "text-foreground",
    },
    {
      label: "Current",
      value: summary.totalCurrent,
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      label: "1-30 Days",
      value: summary.total30,
      icon: Clock,
      color: "text-amber-500",
    },
    {
      label: "31-60 Days",
      value: summary.total60,
      icon: AlertCircle,
      color: "text-orange-500",
    },
    {
      label: "61-90 Days",
      value: summary.total90,
      icon: AlertTriangle,
      color: "text-red-500",
    },
    {
      label: "90+ Days",
      value: summary.total90Plus,
      icon: AlertTriangle,
      color: "text-red-700",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
      {cards.map((card) => (
        <Card key={card.label} className="p-4">
          <div className="flex items-center gap-2">
            <card.icon className={cn("h-4 w-4", card.color)} />
            <span className="text-xs text-muted-foreground">{card.label}</span>
          </div>
          <p className={cn("mt-2 text-xl font-bold", card.color)}>
            {formatCurrency(card.value, currency)}
          </p>
        </Card>
      ))}
    </div>
  )
}

function TrendIndicator({ trend }: { trend?: "up" | "down" | "stable" }) {
  if (!trend) return null

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <span className="inline-flex">
            {trend === "up" && (
              <TrendingUp className="h-4 w-4 text-red-500" />
            )}
            {trend === "down" && (
              <TrendingDown className="h-4 w-4 text-green-500" />
            )}
            {trend === "stable" && (
              <span className="h-4 w-4 text-muted-foreground">—</span>
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          {trend === "up" && "Balance increasing"}
          {trend === "down" && "Balance decreasing"}
          {trend === "stable" && "Balance stable"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function RiskBadge({ level }: { level?: "low" | "medium" | "high" }) {
  if (!level) return null

  const variants: Record<typeof level, { variant: "default" | "secondary" | "destructive"; label: string }> = {
    low: { variant: "secondary", label: "Low Risk" },
    medium: { variant: "default", label: "Medium Risk" },
    high: { variant: "destructive", label: "High Risk" },
  }

  const config = variants[level]

  return (
    <Badge variant={config.variant} className="text-xs">
      {config.label}
    </Badge>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function ARAgingTable({
  data,
  summary: providedSummary,
  onCustomerClick,
  onExport,
  currency = "$",
  showTrends = true,
  showRisk = true,
  collapsible = true,
  className,
}: ARAgingTableProps) {
  const [expandedRows, setExpandedRows] = React.useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = React.useState<string>("totalOutstanding")
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("desc")

  const summary = providedSummary || calculateSummary(data)

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const sortedData = React.useMemo(() => {
    return [...data].sort((a, b) => {
      let aVal: number | string
      let bVal: number | string

      if (sortBy === "name") {
        aVal = a.name
        bVal = b.name
      } else if (sortBy === "totalOutstanding") {
        aVal = a.totalOutstanding
        bVal = b.totalOutstanding
      } else if (sortBy in a.buckets) {
        aVal = a.buckets[sortBy as keyof AgingBucket]
        bVal = b.buckets[sortBy as keyof AgingBucket]
      } else {
        return 0
      }

      if (typeof aVal === "string") {
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal)
      }

      return sortDirection === "asc" ? aVal - (bVal as number) : (bVal as number) - aVal
    })
  }, [data, sortBy, sortDirection])

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortBy(column)
      setSortDirection("desc")
    }
  }

  const SortableHeader = ({
    column,
    children,
    className: headerClassName,
  }: {
    column: string
    children: React.ReactNode
    className?: string
  }) => (
    <TableHead
      className={cn("cursor-pointer select-none hover:bg-muted/50", headerClassName)}
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortBy === column && (
          <span className="text-xs">{sortDirection === "asc" ? "↑" : "↓"}</span>
        )}
      </div>
    </TableHead>
  )

  return (
    <Card className={className}>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Accounts Receivable Aging
          </CardTitle>
          <CardDescription>
            {summary.customerCount} customer(s) • {summary.overduePercentage.toFixed(1)}% overdue
          </CardDescription>
        </div>
        {onExport && (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onExport("csv")}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport("excel")}>
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport("pdf")}>
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <AgingSummaryCards summary={summary} currency={currency} />

        {/* Overdue Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Overdue Amount</span>
            <span className="font-medium">
              {formatCurrency(summary.totalOverdue, currency)} of{" "}
              {formatCurrency(summary.totalOutstanding, currency)}
            </span>
          </div>
          <Progress value={summary.overduePercentage} className="h-2" />
        </div>

        {/* Data Table */}
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                {collapsible && <TableHead className="w-8" />}
                <SortableHeader column="name">Customer</SortableHeader>
                <SortableHeader column="totalOutstanding" className="text-right">
                  Total
                </SortableHeader>
                <SortableHeader column="current" className="text-right">
                  Current
                </SortableHeader>
                <SortableHeader column="days30" className="text-right">
                  1-30
                </SortableHeader>
                <SortableHeader column="days60" className="text-right">
                  31-60
                </SortableHeader>
                <SortableHeader column="days90" className="text-right">
                  61-90
                </SortableHeader>
                <SortableHeader column="days90Plus" className="text-right">
                  90+
                </SortableHeader>
                {showTrends && <TableHead className="w-12">Trend</TableHead>}
                {showRisk && <TableHead className="w-24">Risk</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((customer) => {
                const isExpanded = expandedRows.has(customer.id)
                const hasOverdue =
                  customer.buckets.days30 > 0 ||
                  customer.buckets.days60 > 0 ||
                  customer.buckets.days90 > 0 ||
                  customer.buckets.days90Plus > 0

                return (
                  <React.Fragment key={customer.id}>
                    <TableRow
                      className={cn(
                        hasOverdue && "bg-red-50/50 dark:bg-red-950/20",
                        onCustomerClick && "cursor-pointer hover:bg-muted/50"
                      )}
                    >
                      {collapsible && (
                        <TableCell className="w-8">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleRow(customer.id)
                            }}
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                      )}
                      <TableCell
                        onClick={() => onCustomerClick?.(customer)}
                        className="font-medium"
                      >
                        <div className="flex items-center gap-2">
                          <span>{customer.name}</span>
                          {customer.code && (
                            <span className="text-xs text-muted-foreground">
                              ({customer.code})
                            </span>
                          )}
                          {onCustomerClick && (
                            <ExternalLink className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(customer.totalOutstanding, currency)}
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        {formatCurrency(customer.buckets.current, currency)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right",
                          customer.buckets.days30 > 0 && "text-amber-600"
                        )}
                      >
                        {formatCurrency(customer.buckets.days30, currency)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right",
                          customer.buckets.days60 > 0 && "text-orange-600"
                        )}
                      >
                        {formatCurrency(customer.buckets.days60, currency)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right",
                          customer.buckets.days90 > 0 && "text-red-600"
                        )}
                      >
                        {formatCurrency(customer.buckets.days90, currency)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right",
                          customer.buckets.days90Plus > 0 && "font-semibold text-red-700"
                        )}
                      >
                        {formatCurrency(customer.buckets.days90Plus, currency)}
                      </TableCell>
                      {showTrends && (
                        <TableCell>
                          <TrendIndicator trend={customer.trend} />
                        </TableCell>
                      )}
                      {showRisk && (
                        <TableCell>
                          <RiskBadge level={customer.riskLevel} />
                        </TableCell>
                      )}
                    </TableRow>

                    {/* Expanded Details Row */}
                    {collapsible && isExpanded && (
                      <TableRow className="bg-muted/30">
                        <TableCell colSpan={showTrends && showRisk ? 11 : showTrends || showRisk ? 10 : 9}>
                          <div className="grid gap-4 px-4 py-3 md:grid-cols-4">
                            {customer.creditLimit !== undefined && (
                              <div>
                                <p className="text-xs text-muted-foreground">Credit Limit</p>
                                <p className="font-medium">
                                  {formatCurrency(customer.creditLimit, currency)}
                                </p>
                                {customer.totalOutstanding > customer.creditLimit && (
                                  <Badge variant="destructive" className="mt-1 text-xs">
                                    Over Limit
                                  </Badge>
                                )}
                              </div>
                            )}
                            {customer.paymentTerms && (
                              <div>
                                <p className="text-xs text-muted-foreground">Payment Terms</p>
                                <p className="font-medium">{customer.paymentTerms}</p>
                              </div>
                            )}
                            {customer.lastPaymentDate && (
                              <div>
                                <p className="text-xs text-muted-foreground">Last Payment</p>
                                <p className="font-medium">
                                  {new Date(customer.lastPaymentDate).toLocaleDateString()}
                                  {customer.lastPaymentAmount && (
                                    <span className="text-muted-foreground">
                                      {" "}
                                      ({formatCurrency(customer.lastPaymentAmount, currency)})
                                    </span>
                                  )}
                                </p>
                              </div>
                            )}
                            <div className="flex items-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onCustomerClick?.(customer)}
                              >
                                View Details
                                <ExternalLink className="ml-2 h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                )
              })}

              {/* Totals Row */}
              <TableRow className="bg-muted/50 font-semibold">
                {collapsible && <TableCell />}
                <TableCell>Total ({summary.customerCount} customers)</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(summary.totalOutstanding, currency)}
                </TableCell>
                <TableCell className="text-right text-green-600">
                  {formatCurrency(summary.totalCurrent, currency)}
                </TableCell>
                <TableCell className="text-right text-amber-600">
                  {formatCurrency(summary.total30, currency)}
                </TableCell>
                <TableCell className="text-right text-orange-600">
                  {formatCurrency(summary.total60, currency)}
                </TableCell>
                <TableCell className="text-right text-red-600">
                  {formatCurrency(summary.total90, currency)}
                </TableCell>
                <TableCell className="text-right text-red-700">
                  {formatCurrency(summary.total90Plus, currency)}
                </TableCell>
                {showTrends && <TableCell />}
                {showRisk && <TableCell />}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Exports
// ============================================================================

export type { CustomerAging, ARAgingSummary }
// AgingBucket is re-exported from blocks/types.ts
