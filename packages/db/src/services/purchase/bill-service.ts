/**
 * Purchase Bill Service (B01 Posting Spine Integration)
 * 
 * Implements bill management with GL posting via posting spine.
 * 
 * AUTO-LOOKUP FEATURE:
 * - If vendorId not provided, attempts lookup by vendorName
 * - Auto-populates vendorId for referential integrity
 * - Graceful fallback if vendor not found
 */

import { eq, and, desc } from "drizzle-orm";
import type { Database } from "../../client";
import { purchaseBills, type PurchaseBill, type BillLineItem } from "../../schema/purchase/bill";
import { vendors } from "../../schema/vendor";
import { postDocument, type PostDocumentInput } from "../posting-spine/document-state";
import { type SixW1HContext } from "@axis/registry/types";

/**
 * Create bill input.
 */
export interface CreateBillInput {
  tenantId: string;
  billNumber: string;
  billDate: Date;
  dueDate: Date;
  vendorId?: string;
  vendorName: string;
  vendorEmail?: string;
  poId?: string;
  currency?: string;
  lineItems: BillLineItem[];
  paymentTerms?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
  userId: string;
}

/**
 * Post bill to GL input.
 */
export interface PostBillToGLInput {
  billId: string;
  postingDate: Date;
  userId: string;
  context: SixW1HContext;
  apAccountId: string; // Accounts Payable account
  // Line items must include account_code for expense/asset accounts
}

/**
 * Create a purchase bill (draft state).
 * 
 * AUTO-LOOKUP: If vendorId not provided, attempts to find vendor by name.
 */
export async function createBill(
  db: Database,
  input: CreateBillInput
): Promise<PurchaseBill> {
  // Auto-populate vendorId if not provided
  let vendorId = input.vendorId;
  
  if (!vendorId && input.vendorName) {
    // Attempt lookup by exact vendor name match
    const [vendor] = await db
      .select()
      .from(vendors)
      .where(
        and(
          eq(vendors.tenantId, input.tenantId),
          eq(vendors.vendorName, input.vendorName),
          eq(vendors.isActive, true)
        )
      )
      .limit(1);
    
    if (vendor) {
      vendorId = vendor.id;
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

  const [bill] = await db
    .insert(purchaseBills)
    .values({
      tenantId: input.tenantId,
      billNumber: input.billNumber,
      billDate: input.billDate,
      dueDate: input.dueDate,
      vendorId: vendorId, // Auto-populated if found
      vendorName: input.vendorName,
      vendorEmail: input.vendorEmail,
      poId: input.poId,
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

  if (!bill) {
    throw new Error("Failed to create bill");
  }

  return bill;
}

/**
 * Post bill to GL via B01 Posting Spine.
 * 
 * Creates:
 * 1. Document entry (state: posted)
 * 2. Economic event (bill.posted)
 * 3. GL postings (DR Expenses/Assets, CR AP)
 */
export async function postBillToGL(
  db: Database,
  input: PostBillToGLInput
): Promise<{ bill: PurchaseBill; documentId: string }> {
  // 1. Get bill
  const [bill] = await db
    .select()
    .from(purchaseBills)
    .where(eq(purchaseBills.id, input.billId))
    .limit(1);

  if (!bill) {
    throw new Error(`Bill ${input.billId} not found`);
  }

  if (bill.status !== "draft" && bill.status !== "received" && bill.status !== "approved") {
    throw new Error(`Bill ${bill.billNumber} cannot be posted (status: ${bill.status})`);
  }

  if (bill.postedAt) {
    throw new Error(`Bill ${bill.billNumber} already posted`);
  }

  // 2. Build GL postings from line items
  const totalAmount = parseFloat(bill.totalAmount);
  
  const postings: PostDocumentInput["postings"] = [];
  
  // DR Expense/Asset accounts (from line items)
  for (const item of bill.lineItems) {
    if (!item.account_code) {
      throw new Error(`Line item "${item.description}" missing account_code for GL posting`);
    }
    
    // Find account by code (assuming accounts table has code field)
    // For now, we'll use a placeholder - in production, you'd query accounts table
    const itemAmount = parseFloat(item.amount);
    const itemTax = parseFloat(item.tax_rate || "0") * itemAmount;
    const itemTotal = itemAmount + itemTax;
    
    postings.push({
      accountId: item.account_code, // This should be resolved to UUID in production
      direction: "debit",
      amount: itemTotal.toFixed(4),
      description: `${item.description} - ${bill.vendorName} Bill ${bill.billNumber}`,
    });
  }

  // CR Accounts Payable (total amount)
  postings.push({
    accountId: input.apAccountId,
    direction: "credit",
    amount: totalAmount.toFixed(4),
    description: `AP - ${bill.vendorName} Bill ${bill.billNumber}`,
  });

  // 3. Post via posting spine
  const postResult = await postDocument(db, {
    documentId: bill.id,
    tenantId: bill.tenantId,
    userId: input.userId,
    postingDate: input.postingDate,
    eventType: "liability_incurred",
    eventDescription: `Posted purchase bill ${bill.billNumber} for ${bill.vendorName}`,
    eventAmount: bill.totalAmount,
    eventCurrency: bill.currency,
    eventData: {
      billNumber: bill.billNumber,
      vendorName: bill.vendorName,
      vendorId: bill.vendorId,
      poId: bill.poId,
      lineItems: bill.lineItems,
    },
    postings,
    context: input.context,
  });

  // 4. Update bill with document link
  const [updatedBill] = await db
    .update(purchaseBills)
    .set({
      documentId: postResult.document.id,
      postedAt: new Date(),
      status: "posted",
      modifiedBy: input.userId,
      updatedAt: new Date(),
    })
    .where(eq(purchaseBills.id, input.billId))
    .returning();

  if (!updatedBill) {
    throw new Error(`Failed to update bill: ${input.billId}`);
  }

  return {
    bill: updatedBill,
    documentId: postResult.document.id,
  };
}

/**
 * Get bill by ID.
 */
export async function getBillById(
  db: Database,
  billId: string
): Promise<PurchaseBill | null> {
  const [bill] = await db
    .select()
    .from(purchaseBills)
    .where(eq(purchaseBills.id, billId))
    .limit(1);

  return bill || null;
}

/**
 * Get bills by tenant.
 */
export async function getBillsByTenant(
  db: Database,
  tenantId: string,
  options?: {
    limit?: number;
    offset?: number;
    status?: string;
  }
): Promise<PurchaseBill[]> {
  const conditions = [eq(purchaseBills.tenantId, tenantId)];

  if (options?.status) {
    conditions.push(eq(purchaseBills.status, options.status));
  }

  const query = db
    .select()
    .from(purchaseBills)
    .where(and(...conditions))
    .orderBy(desc(purchaseBills.billDate))
    .limit(options?.limit ?? 100)
    .offset(options?.offset ?? 0);

  return await query;
}

/**
 * Update bill status.
 */
export async function updateBillStatus(
  db: Database,
  billId: string,
  status: string,
  userId: string
): Promise<PurchaseBill> {
  const [bill] = await db
    .update(purchaseBills)
    .set({
      status,
      modifiedBy: userId,
      updatedAt: new Date(),
    })
    .where(eq(purchaseBills.id, billId))
    .returning();

  if (!bill) {
    throw new Error(`Bill not found: ${billId}`);
  }

  return bill;
}

/**
 * Record payment on bill.
 */
export async function recordPayment(
  db: Database,
  billId: string,
  amount: number,
  paymentDate: Date,
  userId: string
): Promise<PurchaseBill> {
  const [bill] = await db
    .select()
    .from(purchaseBills)
    .where(eq(purchaseBills.id, billId))
    .limit(1);

  if (!bill) {
    throw new Error(`Bill ${billId} not found`);
  }

  const currentPaid = parseFloat(bill.amountPaid);
  const newPaid = currentPaid + amount;
  const totalAmount = parseFloat(bill.totalAmount);
  const newDue = totalAmount - newPaid;

  let newStatus = bill.status;
  if (newDue <= 0) {
    newStatus = "paid";
  }

  const [updated] = await db
    .update(purchaseBills)
    .set({
      amountPaid: newPaid.toFixed(4),
      amountDue: newDue.toFixed(4),
      status: newStatus,
      lastPaymentDate: paymentDate,
      modifiedBy: userId,
      updatedAt: new Date(),
    })
    .where(eq(purchaseBills.id, billId))
    .returning();

  if (!updated) {
    throw new Error(`Failed to update bill: ${billId}`);
  }

  return updated;
}
