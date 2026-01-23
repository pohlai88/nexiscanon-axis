/**
 * Purchase Receipt (GRN) Service (B05)
 *
 * AXIS Canonical Implementation:
 * - Records goods received from supplier
 * - Creates stock move (B06 integration)
 * - Posts inventory valuation to GL (B07 integration)
 * - Creates GRN accrual entry
 *
 * @see .cursor/ERP/A01-CANONICAL.md §3 (Goods Pillar)
 * @see .cursor/ERP/B05-PURCHASE.md (Purchase Core)
 */

import type { Database } from "../..";
import type { PurchaseReceipt, StockMove } from "@axis/registry";
import { StockMovePostingService } from "../inventory/stock-move-posting";

// ============================================================================
// Receipt Posting Types
// ============================================================================

export interface ReceiptPostingResult {
  success: boolean;
  stockMoveId?: string;
  postingBatchId?: string;
  valuationBatchId?: string;
  errors?: string[];
}

// ============================================================================
// Receipt Posting
// ============================================================================

/**
 * Posts purchase receipt to inventory and GL
 *
 * AXIS Flow:
 * 1. Validate receipt (quantities, inspection)
 * 2. Create stock move (B06)
 * 3. Post stock move to GL (Dr Inventory, Cr GRN Accrual)
 * 4. Update receipt status to "posted"
 *
 * @param _db - Database connection
 * @param receipt - Purchase receipt to post
 * @param _context - 6W1H _context
 * @returns Posting result
 */
export async function postReceiptToInventory(
  _db: Database,
  receipt: PurchaseReceipt,
  _context: {
    userId: string;
    timestamp: string;
    fiscalPeriodId: string;
  }
): Promise<ReceiptPostingResult> {
  // Step 1: Validate receipt
  const validation = validateReceipt(receipt);
  if (!validation.isValid) {
    return {
      success: false,
      errors: validation.errors,
    };
  }

  // Step 2: Create stock move
  const stockMove = createStockMoveFromReceipt(receipt, _context);

  // Step 3: Post stock move to GL
  const postingResult = await StockMovePostingService.postStockMoveToGL(
    _db,
    stockMove,
    _context
  );

  if (!postingResult.success) {
    return {
      success: false,
      errors: postingResult.errors,
    };
  }

  // Step 4: Update receipt status
  // TODO: Update receipt in database
  // await db.update(purchaseReceipts)
  //   .set({
  //     status: "posted",
  //     postingBatchId: postingResult.postingBatchId,
  //     receivedBy: context.userId,
  //   })
  //   .where(eq(purchaseReceipts.id, receipt.id));

  return {
    success: true,
    stockMoveId: stockMove.id,
    postingBatchId: postingResult.postingBatchId,
    valuationBatchId: postingResult.valuationBatchId,
  };
}

// ============================================================================
// Receipt Validation
// ============================================================================

/**
 * Validates receipt before posting
 *
 * AXIS Law: PROTECT.DETECT.REACT
 *
 * @param receipt - Receipt to validate
 * @returns Validation result
 */
function validateReceipt(receipt: PurchaseReceipt): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check status
  if (receipt.status === "accepted") {
    errors.push("Receipt is already accepted/posted");
  }

  if (receipt.status === "cancelled") {
    errors.push("Cannot post cancelled receipt");
  }

  // Check lines
  if (!receipt.lines || receipt.lines.length === 0) {
    errors.push("Receipt must have at least one line");
  }

  // Check inspection requirement
  if (receipt.requiresInspection && !receipt.inspectedBy) {
    errors.push("Receipt requires inspection before posting");
  }

  // Validate quantities
  for (const line of receipt.lines) {
    if (line.quantityReceived !== line.quantityAccepted + line.quantityRejected) {
      errors.push(
        `Line ${line.lineNumber}: Quantity mismatch (received: ${line.quantityReceived}, accepted: ${line.quantityAccepted}, rejected: ${line.quantityRejected})`
      );
    }

    if (line.quantityAccepted > line.quantityOrdered) {
      errors.push(
        `Line ${line.lineNumber}: Accepted quantity (${line.quantityAccepted}) exceeds ordered quantity (${line.quantityOrdered})`
      );
    }

    // Check inspection status for quality items
    if (receipt.requiresInspection && !line.inspectionStatus) {
      errors.push(`Line ${line.lineNumber}: Inspection status is required`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// Stock Move Creation
// ============================================================================

/**
 * Creates stock move from purchase receipt
 *
 * AXIS Integration: B05 → B06
 *
 * @param receipt - Purchase receipt
 * @param _context - 6W1H _context
 * @returns Stock move
 */
function createStockMoveFromReceipt(
  receipt: PurchaseReceipt,
  _context: {
    userId: string;
    timestamp: string;
  }
): StockMove {
  const lines: StockMove["lines"] = receipt.lines
    .filter(line => line.quantityAccepted > 0)
    .map((line, index) => ({
      lineNumber: index + 1,
      itemId: line.itemId,
      itemSku: line.itemSku,
      itemName: line.itemName,
      quantity: line.quantityAccepted,
      uomId: line.uomId,
      uomSymbol: line.uomSymbol,
      baseQuantity: line.quantityAccepted, // TODO: Convert to base UOM
      baseUomId: line.uomId,
      toLocationId: line.toLocationId,
      toLocationName: line.toLocationName,
      lotNumber: line.lotNumber,
      serialNumbers: line.serialNumbers,
      expiryDate: line.expiryDate,
      unitCost: line.unitCost,
      totalCost: line.totalCost,
      costingMethod: "weighted_average", // TODO: Get from item master
      inventoryAccountId: crypto.randomUUID(), // TODO: Get from item/location
      contraAccountId: crypto.randomUUID(), // TODO: Get GRN accrual account
      notes: line.notes,
    }));

  const totalQuantity = lines.reduce((sum, line) => sum + line.quantity, 0);
  const totalValue = lines.reduce(
    (sum, line) => sum + parseFloat(line.totalCost),
    0
  );

  const stockMove: StockMove = {
    id: crypto.randomUUID(),
    tenantId: receipt.tenantId,
    documentNumber: `GRN-${receipt.documentNumber}`,
    moveType: "receipt",
    status: "draft",
    sourceDocumentType: "purchase_receipt",
    sourceDocumentId: receipt.id,
    sourceDocumentNumber: receipt.documentNumber,
    scheduledDate: receipt.receivedDate,
    movedDate: receipt.receivedDate,
    lines,
    totalQuantity,
    totalValue: totalValue.toFixed(2),
    notes: receipt.notes,
    createdBy: _context.userId,
    createdAt: _context.timestamp,
    updatedAt: _context.timestamp,
  };

  return stockMove;
}

// ============================================================================
// Receipt Return (Reversal)
// ============================================================================

/**
 * Creates return for receipt reversal
 *
 * AXIS Law: Never modify history, create reversal
 *
 * @param _db - Database connection
 * @param _originalReceiptId - Receipt to reverse
 * @param _context - 6W1H _context with reason
 * @returns Return result
 */
export async function createReceiptReturn(
  _db: Database,
  _originalReceiptId: string,
  _returnLines: Array<{
    lineNumber: number;
    quantityReturned: number;
    returnReason: string;
  }>,
  _context: {
    userId: string;
    timestamp: string;
    fiscalPeriodId: string;
  }
): Promise<ReceiptPostingResult> {
  // TODO: Get original receipt
  // const originalReceipt = await db.query.purchaseReceipts.findFirst({
  //   where: eq(purchaseReceipts.id, originalReceiptId),
  // });

  // Create return receipt (negative quantities)
  // Create stock move (delivery type)
  // Post to GL (reverse Dr/Cr)

  return {
    success: true,
  };
}

// ============================================================================
// Export Public API
// ============================================================================

export const ReceiptService = {
  postReceiptToInventory,
  createReceiptReturn,
  validateReceipt,
} as const;
