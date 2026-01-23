"use client"

/**
 * Inventory Valuation Card - ERP Domain Component
 *
 * Stock valuation and costing method display.
 * Implements A01-CANONICAL.md §3 — Three Pillars (Goods)
 *
 * Features:
 * - On-hand quantity display
 * - Valuation amount with costing method
 * - Cost per unit
 * - Stock level indicators
 * - Movement history link
 *
 * @example
 * ```tsx
 * import { InventoryValuationCard } from "@workspace/design-system"
 *
 * <InventoryValuationCard
 *   item={inventoryItem}
 *   onViewMovements={(itemId) => router.push(`/inventory/${itemId}/movements`)}
 *   onAdjust={(itemId) => openAdjustmentModal(itemId)}
 * />
 * ```
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/card"
import { Badge } from "@/components/badge"
import { Button } from "@/components/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/tooltip"
import {
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ArrowRight,
  History,
  Edit,
  Box,
  AlertCircle,
  CheckCircle,
} from "lucide-react"

// ============================================================================
// Types
// ============================================================================

export type CostingMethod = "fifo" | "lifo" | "weighted_avg" | "standard" | "specific"
export type StockLevel = "out_of_stock" | "low" | "normal" | "overstock"

export interface InventoryItem {
  id: string
  sku: string
  name: string
  description?: string
  category?: string
  onHand: number
  unit: string
  unitCost: number
  totalValue: number
  costingMethod: CostingMethod
  reorderPoint?: number
  maxStock?: number
  lastReceived?: string | Date
  lastIssued?: string | Date
  turnoverRate?: number // Annual turnover
  daysOfStock?: number
  trend?: {
    direction: "up" | "down" | "stable"
    percentage: number
    period: string
  }
  alerts?: {
    type: "reorder" | "overstock" | "slow_moving" | "expired"
    message: string
  }[]
}

export interface InventoryValuationCardProps {
  /** Inventory item data */
  item: InventoryItem
  /** View movements callback */
  onViewMovements?: (itemId: string) => void
  /** Adjust stock callback */
  onAdjust?: (itemId: string) => void
  /** View details callback */
  onViewDetails?: (itemId: string) => void
  /** Currency symbol */
  currency?: string
  /** Compact mode */
  compact?: boolean
  /** Custom className */
  className?: string
}

// ============================================================================
// Constants
// ============================================================================

const COSTING_LABELS: Record<CostingMethod, string> = {
  fifo: "FIFO",
  lifo: "LIFO",
  weighted_avg: "Weighted Avg",
  standard: "Standard",
  specific: "Specific ID",
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

function getStockLevel(item: InventoryItem): StockLevel {
  if (item.onHand === 0) return "out_of_stock"
  if (item.reorderPoint && item.onHand <= item.reorderPoint) return "low"
  if (item.maxStock && item.onHand >= item.maxStock) return "overstock"
  return "normal"
}

// ============================================================================
// Sub-components
// ============================================================================

function StockLevelIndicator({ level, quantity, unit }: { level: StockLevel; quantity: number; unit: string }) {
  const config = {
    out_of_stock: { color: "text-red-600", bg: "bg-red-100", label: "Out of Stock", icon: AlertCircle },
    low: { color: "text-amber-600", bg: "bg-amber-100", label: "Low Stock", icon: AlertTriangle },
    normal: { color: "text-green-600", bg: "bg-green-100", label: "In Stock", icon: CheckCircle },
    overstock: { color: "text-blue-600", bg: "bg-blue-100", label: "Overstock", icon: Box },
  }

  const c = config[level]
  const Icon = c.icon

  return (
    <div className={cn("inline-flex items-center gap-1.5 rounded-md px-2 py-1", c.bg)}>
      <Icon className={cn("h-4 w-4", c.color)} />
      <span className={cn("text-sm font-medium", c.color)}>
        {quantity.toLocaleString()} {unit}
      </span>
    </div>
  )
}

function StockProgressBar({
  onHand,
  reorderPoint,
  maxStock,
}: {
  onHand: number
  reorderPoint?: number
  maxStock?: number
}) {
  if (!maxStock) return null

  const percentage = Math.min((onHand / maxStock) * 100, 100)
  const reorderPercentage = reorderPoint ? (reorderPoint / maxStock) * 100 : 0

  return (
    <div className="space-y-1">
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full transition-all",
            percentage < reorderPercentage
              ? "bg-red-500"
              : percentage > 90
              ? "bg-blue-500"
              : "bg-green-500"
          )}
          style={{ width: `${percentage}%` }}
        />
        {reorderPoint && (
          <div
            className="absolute top-0 h-full w-0.5 bg-amber-500"
            style={{ left: `${reorderPercentage}%` }}
          />
        )}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0</span>
        {reorderPoint && <span className="text-amber-600">Reorder: {reorderPoint}</span>}
        <span>Max: {maxStock}</span>
      </div>
    </div>
  )
}

function TrendBadge({ trend }: { trend: InventoryItem["trend"] }) {
  if (!trend) return null

  const Icon = trend.direction === "up" ? TrendingUp : trend.direction === "down" ? TrendingDown : null

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <span
            className={cn(
              "inline-flex items-center gap-1 text-xs",
              trend.direction === "up" && "text-green-600",
              trend.direction === "down" && "text-red-600"
            )}
          >
            {Icon && <Icon className="h-3 w-3" />}
            {trend.percentage > 0 ? "+" : ""}
            {trend.percentage}%
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {trend.direction === "up" ? "Increased" : "Decreased"} {trend.percentage}% vs {trend.period}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function AlertBadges({ alerts }: { alerts?: InventoryItem["alerts"] }) {
  if (!alerts || alerts.length === 0) return null

  const alertConfig = {
    reorder: { color: "bg-amber-100 text-amber-700 border-amber-300", icon: AlertTriangle },
    overstock: { color: "bg-blue-100 text-blue-700 border-blue-300", icon: Box },
    slow_moving: { color: "bg-gray-100 text-gray-700 border-gray-300", icon: TrendingDown },
    expired: { color: "bg-red-100 text-red-700 border-red-300", icon: AlertCircle },
  }

  return (
    <div className="flex flex-wrap gap-1">
      {alerts.map((alert, index) => {
        const config = alertConfig[alert.type]
        const Icon = config.icon
        return (
          <TooltipProvider key={index}>
            <Tooltip>
              <TooltipTrigger>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs",
                    config.color
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {alert.type.replace("_", " ")}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{alert.message}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      })}
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function InventoryValuationCard({
  item,
  onViewMovements,
  onAdjust,
  onViewDetails,
  currency = "$",
  compact = false,
  className,
}: InventoryValuationCardProps) {
  const stockLevel = getStockLevel(item)

  return (
    <Card className={cn(stockLevel === "out_of_stock" && "border-red-300", className)}>
      <CardHeader className={cn(compact && "pb-2")}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-base">{item.name}</CardTitle>
              <Badge variant="outline" className="text-xs">
                {item.sku}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {COSTING_LABELS[item.costingMethod]}
              </Badge>
            </div>
            {item.description && !compact && (
              <CardDescription className="mt-1">{item.description}</CardDescription>
            )}
          </div>
          <Package className="h-5 w-5 text-muted-foreground shrink-0" />
        </div>
        <AlertBadges alerts={item.alerts} />
      </CardHeader>

      <CardContent className={cn("space-y-4", compact && "pt-0")}>
        {/* Stock Level */}
        <div className="flex items-center justify-between">
          <StockLevelIndicator level={stockLevel} quantity={item.onHand} unit={item.unit} />
          <TrendBadge trend={item.trend} />
        </div>

        {/* Stock Progress */}
        {!compact && (
          <StockProgressBar
            onHand={item.onHand}
            reorderPoint={item.reorderPoint}
            maxStock={item.maxStock}
          />
        )}

        {/* Valuation */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Unit Cost</p>
            <p className="text-lg font-bold">{formatCurrency(item.unitCost, currency)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Value</p>
            <p className="text-lg font-bold">{formatCurrency(item.totalValue, currency)}</p>
          </div>
        </div>

        {/* Additional Metrics */}
        {!compact && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            {item.turnoverRate !== undefined && (
              <div>
                <p className="text-xs text-muted-foreground">Turnover Rate</p>
                <p className="font-medium">{item.turnoverRate.toFixed(1)}x / year</p>
              </div>
            )}
            {item.daysOfStock !== undefined && (
              <div>
                <p className="text-xs text-muted-foreground">Days of Stock</p>
                <p className="font-medium">{item.daysOfStock} days</p>
              </div>
            )}
            {item.lastReceived && (
              <div>
                <p className="text-xs text-muted-foreground">Last Received</p>
                <p className="font-medium">
                  {new Date(item.lastReceived).toLocaleDateString()}
                </p>
              </div>
            )}
            {item.lastIssued && (
              <div>
                <p className="text-xs text-muted-foreground">Last Issued</p>
                <p className="font-medium">
                  {new Date(item.lastIssued).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Actions */}
      <CardFooter className="gap-2">
        {onViewMovements && (
          <Button variant="outline" size="sm" onClick={() => onViewMovements(item.id)}>
            <History className="mr-1 h-3 w-3" />
            Movements
          </Button>
        )}
        {onAdjust && (
          <Button variant="outline" size="sm" onClick={() => onAdjust(item.id)}>
            <Edit className="mr-1 h-3 w-3" />
            Adjust
          </Button>
        )}
        {onViewDetails && (
          <Button variant="ghost" size="sm" onClick={() => onViewDetails(item.id)}>
            Details
            <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

// ============================================================================
// Grid Component for Multiple Items
// ============================================================================

export interface InventoryValuationGridProps {
  /** Inventory items */
  items: InventoryItem[]
  /** View movements callback */
  onViewMovements?: (itemId: string) => void
  /** Adjust stock callback */
  onAdjust?: (itemId: string) => void
  /** View details callback */
  onViewDetails?: (itemId: string) => void
  /** Currency symbol */
  currency?: string
  /** Columns */
  columns?: 2 | 3 | 4
  /** Custom className */
  className?: string
}

export function InventoryValuationGrid({
  items,
  onViewMovements,
  onAdjust,
  onViewDetails,
  currency = "$",
  columns = 3,
  className,
}: InventoryValuationGridProps) {
  const gridCols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-2 lg:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  }

  // Summary stats
  const totalValue = items.reduce((sum, item) => sum + item.totalValue, 0)
  const outOfStock = items.filter((item) => item.onHand === 0).length
  const lowStock = items.filter(
    (item) => item.reorderPoint && item.onHand <= item.reorderPoint && item.onHand > 0
  ).length

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Inventory Valuation
        </CardTitle>
        <CardDescription>
          {items.length} item{items.length !== 1 ? "s" : ""} •{" "}
          Total: {formatCurrency(totalValue, currency)}
          {outOfStock > 0 && (
            <span className="text-red-600"> • {outOfStock} out of stock</span>
          )}
          {lowStock > 0 && (
            <span className="text-amber-600"> • {lowStock} low stock</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className={cn("grid gap-4", gridCols[columns])}>
          {items.map((item) => (
            <InventoryValuationCard
              key={item.id}
              item={item}
              onViewMovements={onViewMovements}
              onAdjust={onAdjust}
              onViewDetails={onViewDetails}
              currency={currency}
              compact
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Exports
// ============================================================================

export type { CostingMethod, StockLevel, InventoryItem }
