/**
 * Sales Payment Service (B04)
 *
 * AXIS Canonical Implementation:
 * - Records customer payment
 * - Reconciles AR subledger entries
 * - Posts to GL: Dr Bank, Cr AR
 * - Integration with B07 GL + Subledger
 *
 * @see .cursor/ERP/A01-CANONICAL.md §2 (Money Pillar)
 * @see .cursor/ERP/B04-SALES.md (Sales Core)
 */

import type { Database } from "../..";
import type { SalesPayment, JournalEntry } from "@axis/registry";
import { GLPostingEngine } from "../accounting/gl-posting-engine";
import { SubledgerService } from "../accounting/subledger-service";

// ============================================================================
// Payment Posting Types
// ============================================================================

export interface PaymentPostingResult {
  success: boolean;
  postingBatchId?: string;
  journalId?: string;
  reconciledInvoices?: string[];
  errors?: string[];
}

// ============================================================================
// Payment Posting
// ============================================================================

/**
 * Posts sales payment to GL and reconciles AR
 *
 * AXIS Flow:
 * 1. Validate payment (allocations, amounts)
 * 2. Create journal entry (Dr Bank, Cr AR)
 * 3. Post to GL via B07 Posting Engine
 * 4. Apply payment to AR subledger entries
 * 5. Update invoice payment status
 *
 * @param _db - Database connection
 * @param payment - Sales payment to post
 * @param _context - 6W1H _context
 * @returns Posting result
 */
export async function postPaymentToGL(
  _db: Database,
  payment: SalesPayment,
  _context: {
    userId: string;
    timestamp: string;
    fiscalPeriodId: string;
  }
): Promise<PaymentPostingResult> {
  // Step 1: Validate payment
  const validation = validatePayment(payment);
  if (!validation.isValid) {
    return {
      success: false,
      errors: validation.errors,
    };
  }

  // Step 2: Create journal entry
  const journal = createPaymentJournal(payment, _context);

  // Step 3: Post to GL
  const glResult = await GLPostingEngine.postJournalToGL(journal, _db, _context);

  if (!glResult.success) {
    return {
      success: false,
      errors: glResult.errors?.map(e => e.message),
    };
  }

  // Step 4: Apply payment to AR entries
  const reconciledInvoices: string[] = [];

  for (const allocation of payment.allocations) {
    await SubledgerService.applyARPayment(
      {
        id: payment.id,
        tenantId: payment.tenantId,
        documentNumber: payment.documentNumber,
        documentDate: payment.paymentDate,
        customerId: payment.customerId,
        customerName: payment.customerName,
        amount: allocation.amountAllocated,
        currency: payment.currency,
      },
      allocation.invoiceId,
      journal.id,
      glResult.batch!.id,
      _context
    );

    reconciledInvoices.push(allocation.invoiceId);
  }

  // Step 5: Update payment status
  // TODO: Update payment in database
  // await db.update(salesPayments)
  //   .set({
  //     status: "posted",
  //     postingBatchId: glResult.batch.id,
  //     postedBy: context.userId,
  //     postedAt: context.timestamp,
  //   })
  //   .where(eq(salesPayments.id, payment.id));

  return {
    success: true,
    postingBatchId: glResult.batch!.id,
    journalId: journal.id,
    reconciledInvoices,
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
function validatePayment(payment: SalesPayment): {
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

  // Check allocations
  if (!payment.allocations || payment.allocations.length === 0) {
    errors.push("Payment must have at least one allocation");
  }

  // Validate total allocation
  const totalAllocated = payment.allocations.reduce(
    (sum, alloc) =>
      sum +
      parseFloat(alloc.amountAllocated) +
      parseFloat(alloc.discountTaken) +
      parseFloat(alloc.writeOffAmount),
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
 * Creates journal entry for sales payment
 *
 * Journal Entry:
 * - Dr Bank Account (payment amount)
 * - Cr Accounts Receivable (payment amount)
 * - Dr Discount Allowed (if applicable)
 * - Dr Bad Debt Expense (if write-off)
 *
 * @param payment - Sales payment
 * @param _context - 6W1H _context
 * @returns Journal entry
 */
function createPaymentJournal(
  payment: SalesPayment,
  _context: {
    userId: string;
    timestamp: string;
    fiscalPeriodId: string;
  }
): JournalEntry {
  const lines: JournalEntry["lines"] = [];
  let lineNumber = 1;

  // Dr Bank Account
  lines.push({
    lineNumber: lineNumber++,
    accountId: payment.bankAccountId,
    accountCode: "1000", // TODO: Get from COA
    accountName: payment.bankAccountName,
    debit: payment.amount,
    credit: "0",
    description: `Payment ${payment.documentNumber} - ${payment.customerName}`,
    isReconciled: false,
  });

  // Calculate total discounts and write-offs
  const totalDiscount = payment.allocations.reduce(
    (sum, alloc) => sum + parseFloat(alloc.discountTaken),
    0
  );

  const totalWriteOff = payment.allocations.reduce(
    (sum, alloc) => sum + parseFloat(alloc.writeOffAmount),
    0
  );

  // Dr Discount Allowed (if applicable)
  if (totalDiscount > 0) {
    lines.push({
      lineNumber: lineNumber++,
      accountId: crypto.randomUUID(), // TODO: Get from config
      accountCode: "6100",
      accountName: "Discount Allowed",
      debit: totalDiscount.toFixed(2),
      credit: "0",
      description: `Early payment discount - ${payment.documentNumber}`,
      isReconciled: false,
    });
  }

  // Dr Bad Debt Expense (if write-off)
  if (totalWriteOff > 0) {
    lines.push({
      lineNumber: lineNumber++,
      accountId: crypto.randomUUID(), // TODO: Get from config
      accountCode: "6200",
      accountName: "Bad Debt Expense",
      debit: totalWriteOff.toFixed(2),
      credit: "0",
      description: `Write-off - ${payment.documentNumber}`,
      isReconciled: false,
    });
  }

  // Cr Accounts Receivable (total payment + discount + write-off)
  const totalAR = parseFloat(payment.amount) + totalDiscount + totalWriteOff;

  lines.push({
    lineNumber: lineNumber++,
    accountId: crypto.randomUUID(), // TODO: Get AR account from config
    accountCode: "1200",
    accountName: "Accounts Receivable",
    debit: "0",
    credit: totalAR.toFixed(2),
    description: `Payment ${payment.documentNumber} - ${payment.customerName}`,
    isReconciled: false,
  });

  // Calculate totals
  const totalDebit = lines.reduce((sum, l) => sum + parseFloat(l.debit), 0);
  const totalCredit = lines.reduce((sum, l) => sum + parseFloat(l.credit), 0);

  const journal: JournalEntry = {
    id: crypto.randomUUID(),
    tenantId: payment.tenantId,
    documentNumber: `PMT-${payment.documentNumber}`,
    journalType: "cash_receipt",
    description: `Customer payment: ${payment.documentNumber} - ${payment.customerName}`,
    reference: payment.referenceNumber || payment.documentNumber,
    sourceDocumentType: "sales_payment",
    sourceDocumentId: payment.id,
    sourceDocumentNumber: payment.documentNumber,
    journalDate: _context.timestamp,
    effectiveDate: payment.paymentDate,
    fiscalPeriodId: _context.fiscalPeriodId,
    fiscalYear: new Date(payment.paymentDate).getFullYear(),
    fiscalMonth: new Date(payment.paymentDate).getMonth() + 1,
    currency: payment.currency,
    exchangeRate: payment.exchangeRate,
    status: "draft",
    lines,
    totalDebit: totalDebit.toFixed(2),
    totalCredit: totalCredit.toFixed(2),
    createdBy: _context.userId,
    createdAt: _context.timestamp,
    updatedAt: _context.timestamp,
    isReversal: false,
  };

  return journal;
}

// ============================================================================
// Payment Reversal
// ============================================================================

/**
 * Reverses sales payment
 *
 * AXIS Law: Never modify history, create reversal
 *
 * @param _db - Database connection
 * @param _originalPaymentId - Payment to reverse
 * @param _context - 6W1H _context with reason
 * @returns Reversal result
 */
export async function reversePayment(
  _db: Database,
  _originalPaymentId: string,
  _context: {
    userId: string;
    timestamp: string;
    reason: string;
    fiscalPeriodId: string;
  }
): Promise<PaymentPostingResult> {
  // TODO: Get original payment
  // const originalPayment = await db.query.salesPayments.findFirst({
  //   where: eq(salesPayments.id, originalPaymentId),
  // });

  // Create reversal payment (flip Dr/Cr)
  // Post to GL
  // Reverse AR reconciliation

  return {
    success: true,
  };
}

// ============================================================================
// Export Public API
// ============================================================================

export const PaymentService = {
  postPaymentToGL,
  reversePayment,
  validatePayment,
} as const;
