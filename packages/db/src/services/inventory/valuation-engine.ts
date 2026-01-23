/**
 * Inventory Valuation Engine (B06)
 *
 * AXIS Canonical Implementation:
 * - Weighted Average: Running average cost per item/location
 * - FIFO: First-In-First-Out cost layer tracking
 * - Standard Cost: Variance tracking
 *
 * @see .cursor/ERP/A01-CANONICAL.md §3 (Goods Pillar)
 * @see .cursor/ERP/B06-INVENTORY.md (Valuation)
 */

import type { Database } from "../..";
import {
  type ValuationEntry,
  type CostLayer,
  type StockMove,
  type StockMoveLine,
} from "@axis/registry";

// ============================================================================
// Valuation Result Types
// ============================================================================

export interface ValuationResult {
  success: boolean;
  entries: ValuationEntry[];
  costLayers?: CostLayer[]; // For FIFO
  totalValue: string;
  errors?: string[];
}

export interface ItemValuation {
  itemId: string;
  locationId: string;
  quantity: number;
  averageCost: string;
  totalValue: string;
  costingMethod: "weighted_average" | "fifo" | "standard";
}

// ============================================================================
// Weighted Average Valuation
// ============================================================================

/**
 * Calculates weighted average cost for stock move
 *
 * Formula: New Avg Cost = (Old Value + New Value) / (Old Qty + New Qty)
 *
 * @param _db - Database connection
 * @param stockMove - Stock move to valuate
 * @returns Valuation entries
 */
export async function valuateWeightedAverage(
  _db: Database,
  stockMove: StockMove
): Promise<ValuationResult> {
  const entries: ValuationEntry[] = [];
  let totalValue = 0;

  for (const line of stockMove.lines) {
    // Get current valuation for item/location
    const current = await getCurrentValuation(
      _db,
      line.itemId,
      line.toLocationId || line.fromLocationId!
    );

    let unitCost: number;
    let newQuantity: number;
    let newValue: number;

    if (stockMove.moveType === "receipt" || stockMove.moveType === "adjustment_in" || stockMove.moveType === "return_in" || stockMove.moveType === "production_in") {
      // Receipt: Add to inventory
      const receiptCost = parseFloat(line.unitCost);
      const receiptValue = receiptCost * line.baseQuantity;

      newQuantity = current.quantity + line.baseQuantity;
      newValue = current.value + receiptValue;
      unitCost = newValue / newQuantity;
    } else {
      // Issue: Remove from inventory at average cost
      unitCost = current.averageCost;
      newQuantity = current.quantity - line.baseQuantity;
      newValue = current.value - (unitCost * line.baseQuantity);
    }

    const entry: ValuationEntry = {
      id: crypto.randomUUID(),
      tenantId: stockMove.tenantId,
      stockMoveId: stockMove.id,
      stockMoveLineNumber: line.lineNumber,
      itemId: line.itemId,
      locationId: line.toLocationId || line.fromLocationId!,
      lotNumber: line.lotNumber,
      quantity: (stockMove.moveType === "receipt" || stockMove.moveType === "adjustment_in" || stockMove.moveType === "return_in" || stockMove.moveType === "production_in") ? line.baseQuantity : -line.baseQuantity,
      baseUomId: line.baseUomId,
      costingMethod: "weighted_average",
      unitCost: unitCost.toFixed(4),
      totalCost: (unitCost * line.baseQuantity).toFixed(2),
      runningQuantity: newQuantity,
      runningValue: newValue.toFixed(2),
      runningAverageCost: (newValue / newQuantity).toFixed(4),
      effectiveDate: stockMove.movedDate || stockMove.createdAt,
      createdAt: new Date().toISOString(),
    };

    entries.push(entry);
    totalValue += parseFloat(entry.totalCost);
  }

  // TODO: Persist entries to database when tables are ready
  // await db.insert(valuationEntries).values(entries);

  return {
    success: true,
    entries,
    totalValue: totalValue.toFixed(2),
  };
}

/**
 * Gets current valuation for item/location
 *
 * @param _db - Database connection
 * @param _itemId - Item to query
 * @param _locationId - Location to query
 * @returns Current quantity, value, and average cost
 */
async function getCurrentValuation(
  _db: Database,
  _itemId: string,
  _locationId: string
): Promise<{
  quantity: number;
  value: number;
  averageCost: number;
}> {
  // TODO: Query from database when tables are ready
  // SELECT SUM(quantity) as qty, SUM(totalCost) as val
  // FROM valuation_entries
  // WHERE _itemId = ? AND _locationId = ?

  return {
    quantity: 0,
    value: 0,
    averageCost: 0,
  };
}

// ============================================================================
// FIFO Valuation
// ============================================================================

/**
 * Calculates FIFO cost for stock move
 *
 * Receipt: Creates new cost layer
 * Issue: Consumes oldest cost layers first
 *
 * @param _db - Database connection
 * @param stockMove - Stock move to valuate
 * @returns Valuation entries and cost layers
 */
export async function valuateFIFO(
  _db: Database,
  stockMove: StockMove
): Promise<ValuationResult> {
  const entries: ValuationEntry[] = [];
  const costLayers: CostLayer[] = [];
  let totalValue = 0;

  for (const line of stockMove.lines) {
    if (stockMove.moveType === "receipt" || stockMove.moveType === "adjustment_in" || stockMove.moveType === "return_in" || stockMove.moveType === "production_in") {
      // Receipt: Create new cost layer
      const layer = await createCostLayer(_db, stockMove, line);
      costLayers.push(layer);

      const entry: ValuationEntry = {
        id: crypto.randomUUID(),
        tenantId: stockMove.tenantId,
        stockMoveId: stockMove.id,
        stockMoveLineNumber: line.lineNumber,
        itemId: line.itemId,
        locationId: line.toLocationId!,
        lotNumber: line.lotNumber,
        quantity: line.baseQuantity,
        baseUomId: line.baseUomId,
        costingMethod: "fifo",
        unitCost: line.unitCost,
        totalCost: line.totalCost,
        costLayerId: layer.id,
        runningQuantity: 0, // TODO: Calculate from all layers
        runningValue: "0", // TODO: Calculate from all layers
        runningAverageCost: line.unitCost, // Not used in FIFO
        effectiveDate: stockMove.movedDate || stockMove.createdAt,
        createdAt: new Date().toISOString(),
      };

      entries.push(entry);
      totalValue += parseFloat(entry.totalCost);
    } else {
      // Issue: Consume oldest layers
      const consumed = await consumeCostLayers(
        _db,
        line.itemId,
        line.fromLocationId!,
        line.baseQuantity,
        line.lotNumber
      );

      for (const consumption of consumed) {
        const entry: ValuationEntry = {
          id: crypto.randomUUID(),
          tenantId: stockMove.tenantId,
          stockMoveId: stockMove.id,
          stockMoveLineNumber: line.lineNumber,
          itemId: line.itemId,
          locationId: line.fromLocationId!,
          lotNumber: line.lotNumber,
          quantity: -consumption.quantity,
          baseUomId: line.baseUomId,
          costingMethod: "fifo",
          unitCost: consumption.unitCost,
          totalCost: (consumption.quantity * parseFloat(consumption.unitCost)).toFixed(2),
          costLayerId: consumption.layerId,
          runningQuantity: 0, // TODO: Calculate
          runningValue: "0", // TODO: Calculate
          runningAverageCost: consumption.unitCost,
          effectiveDate: stockMove.movedDate || stockMove.createdAt,
          createdAt: new Date().toISOString(),
        };

        entries.push(entry);
        totalValue += parseFloat(entry.totalCost);
      }
    }
  }

  // TODO: Persist entries and update layers in database

  return {
    success: true,
    entries,
    costLayers: costLayers.length > 0 ? costLayers : undefined,
    totalValue: totalValue.toFixed(2),
  };
}

/**
 * Creates new FIFO cost layer for receipt
 */
async function createCostLayer(
  _db: Database,
  stockMove: StockMove,
  line: StockMoveLine
): Promise<CostLayer> {
  const layer: CostLayer = {
    id: crypto.randomUUID(),
    tenantId: stockMove.tenantId,
    itemId: line.itemId,
    locationId: line.toLocationId!,
    lotNumber: line.lotNumber,
    receiptMoveId: stockMove.id,
    receiptDate: stockMove.movedDate || stockMove.createdAt,
    originalQuantity: line.baseQuantity,
    remainingQuantity: line.baseQuantity,
    consumedQuantity: 0,
    unitCost: line.unitCost,
    isExhausted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // TODO: Persist to database
  // await db.insert(costLayers).values(layer);

  return layer;
}

/**
 * Consumes cost layers for FIFO issue
 *
 * @returns Array of consumptions from oldest to newest
 */
async function consumeCostLayers(
  _db: Database,
  _itemId: string,
  _locationId: string,
  _quantityNeeded: number,
  _lotNumber?: string
): Promise<Array<{
  layerId: string;
  quantity: number;
  unitCost: string;
}>> {
  // TODO: Query oldest layers first
  // SELECT * FROM cost_layers
  // WHERE _itemId = ? AND _locationId = ? AND remainingQuantity > 0
  // ORDER BY receiptDate ASC

  const consumptions: Array<{
    layerId: string;
    quantity: number;
    unitCost: string;
  }> = [];

  let _remaining = _quantityNeeded;

  // Mock: Would iterate through layers
  // while (remaining > 0 && layers.length > 0) {
  //   const layer = layers.shift();
  //   const consumeQty = Math.min(remaining, layer.remainingQuantity);
  //   consumptions.push({
  //     layerId: layer.id,
  //     quantity: consumeQty,
  //     unitCost: layer.unitCost,
  //   });
  //   _remaining -= consumeQty;
  // }

  return consumptions;
}

// ============================================================================
// Standard Cost Valuation
// ============================================================================

/**
 * Calculates standard cost with variance tracking
 *
 * @param _db - Database connection
 * @param stockMove - Stock move to valuate
 * @returns Valuation entries with price variance
 */
export async function valuateStandardCost(
  _db: Database,
  stockMove: StockMove
): Promise<ValuationResult> {
  const entries: ValuationEntry[] = [];
  let totalValue = 0;

  for (const line of stockMove.lines) {
    // Get standard cost for item
    const standardCost = await getStandardCost(_db, line.itemId);
    const actualCost = parseFloat(line.unitCost);
    const variance = (actualCost - standardCost) * line.baseQuantity;
    const isReceipt = stockMove.moveType === "receipt" || stockMove.moveType === "adjustment_in" || stockMove.moveType === "return_in" || stockMove.moveType === "production_in";

    const entry: ValuationEntry = {
      id: crypto.randomUUID(),
      tenantId: stockMove.tenantId,
      stockMoveId: stockMove.id,
      stockMoveLineNumber: line.lineNumber,
      itemId: line.itemId,
      locationId: line.toLocationId || line.fromLocationId!,
      lotNumber: line.lotNumber,
      quantity: isReceipt ? line.baseQuantity : -line.baseQuantity,
      baseUomId: line.baseUomId,
      costingMethod: "standard",
      unitCost: standardCost.toFixed(4),
      totalCost: (standardCost * line.baseQuantity).toFixed(2),
      standardCost: standardCost.toFixed(4),
      priceVariance: variance.toFixed(2),
      runningQuantity: 0, // TODO: Calculate
      runningValue: "0", // TODO: Calculate
      runningAverageCost: standardCost.toFixed(4),
      effectiveDate: stockMove.movedDate || stockMove.createdAt,
      createdAt: new Date().toISOString(),
    };

    entries.push(entry);
    totalValue += parseFloat(entry.totalCost);
  }

  // TODO: Persist entries to database

  return {
    success: true,
    entries,
    totalValue: totalValue.toFixed(2),
  };
}

/**
 * Gets standard cost for item
 */
async function getStandardCost(
  _db: Database,
  _itemId: string
): Promise<number> {
  // TODO: Query from item master
  // SELECT standardCost FROM items WHERE id = ?

  return 0;
}

// ============================================================================
// Valuation Report
// ============================================================================

/**
 * Gets inventory valuation report
 *
 * @param _db - Database connection
 * @param tenantId - Tenant filter
 * @param asOfDate - Valuation date
 * @returns Inventory valuation by item/location
 */
export async function getInventoryValuation(
  _db: Database,
  _tenantId: string,
  _asOfDate: string
): Promise<ItemValuation[]> {
  // TODO: Query valuation entries up to asOfDate
  // GROUP BY itemId, locationId
  // Calculate running totals

  return [];
}

// ============================================================================
// Export Public API
// ============================================================================

export const ValuationEngine = {
  valuateWeightedAverage,
  valuateFIFO,
  valuateStandardCost,
  getInventoryValuation,
} as const;
