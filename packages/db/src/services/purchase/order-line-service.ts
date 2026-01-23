/**
 * Purchase Order Line Service
 * 
 * Manages individual line items for purchase orders.
 */

import { eq, and } from "drizzle-orm";
import type { Database } from "../../client";
import { purchaseOrderLines, type PurchaseOrderLine } from "../../schema/purchase/order-line";

/**
 * Create PO line input.
 */
export interface CreatePOLineInput {
  tenantId: string;
  orderId: string;
  lineNumber: number;
  productId: string;
  description: string;
  quantityOrdered: number;
  unitPrice: number;
  taxRate?: number;
  notes?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Create a purchase order line.
 */
export async function createPOLine(
  db: Database,
  input: CreatePOLineInput
): Promise<PurchaseOrderLine> {
  // Calculate line amounts
  const lineSubtotal = input.quantityOrdered * input.unitPrice;
  const taxAmount = input.taxRate ? lineSubtotal * input.taxRate : 0;
  const lineTotal = lineSubtotal + taxAmount;

  const [line] = await db
    .insert(purchaseOrderLines)
    .values({
      tenantId: input.tenantId,
      orderId: input.orderId,
      lineNumber: input.lineNumber,
      productId: input.productId,
      description: input.description,
      quantityOrdered: input.quantityOrdered.toFixed(4),
      quantityReceived: "0",
      unitOfMeasure: "EA",
      unitPrice: input.unitPrice.toFixed(4),
      lineSubtotal: lineSubtotal.toFixed(4),
      taxRate: input.taxRate?.toFixed(4),
      taxAmount: taxAmount.toFixed(4),
      lineTotal: lineTotal.toFixed(4),
      currency: "USD",
      notes: input.notes,
      metadata: input.metadata || {},
    })
    .returning();

  if (!line) {
    throw new Error("Failed to create PO line");
  }

  return line;
}

/**
 * Update PO line quantity received.
 */
export async function updatePOLineReceived(
  db: Database,
  lineId: string,
  quantityReceived: number
): Promise<PurchaseOrderLine> {
  const [line] = await db
    .update(purchaseOrderLines)
    .set({
      quantityReceived: quantityReceived.toFixed(4),
      updatedAt: new Date(),
    })
    .where(eq(purchaseOrderLines.id, lineId))
    .returning();

  if (!line) {
    throw new Error(`PO line not found: ${lineId}`);
  }

  return line;
}

/**
 * Get PO lines by order ID.
 */
export async function getPOLinesByOrder(
  db: Database,
  orderId: string
): Promise<PurchaseOrderLine[]> {
  return await db
    .select()
    .from(purchaseOrderLines)
    .where(eq(purchaseOrderLines.orderId, orderId))
    .orderBy(purchaseOrderLines.lineNumber);
}

/**
 * Get PO line by ID.
 */
export async function getPOLineById(
  db: Database,
  lineId: string
): Promise<PurchaseOrderLine | null> {
  const [line] = await db
    .select()
    .from(purchaseOrderLines)
    .where(eq(purchaseOrderLines.id, lineId))
    .limit(1);

  return line || null;
}

/**
 * Get PO lines by product.
 */
export async function getPOLinesByProduct(
  db: Database,
  tenantId: string,
  productId: string
): Promise<PurchaseOrderLine[]> {
  return await db
    .select()
    .from(purchaseOrderLines)
    .where(
      and(
        eq(purchaseOrderLines.tenantId, tenantId),
        eq(purchaseOrderLines.productId, productId)
      )
    )
    .orderBy(purchaseOrderLines.createdAt);
}

/**
 * Calculate PO line totals.
 */
export function calculatePOLineTotals(lines: CreatePOLineInput[]): {
  subtotal: number;
  taxTotal: number;
  total: number;
} {
  let subtotal = 0;
  let taxTotal = 0;

  for (const line of lines) {
    const lineSubtotal = line.quantityOrdered * line.unitPrice;
    subtotal += lineSubtotal;
    taxTotal += line.taxRate ? lineSubtotal * line.taxRate : 0;
  }

  return {
    subtotal,
    taxTotal,
    total: subtotal + taxTotal,
  };
}
