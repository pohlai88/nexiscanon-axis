/**
 * COGS Calculation Service
 * 
 * Helper functions for cost of goods sold calculations and inventory valuation.
 */

import { eq, sum } from "drizzle-orm";
import type { Database } from "../../client";
import { stockLevels } from "../../schema/inventory/stock-level";

/**
 * Calculate weighted average cost after receipt.
 * 
 * Formula: (CurrentValue + ReceiptValue) / (CurrentQty + ReceiptQty)
 */
export function calculateWeightedAverageCost(
  currentQty: number,
  currentAvgCost: number,
  receiptQty: number,
  receiptCost: number
): number {
  if (currentQty + receiptQty === 0) return 0;

  const currentValue = currentQty * currentAvgCost;
  const receiptValue = receiptQty * receiptCost;
  const newQty = currentQty + receiptQty;

  return (currentValue + receiptValue) / newQty;
}

/**
 * Calculate COGS for stock issue.
 * 
 * COGS = Quantity Issued * Average Unit Cost
 */
export function calculateCOGSForIssue(
  issueQty: number,
  averageUnitCost: number
): number {
  return issueQty * averageUnitCost;
}

/**
 * Get total inventory valuation for tenant.
 */
export async function getInventoryValuation(
  db: Database,
  tenantId: string
): Promise<{ totalValue: string; currency: string }> {
  const result = await db
    .select({
      totalValue: sum(stockLevels.totalValue),
    })
    .from(stockLevels)
    .where(eq(stockLevels.tenantId, tenantId));

  return {
    totalValue: result[0]?.totalValue || "0",
    currency: "USD", // Could be multi-currency in future
  };
}

/**
 * Calculate inventory turnover ratio.
 * 
 * Formula: COGS / Average Inventory Value
 * 
 * Note: Requires historical data for accurate calculation.
 * This is a simplified version using current inventory value.
 */
export async function getInventoryTurnover(
  db: Database,
  tenantId: string,
  periodCOGS: number
): Promise<{ turnoverRatio: number; daysInventory: number }> {
  const { totalValue } = await getInventoryValuation(db, tenantId);
  const avgInventoryValue = parseFloat(totalValue);

  if (avgInventoryValue === 0) {
    return { turnoverRatio: 0, daysInventory: 0 };
  }

  const turnoverRatio = periodCOGS / avgInventoryValue;
  const daysInventory = 365 / turnoverRatio;

  return {
    turnoverRatio,
    daysInventory,
  };
}
