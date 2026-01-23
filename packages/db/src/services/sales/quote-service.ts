/**
 * Sales Quote Service
 * 
 * Manages sales quotes and conversion to orders.
 */

import { eq, and, desc } from "drizzle-orm";
import type { Database } from "../../client";
import { salesQuotes, type SalesQuote, type QuoteLineItem } from "../../schema/sales/quote";
import { salesOrders } from "../../schema/sales/order";

/**
 * Create quote input.
 */
export interface CreateQuoteInput {
  tenantId: string;
  quoteNumber: string;
  quoteDate: Date;
  validUntil?: Date;
  customerId?: string;
  customerName: string;
  customerEmail?: string;
  currency?: string;
  lineItems: QuoteLineItem[];
  notes?: string;
  termsConditions?: string;
  metadata?: Record<string, unknown>;
  userId: string;
}

/**
 * Create a sales quote.
 */
export async function createQuote(
  db: Database,
  input: CreateQuoteInput
): Promise<SalesQuote> {
  // Calculate totals
  const subtotal = input.lineItems.reduce(
    (sum, item) => sum + parseFloat(item.amount),
    0
  );
  
  const taxTotal = input.lineItems.reduce(
    (sum, item) => sum + (parseFloat(item.tax_rate || "0") * parseFloat(item.amount)),
    0
  );
  
  const totalAmount = subtotal + taxTotal;

  const [quote] = await db
    .insert(salesQuotes)
    .values({
      tenantId: input.tenantId,
      quoteNumber: input.quoteNumber,
      quoteDate: input.quoteDate,
      validUntil: input.validUntil,
      customerId: input.customerId,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      status: "draft",
      currency: input.currency || "USD",
      subtotal: subtotal.toFixed(4),
      taxTotal: taxTotal.toFixed(4),
      totalAmount: totalAmount.toFixed(4),
      lineItems: input.lineItems,
      notes: input.notes,
      termsConditions: input.termsConditions,
      metadata: input.metadata || {},
      createdBy: input.userId,
      modifiedBy: input.userId,
    })
    .returning();

  if (!quote) {
    throw new Error("Failed to create quote");
  }

  return quote;
}

/**
 * Convert quote to order.
 */
export async function convertQuoteToOrder(
  db: Database,
  quoteId: string,
  userId: string,
  orderNumber: string
): Promise<{ quote: SalesQuote; order: typeof salesOrders.$inferSelect }> {
  // Get quote
  const [quote] = await db
    .select()
    .from(salesQuotes)
    .where(eq(salesQuotes.id, quoteId))
    .limit(1);

  if (!quote) {
    throw new Error(`Quote ${quoteId} not found`);
  }

  if (quote.status !== "accepted") {
    throw new Error(`Quote ${quote.quoteNumber} must be accepted before conversion`);
  }

  if (quote.convertedToOrderId) {
    throw new Error(`Quote ${quote.quoteNumber} already converted to order`);
  }

  // Create order from quote
  const [order] = await db
    .insert(salesOrders)
    .values({
      tenantId: quote.tenantId,
      orderNumber,
      orderDate: new Date(),
      customerId: quote.customerId,
      customerName: quote.customerName,
      customerEmail: quote.customerEmail,
      quoteId: quote.id,
      status: "pending",
      currency: quote.currency,
      subtotal: quote.subtotal,
      taxTotal: quote.taxTotal,
      totalAmount: quote.totalAmount,
      lineItems: quote.lineItems,
      metadata: { ...quote.metadata, convertedFromQuote: quote.quoteNumber },
      createdBy: userId,
      modifiedBy: userId,
    })
    .returning();

  if (!order) {
    throw new Error("Failed to create order from quote");
  }

  // Update quote status
  const [updatedQuote] = await db
    .update(salesQuotes)
    .set({
      status: "converted",
      convertedToOrderId: order.id,
      convertedAt: new Date(),
      modifiedBy: userId,
      updatedAt: new Date(),
    })
    .where(eq(salesQuotes.id, quoteId))
    .returning();

  if (!updatedQuote) {
    throw new Error(`Failed to update quote: ${quoteId}`);
  }

  return { quote: updatedQuote, order };
}

/**
 * Get quote by ID.
 */
export async function getQuoteById(
  db: Database,
  quoteId: string
): Promise<SalesQuote | null> {
  const [quote] = await db
    .select()
    .from(salesQuotes)
    .where(eq(salesQuotes.id, quoteId))
    .limit(1);

  return quote || null;
}

/**
 * Get quotes by tenant.
 */
export async function getQuotesByTenant(
  db: Database,
  tenantId: string,
  options?: {
    limit?: number;
    offset?: number;
    status?: "draft" | "sent" | "accepted" | "rejected" | "expired" | "converted";
  }
): Promise<SalesQuote[]> {
  const conditions = [eq(salesQuotes.tenantId, tenantId)];

  if (options?.status) {
    conditions.push(eq(salesQuotes.status, options.status));
  }

  const query = db
    .select()
    .from(salesQuotes)
    .where(and(...conditions))
    .orderBy(desc(salesQuotes.quoteDate))
    .limit(options?.limit ?? 100)
    .offset(options?.offset ?? 0);

  return await query;
}

/**
 * Update quote status.
 */
export async function updateQuoteStatus(
  db: Database,
  quoteId: string,
  status: "draft" | "sent" | "accepted" | "rejected" | "expired" | "converted",
  userId: string
): Promise<SalesQuote> {
  const [quote] = await db
    .update(salesQuotes)
    .set({
      status,
      modifiedBy: userId,
      updatedAt: new Date(),
    })
    .where(eq(salesQuotes.id, quoteId))
    .returning();

  if (!quote) {
    throw new Error(`Quote not found: ${quoteId}`);
  }

  return quote;
}
