/**
 * GL Posting Engine (B07)
 *
 * AXIS Canonical Implementation:
 * - PROTECT: Immutable postings with 6W1H context
 * - DETECT: Double-entry validation (Debits = Credits)
 * - REACT: Danger Zone warnings for policy violations
 *
 * @see .cursor/ERP/A01-CANONICAL.md §3 (Money Pillar)
 * @see .cursor/ERP/B07-ACCOUNTING.md (GL Core)
 */

import { z } from "zod";
import type { Database } from "../..";
import {
  journalEntrySchema,
  type JournalEntry,
  type GlPostingBatch,
  type GlLedgerPosting,
} from "@axis/registry";

// ============================================================================
// Posting Engine Result Types
// ============================================================================

/**
 * Posting result with 6W1H context
 */
export interface PostingResult {
  success: boolean;
  batch?: GlPostingBatch;
  postings?: GlLedgerPosting[];
  dangerZone?: DangerZoneWarning[];
  errors?: PostingError[];
}

/**
 * Danger Zone warning (Nexus Doctrine: warn, don't block)
 */
export interface DangerZoneWarning {
  severity: "warning" | "critical";
  policyId: string;
  message: string;
  requiresApproval: boolean;
}

/**
 * Posting error (validation failures)
 */
export interface PostingError {
  code: string;
  message: string;
  field?: string;
}

// ============================================================================
// Double-Entry Validation (The 500-Year Law)
// ============================================================================

/**
 * Validates _journal entry balance: SUM(debits) = SUM(credits)
 *
 * @param _journal - _journal entry to validate
 * @returns Validation result with errors if unbalanced
 */
export function validateDoubleEntry(journal: JournalEntry): {
  isValid: boolean;
  errors: PostingError[];
} {
  const errors: PostingError[] = [];

  // Calculate totals from lines
  let totalDebit = 0;
  let totalCredit = 0;

  for (const line of journal.lines) {
    const debit = parseFloat(line.debit);
    const credit = parseFloat(line.credit);

    // Validate: one must be zero (debit XOR credit)
    if (debit > 0 && credit > 0) {
      errors.push({
        code: "BOTH_DEBIT_CREDIT",
        message: `Line ${line.lineNumber}: Cannot have both debit and credit`,
        field: `lines[${line.lineNumber - 1}]`,
      });
    }

    if (debit === 0 && credit === 0) {
      errors.push({
        code: "ZERO_AMOUNT",
        message: `Line ${line.lineNumber}: Must have either debit or credit`,
        field: `lines[${line.lineNumber - 1}]`,
      });
    }

    totalDebit += debit;
    totalCredit += credit;
  }

  // The 500-Year Law: Debits = Credits
  const tolerance = 0.01; // Handle floating point precision
  const difference = Math.abs(totalDebit - totalCredit);

  if (difference > tolerance) {
    errors.push({
      code: "UNBALANCED_ENTRY",
      message: `Journal entry is unbalanced: Debits (${totalDebit.toFixed(2)}) ≠ Credits (${totalCredit.toFixed(2)})`,
    });
  }

  // Validate header totals match calculated totals
  const headerDebit = parseFloat(journal.totalDebit);
  const headerCredit = parseFloat(journal.totalCredit);

  if (Math.abs(headerDebit - totalDebit) > tolerance) {
    errors.push({
      code: "HEADER_MISMATCH",
      message: `Header debit (${headerDebit}) does not match line total (${totalDebit})`,
      field: "totalDebit",
    });
  }

  if (Math.abs(headerCredit - totalCredit) > tolerance) {
    errors.push({
      code: "HEADER_MISMATCH",
      message: `Header credit (${headerCredit}) does not match line total (${totalCredit})`,
      field: "totalCredit",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// Period Validation (Danger Zone Detection)
// ============================================================================

/**
 * Validates posting to fiscal period
 *
 * NEXUS DOCTRINE: Don't block, warn with Danger Zone
 *
 * @param _journal - _journal entry to validate
 * @param _db - Database connection
 * @returns Danger Zone warnings if period is closed
 */
export async function validatePeriod(
  _journal: JournalEntry,
  _db: Database
): Promise<DangerZoneWarning[]> {
  const warnings: DangerZoneWarning[] = [];

  // Check if period is closed (implementation pending B07 period table)
  // For now, return empty warnings
  // TODO: Query fiscal_periods table when implemented

  return warnings;
}

// ============================================================================
// GL Posting Engine (Core)
// ============================================================================

/**
 * Posts _journal entry to General Ledger
 *
 * AXIS Flow:
 * 1. VALIDATE: Schema + double-entry + period
 * 2. DETECT: Danger Zone checks (closed period, etc.)
 * 3. CREATE: Posting batch + ledger postings
 * 4. PROTECT: Immutable records with 6W1H context
 *
 * @param _journal - _journal entry to post
 * @param _db - Database connection
 * @param context - 6W1H context (who, when, why)
 * @returns Posting result with batch and postings
 */
export async function postJournalToGL(
  _journal: JournalEntry,
  _db: Database,
  context: {
    userId: string;
    timestamp: string;
    reason?: string;
  }
): Promise<PostingResult> {
  // Step 1: VALIDATE - Schema validation
  const schemaValidation = journalEntrySchema.safeParse(_journal);
  if (!schemaValidation.success) {
    const zodError = schemaValidation.error;
    return {
      success: false,
      errors: zodError.issues.map((e: z.ZodIssue) => ({
        code: "SCHEMA_VALIDATION",
        message: e.message,
        field: e.path.join("."),
      })),
    };
  }

  // Step 2: VALIDATE - Double-entry validation (The 500-Year Law)
  const balanceValidation = validateDoubleEntry(_journal);
  if (!balanceValidation.isValid) {
    return {
      success: false,
      errors: balanceValidation.errors,
    };
  }

  // Step 3: DETECT - Danger Zone checks
  const dangerZoneWarnings = await validatePeriod(_journal, _db);

  // Step 4: CREATE - Posting batch
  const batchId = crypto.randomUUID();
  const batch: GlPostingBatch = {
    id: batchId,
    tenantId: _journal.tenantId,
    sourceDocumentType: _journal.sourceDocumentType || "journal_entry",
    sourceDocumentId: _journal.sourceDocumentId || _journal.id,
    sourceDocumentNumber: _journal.sourceDocumentNumber || _journal.documentNumber,
    status: "sealed",
    totalDebit: _journal.totalDebit,
    totalCredit: _journal.totalCredit,
    isBalanced: true,
    sealedAt: context.timestamp,
    sealedBy: context.userId,
    createdAt: context.timestamp,
  };

  // Step 5: CREATE - Ledger postings (IMMUTABLE)
  const postings: GlLedgerPosting[] = _journal.lines.map((line: JournalEntry["lines"][number]) => ({
    id: crypto.randomUUID(),
    tenantId: _journal.tenantId,
    postingBatchId: batchId,
    journalId: _journal.id,
    journalNumber: _journal.documentNumber,
    journalLineNumber: line.lineNumber,
    accountId: line.accountId,
    accountCode: line.accountCode,
    debit: line.debit,
    credit: line.credit,
    currency: _journal.currency,
    exchangeRate: _journal.exchangeRate,
    baseCurrencyDebit: line.debit, // TODO: Apply exchange rate
    baseCurrencyCredit: line.credit, // TODO: Apply exchange rate
    partyId: line.partyId,
    costCenterId: line.costCenterId,
    projectId: line.projectId,
    effectiveDate: _journal.effectiveDate,
    fiscalPeriodId: _journal.fiscalPeriodId,
    fiscalYear: _journal.fiscalYear,
    fiscalMonth: _journal.fiscalMonth,
    sourceDocumentType: _journal.sourceDocumentType,
    sourceDocumentId: _journal.sourceDocumentId,
    isPosted: true,
    postedAt: context.timestamp,
    createdAt: context.timestamp,
  }));

  // Step 6: PROTECT - Persist to database (transaction)
  // TODO: Implement database insertion when tables are ready
  // await db.transaction(async (tx) => {
  //   await tx.insert(glPostingBatches).values(batch);
  //   await tx.insert(glLedgerPostings).values(postings);
  //   await tx.update(journalEntries)
  //     .set({ status: "posted", postedBy: context.userId, postedAt: context.timestamp })
  //     .where(eq(journalEntries.id, journal.id));
  // });

  return {
    success: true,
    batch,
    postings,
    dangerZone: dangerZoneWarnings.length > 0 ? dangerZoneWarnings : undefined,
  };
}

// ============================================================================
// Reversal Entry Creation (Correction Pattern)
// ============================================================================

/**
 * Creates reversal _journal entry
 *
 * AXIS Law: Posted entries are NEVER modified, only reversed
 *
 * @param originalJournal - _journal entry to reverse
 * @param context - 6W1H context
 * @returns Reversal _journal entry
 */
export function createReversalEntry(
  originalJournal: JournalEntry,
  context: {
    userId: string;
    timestamp: string;
    reason: string;
  }
): JournalEntry {
  // Flip debits and credits
  const reversalLines = originalJournal.lines.map((line: JournalEntry["lines"][number]) => ({
    ...line,
    debit: line.credit, // Swap
    credit: line.debit, // Swap
  }));

  const reversalEntry: JournalEntry = {
    ...originalJournal,
    id: crypto.randomUUID(),
    documentNumber: `${originalJournal.documentNumber}-REV`,
    description: `REVERSAL: ${originalJournal.description} - Reason: ${context.reason}`,
    journalDate: context.timestamp,
    effectiveDate: context.timestamp,
    status: "draft",
    lines: reversalLines,
    totalDebit: originalJournal.totalCredit, // Swap
    totalCredit: originalJournal.totalDebit, // Swap
    isReversal: true,
    reversesJournalId: originalJournal.id,
    createdBy: context.userId,
    createdAt: context.timestamp,
    updatedAt: context.timestamp,
    approvedBy: undefined,
    approvedAt: undefined,
    postedBy: undefined,
    postedAt: undefined,
    postingBatchId: undefined,
  };

  return reversalEntry;
}

// ============================================================================
// Export Public API
// ============================================================================

export const GLPostingEngine = {
  validateDoubleEntry,
  validatePeriod,
  postJournalToGL,
  createReversalEntry,
} as const;
