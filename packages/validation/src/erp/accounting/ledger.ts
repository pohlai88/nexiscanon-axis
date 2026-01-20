// packages/validation/src/erp/accounting/ledger.ts
// Zod schemas for accounting ledger (read-only in Phase 2.5)

import { z } from "zod";

// ---- Enums ----

export const LedgerSourceType = z.enum(["SALES_INVOICE", "SALES_CREDIT_NOTE"]);
export const LedgerDc = z.enum(["DEBIT", "CREDIT"]);

// ---- Query Schemas ----

export const Cursor = z.string().min(1);

export const LedgerListQuery = z.object({
  sourceType: LedgerSourceType.optional(),
  sourceId: z.string().uuid().optional(),

  postedAfter: z.string().datetime().optional(),
  postedBefore: z.string().datetime().optional(),

  cursor: Cursor.optional(),
  limit: z.number().int().min(1).max(100).optional().default(20),
});

// ---- Output Schemas ----

export const LedgerLineOutput = z.object({
  id: z.string().uuid(),
  accountCode: z.string().min(1),
  dc: LedgerDc,
  amount: z.string(), // money string at boundary (cents -> decimal string)
  description: z.string().nullable().optional(),
});

export const LedgerEntryOutput = z.object({
  id: z.string().uuid(),
  entryNo: z.string().min(1),

  postedAt: z.string().datetime(),

  sourceType: LedgerSourceType,
  sourceId: z.string().uuid(),

  eventType: z.string().min(1),
  currency: z.string().min(3).max(8),

  memo: z.string().nullable().optional(),
  meta: z.record(z.unknown()),

  lines: z.array(LedgerLineOutput),
});

export const LedgerEntryListItemOutput = LedgerEntryOutput.omit({ lines: true });

export const LedgerListOutput = z.object({
  items: z.array(LedgerEntryListItemOutput),
  nextCursor: z.string().nullable(),
});

// ---- Type Exports ----

export type LedgerSourceTypeEnum = z.infer<typeof LedgerSourceType>;
export type LedgerDcEnum = z.infer<typeof LedgerDc>;
export type LedgerListQueryInput = z.infer<typeof LedgerListQuery>;
export type LedgerLineOutputType = z.infer<typeof LedgerLineOutput>;
export type LedgerEntryOutputType = z.infer<typeof LedgerEntryOutput>;
export type LedgerEntryListItemOutputType = z.infer<typeof LedgerEntryListItemOutput>;
export type LedgerListOutputType = z.infer<typeof LedgerListOutput>;
