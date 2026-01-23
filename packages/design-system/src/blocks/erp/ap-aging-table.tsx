"use client"

/**
 * AP Aging Table - ERP Domain Component
 *
 * Accounts Payable aging analysis.
 * Implements A01-CANONICAL.md §3 — Three Pillars (Obligations: "Who owes whom?")
 *
 * Features:
 * - Aging buckets (Current, 30, 60, 90, 90+)
 * - Supplier drill-down
 * - Payment scheduling
 * - Cash flow projection
 * - Export functionality
 *
 * @example
 * ```tsx
 * import { APAgingTable } from "@workspace/design-system"
 *
 * <APAgingTable
 *   data={apAgingData}
 *   onSupplierClick={(supplier) => router.push(`/suppliers/${supplier.id}`)}
 *   onSchedulePayment={(ids) => openPaymentScheduler(ids)}
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
import { Checkbox } from "../../components/checkbox"
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
  Download,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  CreditCard,
  Banknote,
} from "lucide-react"

// ============================================================================
// Types (AgingBucket imported from shared types to avoid conflicts)
// ============================================================================

import type { AgingBucket } from "../types"

export interface SupplierAging {
  id: string
  name: string
  code?: string
  totalOwed: number
  buckets: AgingBucket
  lastPaymentDate?: string
  lastPaymentAmount?: number
  paymentTerms?: string
  discountAvailable?: {
    amount: number
    dueDate: string
    terms: string // e.g., "2/10 Net 30"
  }
  preferredPaymentMethod?: "check" | "ach" | "wire" | "card"
  priority?: "low" | "normal" | "high" | "critical"
}

export interface APAgingSummary {
  totalOwed: number
  totalCurrent: number
  total30: number
  total60: number
  total90: number
  total90Plus: number
  totalOverdue: number
  overduePercentage: number
  supplierCount: number
  discountsAvailable: number
  cashRequired7Days?: number
  cashRequired30Days?: number
}

export interface APAgingTableProps {
  /** Supplier aging data */
  data: SupplierAging[]
  /** Summary totals (calculated if not provided) */
  summary?: APAgingSummary
  /** Callback when supplier is clicked */
  onSupplierClick?: (supplier: SupplierAging) => void
  /** Schedule payment callback */
  onSchedulePayment?: (supplierIds: string[]) => void
  /** Export callback */
  onExport?: (format: "csv" | "excel" | "pdf") => void
  /** Currency symbol */
  currency?: string
  /** Show discount opportunities */
  showDiscounts?: boolean
  /** Show payment scheduling */
  showPaymentScheduling?: boolean
  /** Collapsible supplier details */
  collapsible?: boolean
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

function calculateSummary(data: SupplierAging[]): APAgingSummary {
  const totals = data.reduce(
    (acc, supplier) => ({
      totalOwed: acc.totalOwed + supplier.totalOwed,
      totalCurrent: acc.totalCurrent + supplier.buckets.current,
      total30: acc.total30 + supplier.buckets.days30,
      total60: acc.total60 + supplier.buckets.days60,
      total90: acc.total90 + supplier.buckets.days90,
      total90Plus: acc.total90Plus + supplier.buckets.days90Plus,
      discountsAvailable: acc.discountsAvailable + (supplier.discountAvailable?.amount || 0),
    }),
    {
      totalOwed: 0,
      totalCurrent: 0,
      total30: 0,
      total60: 0,
      total90: 0,
      total90Plus: 0,
      discountsAvailable: 0,
    }
  )

  const totalOverdue =
    totals.total30 + totals.total60 + totals.total90 + totals.total90Plus

  return {
    ...totals,
    totalOverdue,
    overduePercentage:
      totals.totalOwed > 0
        ? (totalOverdue / totals.totalOwed) * 100
        : 0,
    supplierCount: data.length,
  }
}

function getPaymentMethodIcon(method?: string) {
  switch (method) {
    case "ach":
      return <Banknote className="h-4 w-4" />
    case "wire":
      return <DollarSign className="h-4 w-4" />
    case "card":
      return <CreditCard className="h-4 w-4" />
    default:
      return <CheckCircle className="h-4 w-4" />
  }
}

// ============================================================================
// Sub-components
// ============================================================================

function AgingSummaryCards({
  summary,
  currency,
}: {
  summary: APAgingSummary
  currency: string
}) {
  const cards = [
    {
      label: "Total Payable",
      value: summary.totalOwed,
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

function PriorityBadge({ priority }: { priority?: "low" | "normal" | "high" | "critical" }) {
  if (!priority || priority === "normal") return null

  const config = {
    low: { color: "bg-gray-100 text-gray-700", label: "Low" },
    high: { color: "bg-amber-100 text-amber-700", label: "High" },
    critical: { color: "bg-red-100 text-red-700", label: "Critical" },
  }

  const c = config[priority as keyof typeof config]
  if (!c) return null

  return <Badge className={cn("text-xs", c.color)}>{c.label}</Badge>
}

function DiscountBadge({ discount }: { discount: SupplierAging["discountAvailable"] }) {
  if (!discount) return null

  const dueDate = new Date(discount.dueDate)
  const now = new Date()
  const daysLeft = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  const isExpiringSoon = daysLeft <= 3 && daysLeft >= 0

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge
            variant="outline"
            className={cn(
              "text-xs gap-1",
              isExpiringSoon && "border-amber-500 text-amber-700 animate-pulse"
            )}
          >
            <DollarSign className="h-3 w-3" />
            Save {discount.terms}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            Take {discount.terms} discount by{" "}
            {new Date(discount.dueDate).toLocaleDateString()}
          </p>
          <p className="font-semibold">
            Save ${discount.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          {daysLeft >= 0 && <p className="text-xs">{daysLeft} days remaining</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function APAgingTable({
  data,
  summary: providedSummary,
  onSupplierClick,
  onSchedulePayment,
  onExport,
  currency = "$",
  showDiscounts = true,
  showPaymentScheduling = true,
  collapsible = true,
  className,
}: APAgingTableProps) {
  const [expandedRows, setExpandedRows] = React.useState<Set<string>>(new Set())
  const [selectedSuppliers, setSelectedSuppliers] = React.useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = React.useState<string>("totalOwed")
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

  const toggleSelection = (id: string) => {
    setSelectedSuppliers((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedSuppliers.size === data.length) {
      setSelectedSuppliers(new Set())
    } else {
      setSelectedSuppliers(new Set(data.map((s) => s.id)))
    }
  }

  const sortedData = React.useMemo(() => {
    return [...data].sort((a, b) => {
      let aVal: number | string
      let bVal: number | string

      if (sortBy === "name") {
        aVal = a.name
        bVal = b.name
      } else if (sortBy === "totalOwed") {
        aVal = a.totalOwed
        bVal = b.totalOwed
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
            Accounts Payable Aging
          </CardTitle>
          <CardDescription>
            {summary.supplierCount} supplier(s) •{" "}
            {showDiscounts && summary.discountsAvailable > 0 && (
              <span className="text-green-600">
                {formatCurrency(summary.discountsAvailable, currency)} in discounts available
              </span>
            )}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {showPaymentScheduling && selectedSuppliers.size > 0 && onSchedulePayment && (
            <Button
              size="sm"
              onClick={() => onSchedulePayment(Array.from(selectedSuppliers))}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Payment ({selectedSuppliers.size})
            </Button>
          )}
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
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <AgingSummaryCards summary={summary} currency={currency} />

        {/* Cash Flow Note */}
        {(summary.cashRequired7Days || summary.cashRequired30Days) && (
          <div className="rounded-lg bg-muted/50 p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Banknote className="h-4 w-4" />
              Cash Flow Projection
            </h4>
            <div className="grid gap-4 md:grid-cols-2">
              {summary.cashRequired7Days && (
                <div>
                  <span className="text-sm text-muted-foreground">Next 7 Days:</span>
                  <p className="text-lg font-bold">
                    {formatCurrency(summary.cashRequired7Days, currency)}
                  </p>
                </div>
              )}
              {summary.cashRequired30Days && (
                <div>
                  <span className="text-sm text-muted-foreground">Next 30 Days:</span>
                  <p className="text-lg font-bold">
                    {formatCurrency(summary.cashRequired30Days, currency)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                {showPaymentScheduling && (
                  <TableHead className="w-8">
                    <Checkbox
                      checked={selectedSuppliers.size === data.length && data.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                )}
                {collapsible && <TableHead className="w-8" />}
                <SortableHeader column="name">Supplier</SortableHeader>
                <SortableHeader column="totalOwed" className="text-right">
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
                {showDiscounts && <TableHead className="w-24">Discount</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((supplier) => {
                const isExpanded = expandedRows.has(supplier.id)
                const isSelected = selectedSuppliers.has(supplier.id)
                const hasOverdue =
                  supplier.buckets.days30 > 0 ||
                  supplier.buckets.days60 > 0 ||
                  supplier.buckets.days90 > 0 ||
                  supplier.buckets.days90Plus > 0

                return (
                  <React.Fragment key={supplier.id}>
                    <TableRow
                      className={cn(
                        hasOverdue && "bg-amber-50/50 dark:bg-amber-950/20",
                        isSelected && "bg-primary/5"
                      )}
                    >
                      {showPaymentScheduling && (
                        <TableCell className="w-8">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleSelection(supplier.id)}
                          />
                        </TableCell>
                      )}
                      {collapsible && (
                        <TableCell className="w-8">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleRow(supplier.id)
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
                        onClick={() => onSupplierClick?.(supplier)}
                        className={cn("font-medium", onSupplierClick && "cursor-pointer hover:text-primary")}
                      >
                        <div className="flex items-center gap-2">
                          <span>{supplier.name}</span>
                          {supplier.code && (
                            <span className="text-xs text-muted-foreground">
                              ({supplier.code})
                            </span>
                          )}
                          <PriorityBadge priority={supplier.priority} />
                          {onSupplierClick && (
                            <ExternalLink className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(supplier.totalOwed, currency)}
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        {formatCurrency(supplier.buckets.current, currency)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right",
                          supplier.buckets.days30 > 0 && "text-amber-600"
                        )}
                      >
                        {formatCurrency(supplier.buckets.days30, currency)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right",
                          supplier.buckets.days60 > 0 && "text-orange-600"
                        )}
                      >
                        {formatCurrency(supplier.buckets.days60, currency)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right",
                          supplier.buckets.days90 > 0 && "text-red-600"
                        )}
                      >
                        {formatCurrency(supplier.buckets.days90, currency)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right",
                          supplier.buckets.days90Plus > 0 && "font-semibold text-red-700"
                        )}
                      >
                        {formatCurrency(supplier.buckets.days90Plus, currency)}
                      </TableCell>
                      {showDiscounts && (
                        <TableCell>
                          <DiscountBadge discount={supplier.discountAvailable} />
                        </TableCell>
                      )}
                    </TableRow>

                    {/* Expanded Details Row */}
                    {collapsible && isExpanded && (
                      <TableRow className="bg-muted/30">
                        <TableCell colSpan={showPaymentScheduling ? 10 : 9}>
                          <div className="grid gap-4 px-4 py-3 md:grid-cols-4">
                            {supplier.paymentTerms && (
                              <div>
                                <p className="text-xs text-muted-foreground">Payment Terms</p>
                                <p className="font-medium">{supplier.paymentTerms}</p>
                              </div>
                            )}
                            {supplier.preferredPaymentMethod && (
                              <div>
                                <p className="text-xs text-muted-foreground">Payment Method</p>
                                <div className="flex items-center gap-1 font-medium">
                                  {getPaymentMethodIcon(supplier.preferredPaymentMethod)}
                                  <span className="capitalize">{supplier.preferredPaymentMethod}</span>
                                </div>
                              </div>
                            )}
                            {supplier.lastPaymentDate && (
                              <div>
                                <p className="text-xs text-muted-foreground">Last Payment</p>
                                <p className="font-medium">
                                  {new Date(supplier.lastPaymentDate).toLocaleDateString()}
                                  {supplier.lastPaymentAmount && (
                                    <span className="text-muted-foreground">
                                      {" "}
                                      ({formatCurrency(supplier.lastPaymentAmount, currency)})
                                    </span>
                                  )}
                                </p>
                              </div>
                            )}
                            <div className="flex items-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onSupplierClick?.(supplier)}
                              >
                                View Details
                                <ExternalLink className="ml-2 h-3 w-3" />
                              </Button>
                              {showPaymentScheduling && onSchedulePayment && (
                                <Button
                                  size="sm"
                                  onClick={() => onSchedulePayment([supplier.id])}
                                >
                                  <Calendar className="mr-1 h-3 w-3" />
                                  Schedule
                                </Button>
                              )}
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
                {showPaymentScheduling && <TableCell />}
                {collapsible && <TableCell />}
                <TableCell>Total ({summary.supplierCount} suppliers)</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(summary.totalOwed, currency)}
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
                {showDiscounts && <TableCell />}
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

export type { SupplierAging, APAgingSummary }
// AgingBucket is re-exported from blocks/types.ts
