/**
 * Sales Order Line Service
 * 
 * Manages individual line items for sales orders.
 */

import { eq, and } from "drizzle-orm";
import type { Database } from "../../client";
import { salesOrderLines, type SalesOrderLine } from "../../schema/sales/order-line";

/**
 * Create SO line input.
 */
export interface CreateOrderLineInput {
  tenantId: string;
  orderId: string;
  lineNumber: number;
  productId: string;
  description: string;
  quantityOrdered: number;
  unitPrice: number;
  discountPercent?: number;
  taxRate?: number;
  notes?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Create a sales order line.
 */
export async function createOrderLine(
  db: Database,
  input: CreateOrderLineInput
): Promise<SalesOrderLine> {
  // Calculate line amounts
  const lineSubtotal = input.quantityOrdered * input.unitPrice;
  const discountAmount = input.discountPercent
    ? lineSubtotal * (input.discountPercent / 100)
    : 0;
  const afterDiscount = lineSubtotal - discountAmount;
  const taxAmount = input.taxRate ? afterDiscount * input.taxRate : 0;
  const lineTotal = afterDiscount + taxAmount;

  const [line] = await db
    .insert(salesOrderLines)
    .values({
      tenantId: input.tenantId,
      orderId: input.orderId,
      lineNumber: input.lineNumber,
      productId: input.productId,
      description: input.description,
      quantityOrdered: input.quantityOrdered.toFixed(4),
      quantityFulfilled: "0",
      quantityInvoiced: "0",
      unitOfMeasure: "EA",
      unitPrice: input.unitPrice.toFixed(4),
      lineSubtotal: lineSubtotal.toFixed(4),
      discountPercent: input.discountPercent?.toFixed(2),
      discountAmount: discountAmount.toFixed(4),
      taxRate: input.taxRate?.toFixed(4),
      taxAmount: taxAmount.toFixed(4),
      lineTotal: lineTotal.toFixed(4),
      currency: "USD",
      notes: input.notes,
      metadata: input.metadata || {},
    })
    .returning();

  if (!line) {
    throw new Error("Failed to create order line");
  }

  return line;
}

/**
 * Update SO line quantity fulfilled.
 */
export async function updateOrderLineFulfilled(
  db: Database,
  lineId: string,
  quantityFulfilled: number
): Promise<SalesOrderLine> {
  const [line] = await db
    .update(salesOrderLines)
    .set({
      quantityFulfilled: quantityFulfilled.toFixed(4),
      updatedAt: new Date(),
    })
    .where(eq(salesOrderLines.id, lineId))
    .returning();

  if (!line) {
    throw new Error(`Order line not found: ${lineId}`);
  }

  return line;
}

/**
 * Update SO line quantity invoiced.
 */
export async function updateOrderLineInvoiced(
  db: Database,
  lineId: string,
  quantityInvoiced: number
): Promise<SalesOrderLine> {
  const [line] = await db
    .update(salesOrderLines)
    .set({
      quantityInvoiced: quantityInvoiced.toFixed(4),
      updatedAt: new Date(),
    })
    .where(eq(salesOrderLines.id, lineId))
    .returning();

  if (!line) {
    throw new Error(`Order line not found: ${lineId}`);
  }

  return line;
}

/**
 * Get SO lines by order ID.
 */
export async function getOrderLinesByOrder(
  db: Database,
  orderId: string
): Promise<SalesOrderLine[]> {
  return await db
    .select()
    .from(salesOrderLines)
    .where(eq(salesOrderLines.orderId, orderId))
    .orderBy(salesOrderLines.lineNumber);
}

/**
 * Get SO line by ID.
 */
export async function getOrderLineById(
  db: Database,
  lineId: string
): Promise<SalesOrderLine | null> {
  const [line] = await db
    .select()
    .from(salesOrderLines)
    .where(eq(salesOrderLines.id, lineId))
    .limit(1);

  return line || null;
}

/**
 * Get SO lines by product.
 */
export async function getOrderLinesByProduct(
  db: Database,
  tenantId: string,
  productId: string
): Promise<SalesOrderLine[]> {
  return await db
    .select()
    .from(salesOrderLines)
    .where(
      and(
        eq(salesOrderLines.tenantId, tenantId),
        eq(salesOrderLines.productId, productId)
      )
    )
    .orderBy(salesOrderLines.createdAt);
}

/**
 * Calculate SO line totals.
 */
export function calculateOrderLineTotals(lines: CreateOrderLineInput[]): {
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  total: number;
} {
  let subtotal = 0;
  let discountTotal = 0;
  let taxTotal = 0;

  for (const line of lines) {
    const lineSubtotal = line.quantityOrdered * line.unitPrice;
    subtotal += lineSubtotal;

    const discountAmount = line.discountPercent
      ? lineSubtotal * (line.discountPercent / 100)
      : 0;
    discountTotal += discountAmount;

    const afterDiscount = lineSubtotal - discountAmount;
    taxTotal += line.taxRate ? afterDiscount * line.taxRate : 0;
  }

  return {
    subtotal,
    discountTotal,
    taxTotal,
    total: subtotal - discountTotal + taxTotal,
  };
}
