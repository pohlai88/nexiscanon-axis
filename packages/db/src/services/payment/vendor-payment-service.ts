/**
 * Vendor Payment Service (B01 Posting Spine Integration)
 * 
 * Manages payments made to vendors (AP disbursement).
 */

import { eq, desc, and } from "drizzle-orm";
import type { Database } from "../../client";
import { vendorPayments, type VendorPayment } from "../../schema/payment/vendor-payment";
import { purchaseBills } from "../../schema/purchase/bill";
import { postDocument, type PostDocumentInput } from "../posting-spine/document-state";
import { type SixW1HContext } from "@axis/registry/types";

/**
 * Create vendor payment input.
 */
export interface CreateVendorPaymentInput {
  tenantId: string;
  paymentNumber: string;
  paymentDate: Date;
  vendorId?: string;
  vendorName: string;
  paymentMethod: string; // cash | check | wire | card | ach
  referenceNumber?: string;
  amount: number;
  currency?: string;
  bankAccountId?: string;
  billId?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
  userId: string;
}

/**
 * Post vendor payment to GL input.
 */
export interface PostVendorPaymentToGLInput {
  paymentId: string;
  postingDate: Date;
  userId: string;
  context: SixW1HContext;
  apAccountId: string; // Accounts Payable account
  cashAccountId: string; // Cash/Bank account
}

/**
 * Create a vendor payment (pending state).
 */
export async function createVendorPayment(
  db: Database,
  input: CreateVendorPaymentInput
): Promise<VendorPayment> {
  const [payment] = await db
    .insert(vendorPayments)
    .values({
      tenantId: input.tenantId,
      paymentNumber: input.paymentNumber,
      paymentDate: input.paymentDate,
      vendorId: input.vendorId,
      vendorName: input.vendorName,
      paymentMethod: input.paymentMethod,
      referenceNumber: input.referenceNumber,
      amount: input.amount.toFixed(4),
      currency: input.currency || "USD",
      unappliedAmount: input.amount.toFixed(4), // Initially all unapplied
      bankAccountId: input.bankAccountId,
      billId: input.billId,
      status: "pending",
      notes: input.notes,
      metadata: input.metadata || {},
      createdBy: input.userId,
      modifiedBy: input.userId,
    })
    .returning();

  if (!payment) {
    throw new Error("Failed to create vendor payment");
  }

  return payment;
}

/**
 * Post vendor payment to GL via B01 Posting Spine.
 * 
 * Creates:
 * 1. Document entry (state: posted, type: vendor_payment)
 * 2. Economic event (payment.made)
 * 3. GL postings (DR AP, CR Cash)
 * 4. Updates linked bill if applicable
 */
export async function postVendorPaymentToGL(
  db: Database,
  input: PostVendorPaymentToGLInput
): Promise<{ payment: VendorPayment; documentId: string }> {
  // 1. Get payment
  const [payment] = await db
    .select()
    .from(vendorPayments)
    .where(eq(vendorPayments.id, input.paymentId))
    .limit(1);

  if (!payment) {
    throw new Error(`Vendor payment ${input.paymentId} not found`);
  }

  if (payment.status !== "pending") {
    throw new Error(`Payment ${payment.paymentNumber} cannot be posted (status: ${payment.status})`);
  }

  if (payment.postedAt) {
    throw new Error(`Payment ${payment.paymentNumber} already posted`);
  }

  // 2. Build GL postings
  const paymentAmount = parseFloat(payment.amount);
  
  const postings: PostDocumentInput["postings"] = [
    // DR Accounts Payable
    {
      accountId: input.apAccountId,
      direction: "debit",
      amount: paymentAmount.toFixed(4),
      description: `AP payment - ${payment.vendorName} Payment ${payment.paymentNumber}`,
    },
    // CR Cash/Bank
    {
      accountId: input.cashAccountId,
      direction: "credit",
      amount: paymentAmount.toFixed(4),
      description: `Cash disbursement - ${payment.vendorName} Payment ${payment.paymentNumber}`,
    },
  ];

  // 3. Post via posting spine
  const postResult = await postDocument(db, {
    documentId: payment.id,
    tenantId: payment.tenantId,
    userId: input.userId,
    postingDate: input.postingDate,
    eventType: "liability_settled",
    eventDescription: `Made payment ${payment.paymentNumber} to ${payment.vendorName}`,
    eventAmount: payment.amount,
    eventCurrency: payment.currency,
    eventData: {
      paymentNumber: payment.paymentNumber,
      vendorName: payment.vendorName,
      vendorId: payment.vendorId,
      billId: payment.billId,
      paymentMethod: payment.paymentMethod,
      referenceNumber: payment.referenceNumber,
    },
    postings,
    context: input.context,
  });

  // 4. Update payment with document link
  const [updatedPayment] = await db
    .update(vendorPayments)
    .set({
      documentId: postResult.document.id,
      postedAt: new Date(),
      status: "cleared",
      modifiedBy: input.userId,
      updatedAt: new Date(),
    })
    .where(eq(vendorPayments.id, input.paymentId))
    .returning();

  if (!updatedPayment) {
    throw new Error(`Failed to update payment: ${input.paymentId}`);
  }

  // 5. Update linked bill if applicable
  if (payment.billId) {
    const [bill] = await db
      .select()
      .from(purchaseBills)
      .where(eq(purchaseBills.id, payment.billId))
      .limit(1);

    if (bill) {
      const currentPaid = parseFloat(bill.amountPaid);
      const newPaid = currentPaid + paymentAmount;
      const totalAmount = parseFloat(bill.totalAmount);
      const newDue = totalAmount - newPaid;

      let newStatus = bill.status;
      if (newDue <= 0) {
        newStatus = "paid";
      }

      await db
        .update(purchaseBills)
        .set({
          amountPaid: newPaid.toFixed(4),
          amountDue: newDue.toFixed(4),
          status: newStatus,
          lastPaymentDate: payment.paymentDate,
          modifiedBy: input.userId,
          updatedAt: new Date(),
        })
        .where(eq(purchaseBills.id, payment.billId));
    }
  }

  return {
    payment: updatedPayment,
    documentId: postResult.document.id,
  };
}

/**
 * Apply payment to bill.
 */
export async function applyPaymentToBill(
  db: Database,
  paymentId: string,
  billId: string,
  amount: number,
  userId: string
): Promise<VendorPayment> {
  const [payment] = await db
    .select()
    .from(vendorPayments)
    .where(eq(vendorPayments.id, paymentId))
    .limit(1);

  if (!payment) {
    throw new Error(`Payment ${paymentId} not found`);
  }

  const unapplied = parseFloat(payment.unappliedAmount);
  if (amount > unapplied) {
    throw new Error(`Cannot apply $${amount} - only $${unapplied} unapplied`);
  }

  const newUnapplied = unapplied - amount;

  const [updated] = await db
    .update(vendorPayments)
    .set({
      billId,
      unappliedAmount: newUnapplied.toFixed(4),
      modifiedBy: userId,
      updatedAt: new Date(),
    })
    .where(eq(vendorPayments.id, paymentId))
    .returning();

  if (!updated) {
    throw new Error(`Failed to apply payment: ${paymentId}`);
  }

  return updated;
}

/**
 * Void payment.
 */
export async function voidVendorPayment(
  db: Database,
  paymentId: string,
  userId: string,
  reason: string
): Promise<VendorPayment> {
  const [payment] = await db
    .update(vendorPayments)
    .set({
      status: "void",
      notes: reason,
      modifiedBy: userId,
      updatedAt: new Date(),
    })
    .where(eq(vendorPayments.id, paymentId))
    .returning();

  if (!payment) {
    throw new Error(`Payment not found: ${paymentId}`);
  }

  return payment;
}

/**
 * Get vendor payment by ID.
 */
export async function getVendorPaymentById(
  db: Database,
  paymentId: string
): Promise<VendorPayment | null> {
  const [payment] = await db
    .select()
    .from(vendorPayments)
    .where(eq(vendorPayments.id, paymentId))
    .limit(1);

  return payment || null;
}

/**
 * Get vendor payments by tenant.
 */
export async function getVendorPaymentsByTenant(
  db: Database,
  tenantId: string,
  options?: {
    limit?: number;
    offset?: number;
    status?: string;
  }
): Promise<VendorPayment[]> {
  const conditions = [eq(vendorPayments.tenantId, tenantId)];

  if (options?.status) {
    conditions.push(eq(vendorPayments.status, options.status));
  }

  const query = db
    .select()
    .from(vendorPayments)
    .where(and(...conditions))
    .orderBy(desc(vendorPayments.paymentDate))
    .limit(options?.limit ?? 100)
    .offset(options?.offset ?? 0);

  return await query;
}

/**
 * Get payments by vendor.
 */
export async function getPaymentsByVendor(
  db: Database,
  vendorId: string
): Promise<VendorPayment[]> {
  return await db
    .select()
    .from(vendorPayments)
    .where(eq(vendorPayments.vendorId, vendorId))
    .orderBy(desc(vendorPayments.paymentDate));
}
