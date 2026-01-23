/**
 * Inventory Movement Service
 * 
 * Tracks stock receipts, issues, and adjustments with B01 integration.
 */

import { eq, and, desc } from "drizzle-orm";
import type { Database } from "../../client";
import { inventoryMovements, type InventoryMovement } from "../../schema/inventory/movement";
import { postDocument, type PostDocumentInput } from "../posting-spine/document-state";
import { type SixW1HContext } from "@axis/registry/types";
import { updateStockLevelAfterMovement } from "./stock-service";

/**
 * Record receipt input.
 */
export interface RecordReceiptInput {
  tenantId: string;
  movementNumber: string;
  movementDate: Date;
  productId: string;
  quantity: number;
  unitCost: number;
  currency?: string;
  sourceDocumentType?: string; // 'purchase_order'
  sourceDocumentId?: string;
  notes?: string;
  userId: string;
}

/**
 * Record issue input.
 */
export interface RecordIssueInput {
  tenantId: string;
  movementNumber: string;
  movementDate: Date;
  productId: string;
  quantity: number;
  currency?: string;
  sourceDocumentType?: string; // 'sales_order'
  sourceDocumentId?: string;
  notes?: string;
  userId: string;
}

/**
 * Record adjustment input.
 */
export interface RecordAdjustmentInput {
  tenantId: string;
  movementNumber: string;
  movementDate: Date;
  productId: string;
  quantity: number; // Can be positive or negative
  reason: string;
  notes?: string;
  userId: string;
}

/**
 * Post movement to GL input.
 */
export interface PostMovementToGLInput {
  movementId: string;
  postingDate: Date;
  userId: string;
  context: SixW1HContext;
  assetAccountId: string; // Inventory Asset account
  offsetAccountId: string; // AP (receipt) / COGS (issue) / Variance (adjustment)
}

/**
 * Record stock receipt (from purchase order).
 */
export async function recordReceipt(
  db: Database,
  input: RecordReceiptInput
): Promise<InventoryMovement> {
  const totalCost = input.quantity * input.unitCost;

  const [movement] = await db
    .insert(inventoryMovements)
    .values({
      tenantId: input.tenantId,
      movementNumber: input.movementNumber,
      movementDate: input.movementDate,
      movementType: "receipt",
      productId: input.productId,
      quantity: input.quantity.toFixed(4),
      unitOfMeasure: "EA",
      unitCost: input.unitCost.toFixed(4),
      totalCost: totalCost.toFixed(4),
      currency: input.currency || "USD",
      sourceDocumentType: input.sourceDocumentType,
      sourceDocumentId: input.sourceDocumentId,
      status: "pending",
      notes: input.notes,
      metadata: {},
      createdBy: input.userId,
      modifiedBy: input.userId,
    })
    .returning();

  if (!movement) {
    throw new Error("Failed to create inventory receipt");
  }

  // Update stock levels (weighted average cost)
  await updateStockLevelAfterMovement(db, movement);

  return movement;
}

/**
 * Record stock issue (to sales order).
 */
export async function recordIssue(
  db: Database,
  input: RecordIssueInput
): Promise<InventoryMovement> {
  const [movement] = await db
    .insert(inventoryMovements)
    .values({
      tenantId: input.tenantId,
      movementNumber: input.movementNumber,
      movementDate: input.movementDate,
      movementType: "issue",
      productId: input.productId,
      quantity: input.quantity.toFixed(4),
      unitOfMeasure: "EA",
      currency: input.currency || "USD",
      sourceDocumentType: input.sourceDocumentType,
      sourceDocumentId: input.sourceDocumentId,
      status: "pending",
      notes: input.notes,
      metadata: {},
      createdBy: input.userId,
      modifiedBy: input.userId,
    })
    .returning();

  if (!movement) {
    throw new Error("Failed to create inventory issue");
  }

  // Update stock levels (deduct quantity, use current average cost for COGS)
  await updateStockLevelAfterMovement(db, movement);

  return movement;
}

/**
 * Record inventory adjustment (count variance).
 */
export async function recordAdjustment(
  db: Database,
  input: RecordAdjustmentInput
): Promise<InventoryMovement> {
  const [movement] = await db
    .insert(inventoryMovements)
    .values({
      tenantId: input.tenantId,
      movementNumber: input.movementNumber,
      movementDate: input.movementDate,
      movementType: "adjustment",
      productId: input.productId,
      quantity: input.quantity.toFixed(4),
      unitOfMeasure: "EA",
      status: "pending",
      reason: input.reason,
      notes: input.notes,
      metadata: {},
      createdBy: input.userId,
      modifiedBy: input.userId,
    })
    .returning();

  if (!movement) {
    throw new Error("Failed to create inventory adjustment");
  }

  // Update stock levels
  await updateStockLevelAfterMovement(db, movement);

  return movement;
}

/**
 * Post inventory movement to GL via B01 Posting Spine.
 * 
 * Creates:
 * 1. Document entry (state: posted, type: inventory.receipt/issue/adjustment)
 * 2. Economic event
 * 3. GL postings
 */
export async function postMovementToGL(
  db: Database,
  input: PostMovementToGLInput
): Promise<{ movement: InventoryMovement; documentId: string }> {
  // 1. Get movement
  const [movement] = await db
    .select()
    .from(inventoryMovements)
    .where(eq(inventoryMovements.id, input.movementId))
    .limit(1);

  if (!movement) {
    throw new Error(`Inventory movement ${input.movementId} not found`);
  }

  if (movement.status !== "pending") {
    throw new Error(
      `Movement ${movement.movementNumber} cannot be posted (status: ${movement.status})`
    );
  }

  if (movement.postedAt) {
    throw new Error(`Movement ${movement.movementNumber} already posted`);
  }

  // 2. Build GL postings based on movement type
  const amount = movement.totalCost || movement.unitCost || "0";
  const movementAmount = parseFloat(amount);

  let postings: PostDocumentInput["postings"] = [];
  let eventType: PostDocumentInput["eventType"] = "inventory_received";
  let eventDescription = "";

  if (movement.movementType === "receipt") {
    // Receipt: DR Inventory Asset, CR AP
    eventType = "inventory_received";
    eventDescription = `Stock receipt ${movement.movementNumber}`;
    postings = [
      {
        accountId: input.assetAccountId,
        direction: "debit",
        amount: movementAmount.toFixed(4),
        description: `Inventory receipt ${movement.movementNumber}`,
      },
      {
        accountId: input.offsetAccountId,
        direction: "credit",
        amount: movementAmount.toFixed(4),
        description: `AP for inventory receipt ${movement.movementNumber}`,
      },
    ];
  } else if (movement.movementType === "issue") {
    // Issue: DR COGS, CR Inventory Asset
    eventType = "inventory_issued";
    eventDescription = `Stock issue ${movement.movementNumber}`;
    postings = [
      {
        accountId: input.offsetAccountId, // COGS account
        direction: "debit",
        amount: movementAmount.toFixed(4),
        description: `COGS for issue ${movement.movementNumber}`,
      },
      {
        accountId: input.assetAccountId,
        direction: "credit",
        amount: movementAmount.toFixed(4),
        description: `Inventory issue ${movement.movementNumber}`,
      },
    ];
  } else if (movement.movementType === "adjustment") {
    // Adjustment: depends on quantity sign
    const adjustmentQty = parseFloat(movement.quantity);
    eventType = "inventory_received"; // Use received for positive, issued for negative
    eventDescription = `Inventory adjustment ${movement.movementNumber}`;

    if (adjustmentQty > 0) {
      // Positive adjustment (found more stock): DR Inventory Asset, CR Variance
      postings = [
        {
          accountId: input.assetAccountId,
          direction: "debit",
          amount: movementAmount.toFixed(4),
          description: `Inventory adjustment (overage) ${movement.movementNumber}`,
        },
        {
          accountId: input.offsetAccountId, // Variance account
          direction: "credit",
          amount: movementAmount.toFixed(4),
          description: `Adjustment variance ${movement.movementNumber}`,
        },
      ];
    } else {
      // Negative adjustment (shrinkage): DR Variance, CR Inventory Asset
      postings = [
        {
          accountId: input.offsetAccountId, // Variance account
          direction: "debit",
          amount: movementAmount.toFixed(4),
          description: `Inventory adjustment (shrinkage) ${movement.movementNumber}`,
        },
        {
          accountId: input.assetAccountId,
          direction: "credit",
          amount: movementAmount.toFixed(4),
          description: `Adjustment variance ${movement.movementNumber}`,
        },
      ];
    }
  }

  // 3. Post via posting spine
  const postResult = await postDocument(db, {
    documentId: movement.id,
    tenantId: movement.tenantId,
    userId: input.userId,
    postingDate: input.postingDate,
    eventType,
    eventDescription,
    eventAmount: amount,
    eventCurrency: movement.currency ?? undefined,
    eventData: {
      movementNumber: movement.movementNumber,
      movementType: movement.movementType,
      productId: movement.productId,
      quantity: movement.quantity,
      unitCost: movement.unitCost,
    },
    postings,
    context: input.context,
  });

  // 4. Update movement with document link
  const [updatedMovement] = await db
    .update(inventoryMovements)
    .set({
      documentId: postResult.document.id,
      postedAt: new Date(),
      status: "posted",
      modifiedBy: input.userId,
      updatedAt: new Date(),
    })
    .where(eq(inventoryMovements.id, input.movementId))
    .returning();

  if (!updatedMovement) {
    throw new Error(`Failed to update movement: ${input.movementId}`);
  }

  return {
    movement: updatedMovement,
    documentId: postResult.document.id,
  };
}

/**
 * Get movement by ID.
 */
export async function getMovementById(
  db: Database,
  movementId: string
): Promise<InventoryMovement | null> {
  const [movement] = await db
    .select()
    .from(inventoryMovements)
    .where(eq(inventoryMovements.id, movementId))
    .limit(1);

  return movement || null;
}

/**
 * Get movements by product.
 */
export async function getMovementsByProduct(
  db: Database,
  productId: string,
  options?: {
    limit?: number;
    offset?: number;
    movementType?: string;
  }
): Promise<InventoryMovement[]> {
  const conditions = [eq(inventoryMovements.productId, productId)];

  if (options?.movementType) {
    conditions.push(eq(inventoryMovements.movementType, options.movementType));
  }

  const query = db
    .select()
    .from(inventoryMovements)
    .where(and(...conditions))
    .orderBy(desc(inventoryMovements.movementDate))
    .limit(options?.limit ?? 100)
    .offset(options?.offset ?? 0);

  return await query;
}
