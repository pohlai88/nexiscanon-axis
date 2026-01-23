"use client"

/**
 * Trial Balance Table - ERP Domain Component
 *
 * General Ledger trial balance display.
 * Implements A01-CANONICAL.md §3 — Three Pillars (Money)
 *
 * Features:
 * - Debit/Credit columns
 * - Account hierarchy
 * - Balance verification
 * - Period comparison
 * - Drill-down to ledger
 *
 * @example
 * ```tsx
 * import { TrialBalanceTable } from "@workspace/design-system"
 *
 * <TrialBalanceTable
 *   accounts={trialBalanceData}
 *   period="January 2026"
 *   onAccountClick={(account) => viewLedger(account.code)}
 * />
 * ```
 */

import * as React from "react"
import { cn } from "../../lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/card"
import { Badge } from "../../components/badge"
import { Button } from "../../components/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/select"
import {
  Download,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Calendar,
  RefreshCw,
  FileText,
} from "lucide-react"

// ============================================================================
// Types
// ============================================================================

export type AccountType = "asset" | "liability" | "equity" | "revenue" | "expense"

export interface TrialBalanceAccount {
  code: string
  name: string
  type: AccountType
  debit: number
  credit: number
  balance: number
  parentCode?: string
  children?: TrialBalanceAccount[]
  previousPeriodBalance?: number
  budgetBalance?: number
  variance?: number
  variancePercentage?: number
}

export interface TrialBalanceSummary {
  totalDebits: number
  totalCredits: number
  difference: number
  isBalanced: boolean
  accountCount: number
}

export interface TrialBalanceTableProps {
  /** Account data (flat or hierarchical) */
  accounts: TrialBalanceAccount[]
  /** Period label */
  period: string
  /** Available periods for comparison */
  periods?: string[]
  /** Period change callback */
  onPeriodChange?: (period: string) => void
  /** Account click callback */
  onAccountClick?: (account: TrialBalanceAccount) => void
  /** Export callback */
  onExport?: (format: "csv" | "excel" | "pdf") => void
  /** Refresh callback */
  onRefresh?: () => Promise<void>
  /** Show hierarchy */
  hierarchical?: boolean
  /** Show comparison columns */
  showComparison?: boolean
  /** Currency symbol */
  currency?: string
  /** Custom className */
  className?: string
}

// ============================================================================
// Constants
// ============================================================================

const ACCOUNT_TYPE_CONFIG: Record<AccountType, { label: string; color: string }> = {
  asset: { label: "Asset", color: "text-blue-600" },
  liability: { label: "Liability", color: "text-purple-600" },
  equity: { label: "Equity", color: "text-green-600" },
  revenue: { label: "Revenue", color: "text-emerald-600" },
  expense: { label: "Expense", color: "text-red-600" },
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

function calculateSummary(accounts: TrialBalanceAccount[]): TrialBalanceSummary {
  const flatAccounts = flattenAccounts(accounts)
  const totalDebits = flatAccounts.reduce((sum, acc) => sum + acc.debit, 0)
  const totalCredits = flatAccounts.reduce((sum, acc) => sum + acc.credit, 0)
  const difference = Math.abs(totalDebits - totalCredits)

  return {
    totalDebits,
    totalCredits,
    difference,
    isBalanced: difference < 0.01, // Allow for rounding errors
    accountCount: flatAccounts.length,
  }
}

function flattenAccounts(accounts: TrialBalanceAccount[]): TrialBalanceAccount[] {
  const result: TrialBalanceAccount[] = []

  function flatten(accs: TrialBalanceAccount[]) {
    for (const acc of accs) {
      result.push(acc)
      if (acc.children) {
        flatten(acc.children)
      }
    }
  }

  flatten(accounts)
  return result
}

// ============================================================================
// Account Row Component
// ============================================================================

function AccountRow({
  account,
  level = 0,
  onAccountClick,
  showComparison,
  currency,
  hierarchical,
}: {
  account: TrialBalanceAccount
  level?: number
  onAccountClick?: (account: TrialBalanceAccount) => void
  showComparison: boolean
  currency: string
  hierarchical: boolean
}) {
  const [isExpanded, setIsExpanded] = React.useState(true)
  const hasChildren = account.children && account.children.length > 0
  const typeConfig = ACCOUNT_TYPE_CONFIG[account.type]

  return (
    <>
      <TableRow
        className={cn(
          level === 0 && "bg-muted/30 font-medium",
          onAccountClick && "cursor-pointer hover:bg-muted/50"
        )}
        onClick={() => {
          if (!hasChildren || !hierarchical) {
            onAccountClick?.(account)
          }
        }}
      >
        <TableCell className="font-mono">
          <div
            className="flex items-center gap-2"
            style={{ paddingLeft: `${level * 20}px` }}
          >
            {hierarchical && hasChildren && (
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsExpanded(!isExpanded)
                }}
              >
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </Button>
            )}
            {!hasChildren && hierarchical && <span className="w-5" />}
            <span>{account.code}</span>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <span className={cn(level === 0 && "font-semibold")}>{account.name}</span>
            {onAccountClick && !hasChildren && (
              <ExternalLink className="h-3 w-3 text-muted-foreground" />
            )}
          </div>
        </TableCell>
        <TableCell className={cn("text-right", typeConfig.color)}>
          <Badge variant="outline" className="text-xs">
            {typeConfig.label}
          </Badge>
        </TableCell>
        <TableCell className="text-right font-mono">
          {account.debit > 0 ? formatCurrency(account.debit, currency) : "—"}
        </TableCell>
        <TableCell className="text-right font-mono">
          {account.credit > 0 ? formatCurrency(account.credit, currency) : "—"}
        </TableCell>
        <TableCell
          className={cn(
            "text-right font-mono font-medium",
            account.balance > 0 ? "text-blue-600" : account.balance < 0 ? "text-red-600" : ""
          )}
        >
          {formatCurrency(account.balance, currency)}
        </TableCell>
        {showComparison && (
          <>
            <TableCell className="text-right font-mono text-muted-foreground">
              {account.previousPeriodBalance !== undefined
                ? formatCurrency(account.previousPeriodBalance, currency)
                : "—"}
            </TableCell>
            <TableCell
              className={cn(
                "text-right font-mono",
                account.variance && account.variance > 0
                  ? "text-green-600"
                  : account.variance && account.variance < 0
                  ? "text-red-600"
                  : ""
              )}
            >
              {account.variance !== undefined ? (
                <>
                  {account.variance > 0 ? "+" : ""}
                  {formatCurrency(account.variance, currency)}
                  {account.variancePercentage !== undefined && (
                    <span className="text-xs ml-1">
                      ({account.variancePercentage > 0 ? "+" : ""}
                      {account.variancePercentage.toFixed(1)}%)
                    </span>
                  )}
                </>
              ) : (
                "—"
              )}
            </TableCell>
          </>
        )}
      </TableRow>

      {/* Children */}
      {hierarchical && hasChildren && isExpanded && (
        <>
          {account.children!.map((child) => (
            <AccountRow
              key={child.code}
              account={child}
              level={level + 1}
              onAccountClick={onAccountClick}
              showComparison={showComparison}
              currency={currency}
              hierarchical={hierarchical}
            />
          ))}
        </>
      )}
    </>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function TrialBalanceTable({
  accounts,
  period,
  periods = [],
  onPeriodChange,
  onAccountClick,
  onExport,
  onRefresh,
  hierarchical = true,
  showComparison = false,
  currency = "$",
  className,
}: TrialBalanceTableProps) {
  const [selectedPeriod, setSelectedPeriod] = React.useState(period)
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  const summary = calculateSummary(accounts)

  const handlePeriodChange = (newPeriod: string | null) => {
    if (!newPeriod) return
    setSelectedPeriod(newPeriod)
    onPeriodChange?.(newPeriod)
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
              <FileText className="h-5 w-5" />
              Trial Balance
            </CardTitle>
            <CardDescription>
              {summary.accountCount} accounts • Period: {selectedPeriod}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {periods.length > 0 && onPeriodChange && (
              <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
                <SelectTrigger className="w-[160px]">
                  <Calendar className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {periods.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
        </div>

        {/* Balance Status */}
        <div
          className={cn(
            "mt-4 flex items-center gap-2 rounded-lg p-3",
            summary.isBalanced
              ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
              : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
          )}
        >
          {summary.isBalanced ? (
            <>
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Trial Balance is in balance</span>
            </>
          ) : (
            <>
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">
                Out of balance by {formatCurrency(summary.difference, currency)}
              </span>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Code</TableHead>
                <TableHead>Account Name</TableHead>
                <TableHead className="w-[100px]">Type</TableHead>
                <TableHead className="w-[140px] text-right">Debit</TableHead>
                <TableHead className="w-[140px] text-right">Credit</TableHead>
                <TableHead className="w-[140px] text-right">Balance</TableHead>
                {showComparison && (
                  <>
                    <TableHead className="w-[140px] text-right">Prior Period</TableHead>
                    <TableHead className="w-[160px] text-right">Variance</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <AccountRow
                  key={account.code}
                  account={account}
                  onAccountClick={onAccountClick}
                  showComparison={showComparison}
                  currency={currency}
                  hierarchical={hierarchical}
                />
              ))}

              {/* Totals Row */}
              <TableRow className="bg-muted font-bold">
                <TableCell colSpan={3}>Total</TableCell>
                <TableCell className="text-right font-mono">
                  {formatCurrency(summary.totalDebits, currency)}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatCurrency(summary.totalCredits, currency)}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right font-mono",
                    !summary.isBalanced && "text-red-600"
                  )}
                >
                  {summary.isBalanced
                    ? "Balanced"
                    : `Diff: ${formatCurrency(summary.difference, currency)}`}
                </TableCell>
                {showComparison && (
                  <>
                    <TableCell />
                    <TableCell />
                  </>
                )}
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

export type { AccountType, TrialBalanceAccount, TrialBalanceSummary }
