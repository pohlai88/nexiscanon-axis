/**
 * Sales Invoice Service (B01 Posting Spine Integration)
 * 
 * Implements invoice management with GL posting via posting spine.
 * 
 * AUTO-LOOKUP FEATURE:
 * - If customerId not provided, attempts lookup by customerName
 * - Auto-populates customerId for referential integrity
 * - Graceful fallback if customer not found
 */

import { eq, and, desc } from "drizzle-orm";
import type { Database } from "../../client";
import { salesInvoices, type SalesInvoice, type InvoiceLineItem } from "../../schema/sales/invoice";
import { customers } from "../../schema/customer";
import { postDocument, type PostDocumentInput } from "../posting-spine/document-state";
import { type SixW1HContext } from "@axis/registry/types";
import { inventoryMovements } from "../../schema/inventory/movement";

/**
 * Create invoice input.
 */
export interface CreateInvoiceInput {
  tenantId: string;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  customerId?: string;
  customerName: string;
  customerEmail?: string;
  orderId?: string;
  currency?: string;
  lineItems: InvoiceLineItem[];
  paymentTerms?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
  userId: string;
}

/**
 * Post invoice to GL input.
 */
export interface PostInvoiceToGLInput {
  invoiceId: string;
  postingDate: Date;
  userId: string;
  context: SixW1HContext;
  arAccountId: string; // Accounts Receivable account
  revenueAccountId: string; // Revenue account
  cogsAccountId?: string; // COGS account (for inventory items)
  inventoryAssetAccountId?: string; // Inventory Asset account (for inventory items)
}

/**
 * Create a sales invoice (draft state).
 * 
 * AUTO-LOOKUP: If customerId not provided, attempts to find customer by name.
 */
export async function createInvoice(
  db: Database,
  input: CreateInvoiceInput
): Promise<SalesInvoice> {
  // Auto-populate customerId if not provided
  let customerId = input.customerId;
  
  if (!customerId && input.customerName) {
    // Attempt lookup by exact customer name match
    const [customer] = await db
      .select()
      .from(customers)
      .where(
        and(
          eq(customers.tenantId, input.tenantId),
          eq(customers.customerName, input.customerName),
          eq(customers.isActive, true)
        )
      )
      .limit(1);
    
    if (customer) {
      customerId = customer.id;
    }
  }
  
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

  const [invoice] = await db
    .insert(salesInvoices)
    .values({
      tenantId: input.tenantId,
      invoiceNumber: input.invoiceNumber,
      invoiceDate: input.invoiceDate,
      dueDate: input.dueDate,
      customerId: customerId, // Auto-populated if found
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      orderId: input.orderId,
      status: "draft",
      currency: input.currency || "USD",
      subtotal: subtotal.toFixed(4),
      taxTotal: taxTotal.toFixed(4),
      totalAmount: totalAmount.toFixed(4),
      amountPaid: "0",
      amountDue: totalAmount.toFixed(4),
      lineItems: input.lineItems,
      paymentTerms: input.paymentTerms,
      notes: input.notes,
      metadata: input.metadata || {},
      createdBy: input.userId,
      modifiedBy: input.userId,
    })
    .returning();

  if (!invoice) {
    throw new Error("Failed to create invoice");
  }

  return invoice;
}

/**
 * Post invoice to GL via B01 Posting Spine.
 * 
 * Creates:
 * 1. Document entry (state: posted)
 * 2. Economic event (invoice.posted)
 * 3. GL postings (DR AR, CR Revenue)
 * 4. COGS postings (DR COGS, CR Inventory) if inventory movement exists
 */
export async function postInvoiceToGL(
  db: Database,
  input: PostInvoiceToGLInput
): Promise<{ invoice: SalesInvoice; documentId: string }> {
  // 1. Get invoice
  const [invoice] = await db
    .select()
    .from(salesInvoices)
    .where(eq(salesInvoices.id, input.invoiceId))
    .limit(1);

  if (!invoice) {
    throw new Error(`Invoice ${input.invoiceId} not found`);
  }

  if (invoice.status !== "draft" && invoice.status !== "sent") {
    throw new Error(`Invoice ${invoice.invoiceNumber} cannot be posted (status: ${invoice.status})`);
  }

  if (invoice.postedAt) {
    throw new Error(`Invoice ${invoice.invoiceNumber} already posted`);
  }

  // 2. Build GL postings (Revenue + AR)
  const totalAmount = parseFloat(invoice.totalAmount);
  
  const postings: PostDocumentInput["postings"] = [
    // DR Accounts Receivable
    {
      accountId: input.arAccountId,
      direction: "debit",
      amount: totalAmount.toFixed(4),
      description: `AR - ${invoice.customerName} Invoice ${invoice.invoiceNumber}`,
    },
    // CR Revenue
    {
      accountId: input.revenueAccountId,
      direction: "credit",
      amount: totalAmount.toFixed(4),
      description: `Revenue - ${invoice.customerName} Invoice ${invoice.invoiceNumber}`,
    },
  ];

  // 3. Check for inventory movement (COGS calculation)
  if (invoice.orderId && input.cogsAccountId && input.inventoryAssetAccountId) {
    // Look for inventory issue movement linked to the sales order
    const [movement] = await db
      .select()
      .from(inventoryMovements)
      .where(
        and(
          eq(inventoryMovements.sourceDocumentType, "sales_order"),
          eq(inventoryMovements.sourceDocumentId, invoice.orderId),
          eq(inventoryMovements.movementType, "issue")
        )
      )
      .limit(1);

    if (movement && movement.totalCost) {
      // Add COGS postings using actual weighted average cost from inventory
      const cogsAmount = parseFloat(movement.totalCost);
      
      postings.push(
        // DR Cost of Goods Sold
        {
          accountId: input.cogsAccountId,
          direction: "debit",
          amount: cogsAmount.toFixed(4),
          description: `COGS - Invoice ${invoice.invoiceNumber}`,
        },
        // CR Inventory Asset
        {
          accountId: input.inventoryAssetAccountId,
          direction: "credit",
          amount: cogsAmount.toFixed(4),
          description: `Inventory reduction - Invoice ${invoice.invoiceNumber}`,
        }
      );
    }
  }

  // 4. Post via posting spine
  const postResult = await postDocument(db, {
    documentId: invoice.id,
    tenantId: invoice.tenantId,
    userId: input.userId,
    postingDate: input.postingDate,
    eventType: "revenue",
    eventDescription: `Posted sales invoice ${invoice.invoiceNumber} for ${invoice.customerName}`,
    eventAmount: invoice.totalAmount,
    eventCurrency: invoice.currency,
    eventData: {
      invoiceNumber: invoice.invoiceNumber,
      customerName: invoice.customerName,
      customerId: invoice.customerId,
      orderId: invoice.orderId,
      lineItems: invoice.lineItems,
    },
    postings,
    context: input.context,
  });

  // 5. Update invoice with document link
  const [updatedInvoice] = await db
    .update(salesInvoices)
    .set({
      documentId: postResult.document.id,
      postedAt: new Date(),
      status: "sent",
      modifiedBy: input.userId,
      updatedAt: new Date(),
    })
    .where(eq(salesInvoices.id, input.invoiceId))
    .returning();

  if (!updatedInvoice) {
    throw new Error(`Failed to update invoice: ${input.invoiceId}`);
  }

  return {
    invoice: updatedInvoice,
    documentId: postResult.document.id,
  };
}

/**
 * Get invoice by ID.
 */
export async function getInvoiceById(
  db: Database,
  invoiceId: string
): Promise<SalesInvoice | null> {
  const [invoice] = await db
    .select()
    .from(salesInvoices)
    .where(eq(salesInvoices.id, invoiceId))
    .limit(1);

  return invoice || null;
}

/**
 * Get invoices by tenant.
 */
export async function getInvoicesByTenant(
  db: Database,
  tenantId: string,
  options?: {
    limit?: number;
    offset?: number;
    status?: string;
  }
): Promise<SalesInvoice[]> {
  const conditions = [eq(salesInvoices.tenantId, tenantId)];

  if (options?.status) {
    conditions.push(eq(salesInvoices.status, options.status as SalesInvoice["status"]));
  }

  const query = db
    .select()
    .from(salesInvoices)
    .where(and(...conditions))
    .orderBy(desc(salesInvoices.invoiceDate))
    .limit(options?.limit ?? 100)
    .offset(options?.offset ?? 0);

  return await query;
}

/**
 * Update invoice status.
 */
export async function updateInvoiceStatus(
  db: Database,
  invoiceId: string,
  status: "draft" | "sent" | "viewed" | "paid" | "partially_paid" | "overdue" | "cancelled",
  userId: string
): Promise<SalesInvoice> {
  const [invoice] = await db
    .update(salesInvoices)
    .set({
      status,
      modifiedBy: userId,
      updatedAt: new Date(),
    })
    .where(eq(salesInvoices.id, invoiceId))
    .returning();

  if (!invoice) {
    throw new Error(`Invoice not found: ${invoiceId}`);
  }

  return invoice;
}

/**
 * Record payment on invoice.
 */
export async function recordPayment(
  db: Database,
  invoiceId: string,
  amount: number,
  paymentDate: Date,
  userId: string
): Promise<SalesInvoice> {
  const [invoice] = await db
    .select()
    .from(salesInvoices)
    .where(eq(salesInvoices.id, invoiceId))
    .limit(1);

  if (!invoice) {
    throw new Error(`Invoice ${invoiceId} not found`);
  }

  const currentPaid = parseFloat(invoice.amountPaid);
  const newPaid = currentPaid + amount;
  const totalAmount = parseFloat(invoice.totalAmount);
  const newDue = totalAmount - newPaid;

  let newStatus = invoice.status;
  if (newDue <= 0) {
    newStatus = "paid";
  } else if (newPaid > 0) {
    newStatus = "partially_paid";
  }

  const [updated] = await db
    .update(salesInvoices)
    .set({
      amountPaid: newPaid.toFixed(4),
      amountDue: newDue.toFixed(4),
      status: newStatus,
      lastPaymentDate: paymentDate,
      modifiedBy: userId,
      updatedAt: new Date(),
    })
    .where(eq(salesInvoices.id, invoiceId))
    .returning();

  if (!updated) {
    throw new Error(`Failed to update invoice: ${invoiceId}`);
  }

  return updated;
}
