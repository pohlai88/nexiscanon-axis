/**
 * Customer Payment Service (B01 Posting Spine Integration)
 * 
 * Manages payments received from customers (AR collection).
 */

import { eq, desc, and } from "drizzle-orm";
import type { Database } from "../../client";
import { customerPayments, type CustomerPayment } from "../../schema/payment/customer-payment";
import { salesInvoices } from "../../schema/sales/invoice";
import { postDocument, type PostDocumentInput } from "../posting-spine/document-state";
import { type SixW1HContext } from "@axis/registry/types";

/**
 * Create customer payment input.
 */
export interface CreateCustomerPaymentInput {
  tenantId: string;
  paymentNumber: string;
  paymentDate: Date;
  customerId?: string;
  customerName: string;
  paymentMethod: string; // cash | check | wire | card | ach
  referenceNumber?: string;
  amount: number;
  currency?: string;
  bankAccountId?: string;
  invoiceId?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
  userId: string;
}

/**
 * Post customer payment to GL input.
 */
export interface PostCustomerPaymentToGLInput {
  paymentId: string;
  postingDate: Date;
  userId: string;
  context: SixW1HContext;
  cashAccountId: string; // Cash/Bank account
  arAccountId: string; // Accounts Receivable account
}

/**
 * Create a customer payment (pending state).
 */
export async function createCustomerPayment(
  db: Database,
  input: CreateCustomerPaymentInput
): Promise<CustomerPayment> {
  const [payment] = await db
    .insert(customerPayments)
    .values({
      tenantId: input.tenantId,
      paymentNumber: input.paymentNumber,
      paymentDate: input.paymentDate,
      customerId: input.customerId,
      customerName: input.customerName,
      paymentMethod: input.paymentMethod,
      referenceNumber: input.referenceNumber,
      amount: input.amount.toFixed(4),
      currency: input.currency || "USD",
      unappliedAmount: input.amount.toFixed(4), // Initially all unapplied
      bankAccountId: input.bankAccountId,
      invoiceId: input.invoiceId,
      status: "pending",
      notes: input.notes,
      metadata: input.metadata || {},
      createdBy: input.userId,
      modifiedBy: input.userId,
    })
    .returning();

  if (!payment) {
    throw new Error("Failed to create customer payment");
  }

  return payment;
}

/**
 * Post customer payment to GL via B01 Posting Spine.
 * 
 * Creates:
 * 1. Document entry (state: posted, type: customer_payment)
 * 2. Economic event (payment.received)
 * 3. GL postings (DR Cash, CR AR)
 * 4. Updates linked invoice if applicable
 */
export async function postCustomerPaymentToGL(
  db: Database,
  input: PostCustomerPaymentToGLInput
): Promise<{ payment: CustomerPayment; documentId: string }> {
  // 1. Get payment
  const [payment] = await db
    .select()
    .from(customerPayments)
    .where(eq(customerPayments.id, input.paymentId))
    .limit(1);

  if (!payment) {
    throw new Error(`Customer payment ${input.paymentId} not found`);
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
    // DR Cash/Bank
    {
      accountId: input.cashAccountId,
      direction: "debit",
      amount: paymentAmount.toFixed(4),
      description: `Cash received - ${payment.customerName} Payment ${payment.paymentNumber}`,
    },
    // CR Accounts Receivable
    {
      accountId: input.arAccountId,
      direction: "credit",
      amount: paymentAmount.toFixed(4),
      description: `AR collection - ${payment.customerName} Payment ${payment.paymentNumber}`,
    },
  ];

  // 3. Post via posting spine
  const postResult = await postDocument(db, {
    documentId: payment.id,
    tenantId: payment.tenantId,
    userId: input.userId,
    postingDate: input.postingDate,
    eventType: "liability_settled",
    eventDescription: `Received payment ${payment.paymentNumber} from ${payment.customerName}`,
    eventAmount: payment.amount,
    eventCurrency: payment.currency,
    eventData: {
      paymentNumber: payment.paymentNumber,
      customerName: payment.customerName,
      customerId: payment.customerId,
      invoiceId: payment.invoiceId,
      paymentMethod: payment.paymentMethod,
      referenceNumber: payment.referenceNumber,
    },
    postings,
    context: input.context,
  });

  // 4. Update payment with document link
  const [updatedPayment] = await db
    .update(customerPayments)
    .set({
      documentId: postResult.document.id,
      postedAt: new Date(),
      status: "cleared",
      modifiedBy: input.userId,
      updatedAt: new Date(),
    })
    .where(eq(customerPayments.id, input.paymentId))
    .returning();

  if (!updatedPayment) {
    throw new Error(`Failed to update payment: ${input.paymentId}`);
  }

  // 5. Update linked invoice if applicable
  if (payment.invoiceId) {
    const [invoice] = await db
      .select()
      .from(salesInvoices)
      .where(eq(salesInvoices.id, payment.invoiceId))
      .limit(1);

    if (invoice) {
      const currentPaid = parseFloat(invoice.amountPaid);
      const newPaid = currentPaid + paymentAmount;
      const totalAmount = parseFloat(invoice.totalAmount);
      const newDue = totalAmount - newPaid;

      let newStatus = invoice.status;
      if (newDue <= 0) {
        newStatus = "paid";
      } else if (newPaid > 0) {
        newStatus = "partially_paid";
      }

      await db
        .update(salesInvoices)
        .set({
          amountPaid: newPaid.toFixed(4),
          amountDue: newDue.toFixed(4),
          status: newStatus,
          lastPaymentDate: payment.paymentDate,
          modifiedBy: input.userId,
          updatedAt: new Date(),
        })
        .where(eq(salesInvoices.id, payment.invoiceId));
    }
  }

  return {
    payment: updatedPayment,
    documentId: postResult.document.id,
  };
}

/**
 * Apply payment to invoice.
 */
export async function applyPaymentToInvoice(
  db: Database,
  paymentId: string,
  invoiceId: string,
  amount: number,
  userId: string
): Promise<CustomerPayment> {
  const [payment] = await db
    .select()
    .from(customerPayments)
    .where(eq(customerPayments.id, paymentId))
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
    .update(customerPayments)
    .set({
      invoiceId,
      unappliedAmount: newUnapplied.toFixed(4),
      modifiedBy: userId,
      updatedAt: new Date(),
    })
    .where(eq(customerPayments.id, paymentId))
    .returning();

  if (!updated) {
    throw new Error(`Failed to apply payment: ${paymentId}`);
  }

  return updated;
}

/**
 * Void customer payment.
 */
export async function voidCustomerPayment(
  db: Database,
  paymentId: string,
  userId: string,
  reason: string
): Promise<CustomerPayment> {
  const [payment] = await db
    .update(customerPayments)
    .set({
      status: "void",
      notes: reason,
      modifiedBy: userId,
      updatedAt: new Date(),
    })
    .where(eq(customerPayments.id, paymentId))
    .returning();

  if (!payment) {
    throw new Error(`Payment not found: ${paymentId}`);
  }

  return payment;
}

/**
 * Get customer payment by ID.
 */
export async function getCustomerPaymentById(
  db: Database,
  paymentId: string
): Promise<CustomerPayment | null> {
  const [payment] = await db
    .select()
    .from(customerPayments)
    .where(eq(customerPayments.id, paymentId))
    .limit(1);

  return payment || null;
}

/**
 * Get customer payments by tenant.
 */
export async function getCustomerPaymentsByTenant(
  db: Database,
  tenantId: string,
  options?: {
    limit?: number;
    offset?: number;
    status?: string;
  }
): Promise<CustomerPayment[]> {
  const conditions = [eq(customerPayments.tenantId, tenantId)];

  if (options?.status) {
    conditions.push(eq(customerPayments.status, options.status));
  }

  const query = db
    .select()
    .from(customerPayments)
    .where(and(...conditions))
    .orderBy(desc(customerPayments.paymentDate))
    .limit(options?.limit ?? 100)
    .offset(options?.offset ?? 0);

  return await query;
}

/**
 * Get payments by customer.
 */
export async function getPaymentsByCustomer(
  db: Database,
  customerId: string
): Promise<CustomerPayment[]> {
  return await db
    .select()
    .from(customerPayments)
    .where(eq(customerPayments.customerId, customerId))
    .orderBy(desc(customerPayments.paymentDate));
}
