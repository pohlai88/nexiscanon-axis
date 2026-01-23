/**
 * Invoice Line Service
 * 
 * Manages individual line items for sales invoices with COGS tracking.
 */

import { eq, and } from "drizzle-orm";
import type { Database } from "../../client";
import { invoiceLines, type InvoiceLine } from "../../schema/sales/invoice-line";
import { inventoryMovements } from "../../schema/inventory/movement";

/**
 * Create invoice line input.
 */
export interface CreateInvoiceLineInput {
  tenantId: string;
  invoiceId: string;
  lineNumber: number;
  orderLineId?: string;
  productId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercent?: number;
  taxRate?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Create an invoice line.
 */
export async function createInvoiceLine(
  db: Database,
  input: CreateInvoiceLineInput
): Promise<InvoiceLine> {
  // Calculate line amounts
  const lineSubtotal = input.quantity * input.unitPrice;
  const discountAmount = input.discountPercent
    ? lineSubtotal * (input.discountPercent / 100)
    : 0;
  const afterDiscount = lineSubtotal - discountAmount;
  const taxAmount = input.taxRate ? afterDiscount * input.taxRate : 0;
  const lineTotal = afterDiscount + taxAmount;

  const [line] = await db
    .insert(invoiceLines)
    .values({
      tenantId: input.tenantId,
      invoiceId: input.invoiceId,
      lineNumber: input.lineNumber,
      orderLineId: input.orderLineId,
      productId: input.productId,
      description: input.description,
      quantity: input.quantity.toFixed(4),
      unitOfMeasure: "EA",
      unitPrice: input.unitPrice.toFixed(4),
      lineSubtotal: lineSubtotal.toFixed(4),
      discountPercent: input.discountPercent?.toFixed(2),
      discountAmount: discountAmount.toFixed(4),
      taxRate: input.taxRate?.toFixed(4),
      taxAmount: taxAmount.toFixed(4),
      lineTotal: lineTotal.toFixed(4),
      currency: "USD",
      metadata: input.metadata || {},
    })
    .returning();

  if (!line) {
    throw new Error("Failed to create invoice line");
  }

  return line;
}

/**
 * Update invoice line with COGS from inventory movement.
 */
export async function updateInvoiceLineCOGS(
  db: Database,
  lineId: string,
  unitCost: number,
  lineCogs: number
): Promise<InvoiceLine> {
  const [line] = await db
    .update(invoiceLines)
    .set({
      unitCost: unitCost.toFixed(4),
      lineCogs: lineCogs.toFixed(4),
      updatedAt: new Date(),
    })
    .where(eq(invoiceLines.id, lineId))
    .returning();

  if (!line) {
    throw new Error(`Invoice line not found: ${lineId}`);
  }

  return line;
}

/**
 * Get invoice lines by invoice ID.
 */
export async function getInvoiceLinesByInvoice(
  db: Database,
  invoiceId: string
): Promise<InvoiceLine[]> {
  return await db
    .select()
    .from(invoiceLines)
    .where(eq(invoiceLines.invoiceId, invoiceId))
    .orderBy(invoiceLines.lineNumber);
}

/**
 * Get invoice line by ID.
 */
export async function getInvoiceLineById(
  db: Database,
  lineId: string
): Promise<InvoiceLine | null> {
  const [line] = await db
    .select()
    .from(invoiceLines)
    .where(eq(invoiceLines.id, lineId))
    .limit(1);

  return line || null;
}

/**
 * Get invoice lines with COGS for an invoice.
 * 
 * Looks up inventory movements to populate COGS data.
 */
export async function getInvoiceLinesWithCOGS(
  db: Database,
  invoiceId: string,
  orderId?: string
): Promise<InvoiceLine[]> {
  const lines = await getInvoiceLinesByInvoice(db, invoiceId);

  if (!orderId) {
    return lines;
  }

  // For each line, try to find corresponding inventory movement
  for (const line of lines) {
    if (!line.productId) continue;

    const [movement] = await db
      .select()
      .from(inventoryMovements)
      .where(
        and(
          eq(inventoryMovements.sourceDocumentType, "sales_order"),
          eq(inventoryMovements.sourceDocumentId, orderId),
          eq(inventoryMovements.productId, line.productId),
          eq(inventoryMovements.movementType, "issue")
        )
      )
      .limit(1);

    if (movement && movement.unitCost && movement.totalCost) {
      // Update line with COGS from movement
      await updateInvoiceLineCOGS(
        db,
        line.id,
        parseFloat(movement.unitCost),
        parseFloat(movement.totalCost)
      );

      // Update the line object
      line.unitCost = movement.unitCost;
      line.lineCogs = movement.totalCost;
    }
  }

  return lines;
}

/**
 * Calculate invoice line totals.
 */
export function calculateInvoiceLineTotals(lines: CreateInvoiceLineInput[]): {
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  total: number;
} {
  let subtotal = 0;
  let discountTotal = 0;
  let taxTotal = 0;

  for (const line of lines) {
    const lineSubtotal = line.quantity * line.unitPrice;
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

/**
 * Calculate total COGS from invoice lines.
 */
export function calculateTotalCOGS(lines: InvoiceLine[]): number {
  return lines.reduce((sum, line) => {
    const lineCogs = line.lineCogs ? parseFloat(line.lineCogs) : 0;
    return sum + lineCogs;
  }, 0);
}
