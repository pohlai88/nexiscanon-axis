/**
 * Purchase Payment Service (B05)
 *
 * AXIS Canonical Implementation:
 * - Records supplier payment
 * - Reconciles AP subledger entries
 * - Posts to GL: Dr AP, Cr Bank
 * - Integration with B07 GL + Subledger
 *
 * @see .cursor/ERP/A01-CANONICAL.md §2 (Money Pillar)
 * @see .cursor/ERP/B05-PURCHASE.md (Purchase Core)
 */

import type { Database } from "../..";
import type { PurchasePayment, JournalEntry } from "@axis/registry";
import { GLPostingEngine } from "../accounting/gl-posting-engine";
import { SubledgerService } from "../accounting/subledger-service";

// ============================================================================
// Payment Posting Types
// ============================================================================

export interface PurchasePaymentPostingResult {
  success: boolean;
  postingBatchId?: string;
  journalId?: string;
  reconciledBills?: string[];
  errors?: string[];
}

// ============================================================================
// Payment Posting
// ============================================================================

/**
 * Posts purchase payment to GL and reconciles AP
 *
 * AXIS Flow:
 * 1. Validate payment (allocations, amounts, approval)
 * 2. Create journal entry (Dr AP, Cr Bank)
 * 3. Post to GL via B07 Posting Engine
 * 4. Apply payment to AP subledger entries
 * 5. Update bill payment status
 *
 * @param db - Database connection
 * @param payment - Purchase payment to post
 * @param context - 6W1H context
 * @returns Posting result
 */
export async function postPaymentToGL(
  db: Database,
  payment: PurchasePayment,
  context: {
    userId: string;
    timestamp: string;
    fiscalPeriodId: string;
  }
): Promise<PurchasePaymentPostingResult> {
  // Step 1: Validate payment
  const validation = validatePayment(payment);
  if (!validation.isValid) {
    return {
      success: false,
      errors: validation.errors,
    };
  }

  // Step 2: Create journal entry
  const journal = createPaymentJournal(payment, context);

  // Step 3: Post to GL
  const glResult = await GLPostingEngine.postJournalToGL(journal, db, context);

  if (!glResult.success) {
    return {
      success: false,
      errors: glResult.errors?.map(e => e.message),
    };
  }

  // Step 4: Apply payment to AP entries
  const reconciledBills: string[] = [];

  for (const allocation of payment.allocations) {
    await SubledgerService.applyAPPayment(
      {
        id: payment.id,
        tenantId: payment.tenantId,
        documentNumber: payment.documentNumber,
        documentDate: payment.paymentDate,
        supplierId: payment.supplierId,
        supplierName: payment.supplierName,
        amount: allocation.amountAllocated,
        currency: payment.currency,
      },
      allocation.billId,
      journal.id,
      glResult.batch!.id,
      context
    );

    reconciledBills.push(allocation.billId);
  }

  // Step 5: Update payment status
  // TODO: Update payment in database
  // await db.update(purchasePayments)
  //   .set({
  //     status: "posted",
  //     postingBatchId: glResult.batch.id,
  //     postedBy: context.userId,
  //     postedAt: context.timestamp,
  //   })
  //   .where(eq(purchasePayments.id, payment.id));

  return {
    success: true,
    postingBatchId: glResult.batch!.id,
    journalId: journal.id,
    reconciledBills,
  };
}

// ============================================================================
// Payment Validation
// ============================================================================

/**
 * Validates payment before posting
 *
 * AXIS Law: PROTECT.DETECT.REACT
 *
 * @param payment - Payment to validate
 * @returns Validation result
 */
function validatePayment(payment: PurchasePayment): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check status
  if (payment.status === "posted") {
    errors.push("Payment is already posted");
  }

  if (payment.status === "reversed") {
    errors.push("Cannot post reversed payment");
  }

  // Check approval (AXIS Control Point)
  if (!payment.approvedBy) {
    errors.push("Payment requires approval before posting");
  }

  // Check allocations
  if (!payment.allocations || payment.allocations.length === 0) {
    errors.push("Payment must have at least one allocation");
  }

  // Validate total allocation
  const totalAllocated = payment.allocations.reduce(
    (sum, alloc) =>
      sum + parseFloat(alloc.amountAllocated) + parseFloat(alloc.discountTaken),
    0
  );

  if (Math.abs(totalAllocated - parseFloat(payment.amount)) > 0.01) {
    errors.push(
      `Allocation mismatch: allocated ${totalAllocated.toFixed(2)}, payment ${payment.amount}`
    );
  }

  // Check bank account
  if (!payment.bankAccountId) {
    errors.push("Bank account is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// Journal Entry Creation
// ============================================================================

/**
 * Creates journal entry for purchase payment
 *
 * Journal Entry:
 * - Dr Accounts Payable (payment amount + discount)
 * - Cr Bank Account (payment amount)
 * - Cr Discount Received (if early payment discount)
 *
 * @param payment - Purchase payment
 * @param context - 6W1H context
 * @returns Journal entry
 */
function createPaymentJournal(
  payment: PurchasePayment,
  context: {
    userId: string;
    timestamp: string;
    fiscalPeriodId: string;
  }
): JournalEntry {
  const lines: JournalEntry["lines"] = [];
  let lineNumber = 1;

  // Calculate total discount
  const totalDiscount = payment.allocations.reduce(
    (sum, alloc) => sum + parseFloat(alloc.discountTaken),
    0
  );

  // Dr Accounts Payable (payment + discount)
  const totalAP = parseFloat(payment.amount) + totalDiscount;

  lines.push({
    lineNumber: lineNumber++,
    accountId: crypto.randomUUID(), // TODO: Get AP account from config
    accountCode: "2000",
    accountName: "Accounts Payable",
    debit: totalAP.toFixed(2),
    credit: "0",
    description: `Payment ${payment.documentNumber} - ${payment.supplierName}`,
    isReconciled: false,
  });

  // Cr Bank Account
  lines.push({
    lineNumber: lineNumber++,
    accountId: payment.bankAccountId,
    accountCode: "1000", // TODO: Get from COA
    accountName: payment.bankAccountName,
    debit: "0",
    credit: payment.amount,
    description: `Payment ${payment.documentNumber} - ${payment.supplierName}`,
    isReconciled: false,
  });

  // Cr Discount Received (if applicable)
  if (totalDiscount > 0) {
    lines.push({
      lineNumber: lineNumber++,
      accountId: crypto.randomUUID(), // TODO: Get from config
      accountCode: "7100",
      accountName: "Discount Received",
      debit: "0",
      credit: totalDiscount.toFixed(2),
      description: `Early payment discount - ${payment.documentNumber}`,
      isReconciled: false,
    });
  }

  // Calculate totals
  const totalDebit = lines.reduce((sum, l) => sum + parseFloat(l.debit), 0);
  const totalCredit = lines.reduce((sum, l) => sum + parseFloat(l.credit), 0);

  const journal: JournalEntry = {
    id: crypto.randomUUID(),
    tenantId: payment.tenantId,
    documentNumber: `PAY-${payment.documentNumber}`,
    journalType: "cash_payment",
    description: `Supplier payment: ${payment.documentNumber} - ${payment.supplierName}`,
    reference: payment.referenceNumber || payment.checkNumber || payment.documentNumber,
    sourceDocumentType: "purchase_payment",
    sourceDocumentId: payment.id,
    sourceDocumentNumber: payment.documentNumber,
    journalDate: context.timestamp,
    effectiveDate: payment.paymentDate,
    fiscalPeriodId: context.fiscalPeriodId,
    fiscalYear: new Date(payment.paymentDate).getFullYear(),
    fiscalMonth: new Date(payment.paymentDate).getMonth() + 1,
    currency: payment.currency,
    exchangeRate: payment.exchangeRate,
    status: "draft",
    lines,
    totalDebit: totalDebit.toFixed(2),
    totalCredit: totalCredit.toFixed(2),
    createdBy: context.userId,
    createdAt: context.timestamp,
    updatedAt: context.timestamp,
    isReversal: false,
  };

  return journal;
}

// ============================================================================
// Export Public API
// ============================================================================

export const PurchasePaymentService = {
  postPaymentToGL,
  validatePayment,
} as const;
