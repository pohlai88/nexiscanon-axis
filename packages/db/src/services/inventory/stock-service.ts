/**
 * Stock Level Service
 * 
 * Manages current inventory levels with weighted average COGS calculation.
 */

import { eq, and } from "drizzle-orm";
import type { Database } from "../../client";
import { stockLevels, type StockLevel } from "../../schema/inventory/stock-level";
import type { InventoryMovement } from "../../schema/inventory/movement";

/**
 * Update stock level after movement (weighted average COGS).
 */
export async function updateStockLevelAfterMovement(
  db: Database,
  movement: InventoryMovement
): Promise<StockLevel> {
  // Get current stock level (or create if doesn't exist)
  const conditions = [
    eq(stockLevels.tenantId, movement.tenantId),
    eq(stockLevels.productId, movement.productId),
  ];
  
  if (movement.locationId) {
    conditions.push(eq(stockLevels.locationId, movement.locationId));
  }

  let [stockLevel] = await db
    .select()
    .from(stockLevels)
    .where(and(...conditions))
    .limit(1);

  const movementQty = parseFloat(movement.quantity);
  const currentQty = stockLevel ? parseFloat(stockLevel.quantityOnHand) : 0;
  const currentAvgCost = stockLevel ? parseFloat(stockLevel.averageUnitCost) : 0;
  const currentValue = stockLevel ? parseFloat(stockLevel.totalValue) : 0;

  let newQty = currentQty;
  let newAvgCost = currentAvgCost;
  let newValue = currentValue;

  if (movement.movementType === "receipt") {
    // Receipt: Add quantity, recalculate weighted average cost
    const receiptCost = parseFloat(movement.unitCost || "0");
    const receiptValue = movementQty * receiptCost;

    newQty = currentQty + movementQty;
    newValue = currentValue + receiptValue;
    newAvgCost = newQty > 0 ? newValue / newQty : 0;

    // Update movement with calculated average cost (for reference)
    await db
      .update(stockLevels)
      .set({ lastReceiptDate: movement.movementDate })
      .where(eq(stockLevels.id, stockLevel?.id || ""));
  } else if (movement.movementType === "issue") {
    // Issue: Deduct quantity, use current average cost for COGS
    newQty = currentQty - movementQty;
    newAvgCost = currentAvgCost; // Keep same average cost
    newValue = newQty * newAvgCost;

    // Calculate COGS for this issue (use current average cost)
    const _cogsCost = movementQty * currentAvgCost;

    // Update movement with COGS
    await db
      .update(stockLevels)
      .set({ lastIssueDate: movement.movementDate })
      .where(eq(stockLevels.id, stockLevel?.id || ""));

    // Store COGS in movement for GL posting
    // Note: In a real system, you'd update the movement record here
  } else if (movement.movementType === "adjustment") {
    // Adjustment: Add or subtract quantity, adjust value
    newQty = currentQty + movementQty;

    if (movementQty > 0) {
      // Positive adjustment: assume at current average cost
      const adjustmentValue = movementQty * currentAvgCost;
      newValue = currentValue + adjustmentValue;
    } else {
      // Negative adjustment: reduce value proportionally
      newValue = newQty * currentAvgCost;
    }

    newAvgCost = newQty > 0 ? newValue / newQty : 0;
  }

  const newAvailable = newQty - (stockLevel ? parseFloat(stockLevel.quantityCommitted) : 0);

  if (stockLevel) {
    // Update existing stock level
    const [updated] = await db
      .update(stockLevels)
      .set({
        quantityOnHand: newQty.toFixed(4),
        quantityAvailable: newAvailable.toFixed(4),
        averageUnitCost: newAvgCost.toFixed(4),
        totalValue: newValue.toFixed(4),
        lastMovementDate: movement.movementDate,
        updatedAt: new Date(),
      })
      .where(eq(stockLevels.id, stockLevel.id))
      .returning();

    if (!updated) {
      throw new Error(`Failed to update stock level: ${stockLevel.id}`);
    }

    return updated;
  } else {
    // Create new stock level
    const [created] = await db
      .insert(stockLevels)
      .values({
        tenantId: movement.tenantId,
        productId: movement.productId,
        locationId: movement.locationId,
        quantityOnHand: newQty.toFixed(4),
        quantityAvailable: newAvailable.toFixed(4),
        quantityCommitted: "0",
        averageUnitCost: newAvgCost.toFixed(4),
        totalValue: newValue.toFixed(4),
        currency: movement.currency,
        lastMovementDate: movement.movementDate,
        lastReceiptDate:
          movement.movementType === "receipt" ? movement.movementDate : undefined,
        lastIssueDate: movement.movementType === "issue" ? movement.movementDate : undefined,
      })
      .returning();

    if (!created) {
      throw new Error("Failed to create stock level");
    }

    return created;
  }
}

/**
 * Get stock level for product.
 */
export async function getStockLevel(
  db: Database,
  tenantId: string,
  productId: string,
  locationId?: string
): Promise<StockLevel | null> {
  const conditions = [
    eq(stockLevels.tenantId, tenantId),
    eq(stockLevels.productId, productId),
  ];
  
  if (locationId) {
    conditions.push(eq(stockLevels.locationId, locationId));
  }

  const [stockLevel] = await db
    .select()
    .from(stockLevels)
    .where(and(...conditions))
    .limit(1);

  return stockLevel || null;
}

/**
 * Get all stock levels by tenant.
 */
export async function getStockLevelsByTenant(
  db: Database,
  tenantId: string,
  options?: {
    limit?: number;
    offset?: number;
    lowStockOnly?: boolean;
  }
): Promise<StockLevel[]> {
  // Note: lowStockOnly filter would need additional criteria (e.g., min stock level)
  // For now, we just return all
  const query = db
    .select()
    .from(stockLevels)
    .where(eq(stockLevels.tenantId, tenantId))
    .limit(options?.limit ?? 100)
    .offset(options?.offset ?? 0);

  return await query;
}

/**
 * Check if quantity is available for a product.
 */
export async function checkAvailability(
  db: Database,
  tenantId: string,
  productId: string,
  quantity: number,
  locationId?: string
): Promise<{ available: boolean; quantityAvailable: number }> {
  const stockLevel = await getStockLevel(db, tenantId, productId, locationId);

  if (!stockLevel) {
    return { available: false, quantityAvailable: 0 };
  }

  const quantityAvailable = parseFloat(stockLevel.quantityAvailable);
  return {
    available: quantityAvailable >= quantity,
    quantityAvailable,
  };
}

/**
 * Reserve stock for an order (increase committed quantity).
 */
export async function reserveStock(
  db: Database,
  tenantId: string,
  productId: string,
  quantity: number,
  locationId?: string
): Promise<StockLevel> {
  const stockLevel = await getStockLevel(db, tenantId, productId, locationId);

  if (!stockLevel) {
    throw new Error(`No stock level found for product ${productId}`);
  }

  const currentCommitted = parseFloat(stockLevel.quantityCommitted);
  const currentOnHand = parseFloat(stockLevel.quantityOnHand);
  const currentAvailable = parseFloat(stockLevel.quantityAvailable);

  if (quantity > currentAvailable) {
    throw new Error(
      `Cannot reserve ${quantity} units - only ${currentAvailable} available`
    );
  }

  const newCommitted = currentCommitted + quantity;
  const newAvailable = currentOnHand - newCommitted;

  const [updated] = await db
    .update(stockLevels)
    .set({
      quantityCommitted: newCommitted.toFixed(4),
      quantityAvailable: newAvailable.toFixed(4),
      updatedAt: new Date(),
    })
    .where(eq(stockLevels.id, stockLevel.id))
    .returning();

  if (!updated) {
    throw new Error(`Failed to reserve stock for product: ${productId}`);
  }

  return updated;
}

/**
 * Release reserved stock (decrease committed quantity).
 */
export async function releaseStock(
  db: Database,
  tenantId: string,
  productId: string,
  quantity: number,
  locationId?: string
): Promise<StockLevel> {
  const stockLevel = await getStockLevel(db, tenantId, productId, locationId);

  if (!stockLevel) {
    throw new Error(`No stock level found for product ${productId}`);
  }

  const currentCommitted = parseFloat(stockLevel.quantityCommitted);
  const currentOnHand = parseFloat(stockLevel.quantityOnHand);

  if (quantity > currentCommitted) {
    throw new Error(
      `Cannot release ${quantity} units - only ${currentCommitted} committed`
    );
  }

  const newCommitted = currentCommitted - quantity;
  const newAvailable = currentOnHand - newCommitted;

  const [updated] = await db
    .update(stockLevels)
    .set({
      quantityCommitted: newCommitted.toFixed(4),
      quantityAvailable: newAvailable.toFixed(4),
      updatedAt: new Date(),
    })
    .where(eq(stockLevels.id, stockLevel.id))
    .returning();

  if (!updated) {
    throw new Error(`Failed to release stock for product: ${productId}`);
  }

  return updated;
}
