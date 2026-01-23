/**
 * Journal Entry Schema (B07)
 *
 * Balanced double-entry accounting records.
 */

import { z } from "zod";
import { JOURNAL_TYPE, JOURNAL_STATUS } from "./constants";

// ============================================================================
// Journal Line Schema
// ============================================================================

export const journalLineSchema = z.object({
  lineNumber: z.number().int().positive(),

  // Account
  accountId: z.uuid(),
  accountCode: z.string().min(1).max(20),
  accountName: z.string().max(255),

  // Amounts (one must be zero)
  debit: z.string().default("0"),
  credit: z.string().default("0"),

  // For foreign currency
  foreignDebit: z.string().optional(),
  foreignCredit: z.string().optional(),
  foreignCurrency: z.string().length(3).optional(),

  // Subledger (for control accounts) - reference by UUID, not FK per B02
  partyId: z.uuid().optional(),
  partyName: z.string().max(255).optional(),

  // Dimensions
  costCenterId: z.uuid().optional(),
  projectId: z.uuid().optional(),

  // Description
  description: z.string().max(255).optional(),

  // Reconciliation
  isReconciled: z.boolean().default(false),
  reconciledAt: z.string().datetime().optional(),
  bankStatementId: z.uuid().optional(),
});

export type JournalLine = z.infer<typeof journalLineSchema>;

// ============================================================================
// Journal Entry Schema
// ============================================================================

export const journalEntrySchema = z.object({
  id: z.uuid(),
  tenantId: z.uuid(),

  // Identity
  documentNumber: z.string().min(1).max(50),
  journalType: z.enum(JOURNAL_TYPE),

  // Description
  description: z.string().max(500),
  reference: z.string().max(100).optional(),

  // Source document (cross-domain reference by UUID, not FK per B02)
  sourceDocumentType: z.string().max(50).optional(),
  sourceDocumentId: z.uuid().optional(),
  sourceDocumentNumber: z.string().max(50).optional(),

  // Dates
  journalDate: z.string().datetime(),
  effectiveDate: z.string().datetime(),

  // Period (reference by UUID, not FK per B02)
  fiscalPeriodId: z.uuid(),
  fiscalYear: z.number().int(),
  fiscalMonth: z.number().int().min(1).max(13),

  // Currency
  currency: z.string().length(3),
  exchangeRate: z.number().positive().default(1),

  // Status
  status: z.enum(JOURNAL_STATUS).default("draft"),

  // Lines (at least 2 required)
  lines: z.array(journalLineSchema).min(2),

  // Totals (must be equal)
  totalDebit: z.string(),
  totalCredit: z.string(),

  // Approval
  approvedBy: z.uuid().optional(),
  approvedAt: z.string().datetime().optional(),

  // Posting
  postedBy: z.uuid().optional(),
  postedAt: z.string().datetime().optional(),
  postingBatchId: z.uuid().optional(),

  // Reversal
  isReversal: z.boolean().default(false),
  reversesJournalId: z.uuid().optional(),
  reversedByJournalId: z.uuid().optional(),

  // Metadata
  createdBy: z.uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type JournalEntry = z.infer<typeof journalEntrySchema>;
