/**
 * Ledger Posting Schema (B07)
 *
 * Immutable ledger entries.
 */

import { z } from "zod";

// ============================================================================
// Posting Batch Schema
// ============================================================================

export const glPostingBatchSchema = z.object({
  id: z.uuid(),
  tenantId: z.uuid(),

  // Source (cross-domain reference by UUID, not FK per B02)
  sourceDocumentType: z.string().min(1).max(50),
  sourceDocumentId: z.uuid(),
  sourceDocumentNumber: z.string().max(50),

  // Status
  status: z.enum(["open", "sealed"]).default("open"),

  // Totals
  totalDebit: z.string(),
  totalCredit: z.string(),

  // Balance check
  isBalanced: z.boolean(),

  // Seal timestamp
  sealedAt: z.string().datetime().optional(),
  sealedBy: z.uuid().optional(),

  createdAt: z.string().datetime(),
});

export type GlPostingBatch = z.infer<typeof glPostingBatchSchema>;

// ============================================================================
// Ledger Posting Schema
// ============================================================================

export const glLedgerPostingSchema = z.object({
  id: z.uuid(),
  tenantId: z.uuid(),

  // Batch (groups all postings from one transaction)
  postingBatchId: z.uuid(),

  // Journal reference
  journalId: z.uuid(),
  journalNumber: z.string().max(50),
  journalLineNumber: z.number().int(),

  // Account
  accountId: z.uuid(),
  accountCode: z.string().max(20),

  // Amounts
  debit: z.string().default("0"),
  credit: z.string().default("0"),

  // Currency
  currency: z.string().length(3),
  exchangeRate: z.number().positive(),
  baseCurrencyDebit: z.string().default("0"),
  baseCurrencyCredit: z.string().default("0"),

  // Subledger (reference by UUID, not FK per B02)
  partyId: z.uuid().optional(),

  // Dimensions
  costCenterId: z.uuid().optional(),
  projectId: z.uuid().optional(),

  // Dates
  effectiveDate: z.string().datetime(),

  // Period
  fiscalPeriodId: z.uuid(),
  fiscalYear: z.number().int(),
  fiscalMonth: z.number().int(),

  // Source (cross-domain reference by UUID, not FK per B02)
  sourceDocumentType: z.string().max(50).optional(),
  sourceDocumentId: z.uuid().optional(),

  // Immutability flag
  isPosted: z.boolean().default(true),
  postedAt: z.string().datetime(),

  createdAt: z.string().datetime(),
});

export type GlLedgerPosting = z.infer<typeof glLedgerPostingSchema>;
