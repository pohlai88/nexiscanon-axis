// packages/validation/src/erp/sales/credit.ts
// Sales Credit Note Zod Contracts (SSOT)
//
// Validation schemas for sales credit notes following Phase 2.1/2.2/2.3 patterns:
// - Money as string (converted to cents in service)
// - Qty as decimal string (converted to numeric in service)
// - Immutable business keys
// - List envelope: { items, nextCursor }

import { z } from "zod";
import { MoneyString, QtyString, normalizeSearch } from "./quote";

// ---- Status Enum ----

export const SalesCreditNoteStatus = z.enum(["DRAFT", "ISSUED", "CANCELLED"]);
export type SalesCreditNoteStatus = z.infer<typeof SalesCreditNoteStatus>;

// ---- Create Input ----

export const CreditNoteCreateInput = z.object({
  partnerId: z.string().uuid("Partner ID must be a valid UUID"),
  currency: z
    .string()
    .min(3, "Currency code must be at least 3 characters")
    .max(8, "Currency code must be at most 8 characters")
    .toUpperCase(), // Normalize to uppercase (USD, VND, etc.)
  reason: z
    .string()
    .max(2000, "Reason must be at most 2000 characters")
    .nullable()
    .optional(),
  notes: z.string().max(5000, "Notes must be at most 5000 characters").nullable().optional(),
});

export type CreditNoteCreateInput = z.infer<typeof CreditNoteCreateInput>;

// ---- Update Input (DRAFT only) ----

export const CreditNoteUpdateInput = z.object({
  partnerId: z.string().uuid("Partner ID must be a valid UUID").optional(),
  currency: z
    .string()
    .min(3, "Currency code must be at least 3 characters")
    .max(8, "Currency code must be at most 8 characters")
    .toUpperCase()
    .optional(),
  reason: z
    .string()
    .max(2000, "Reason must be at most 2000 characters")
    .nullable()
    .optional(),
  notes: z.string().max(5000, "Notes must be at most 5000 characters").nullable().optional(),
});

export type CreditNoteUpdateInput = z.infer<typeof CreditNoteUpdateInput>;

// ---- Credit Note Line Input ----

export const CreditNoteLineUpsertInput = z.object({
  lineNo: z.number().int().min(1, "Line number must be >= 1").optional(), // If absent, append to end
  productId: z.string().uuid("Product ID must be a valid UUID").nullable().optional(),
  description: z
    .string()
    .min(1, "Description required")
    .max(4000, "Description must be at most 4000 characters"),
  uomId: z.string().uuid("UoM ID must be a valid UUID"),
  qty: QtyString,
  unitPrice: MoneyString,
});

export type CreditNoteLineUpsertInput = z.infer<typeof CreditNoteLineUpsertInput>;

// ---- List Query ----

export const CreditNoteListQuery = z.object({
  q: z
    .string()
    .min(1, "Search query must not be empty")
    .max(200, "Search query must be at most 200 characters")
    .transform(normalizeSearch)
    .optional(),
  status: z
    .array(SalesCreditNoteStatus)
    .min(1, "At least one status required when filtering by status")
    .optional(),
  partnerId: z.string().uuid("Partner ID must be a valid UUID").optional(),
  sourceInvoiceId: z.string().uuid("Source Invoice ID must be a valid UUID").optional(),
  cursor: z.string().min(1, "Cursor must not be empty").optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreditNoteListQuery = z.infer<typeof CreditNoteListQuery>;

// ---- Create Credit Note from Invoice Input ----

export const CreateCreditFromInvoiceInput = z.object({
  // Empty body - invoiceId comes from URL params
  // This schema exists for consistency and future extensibility
});

export type CreateCreditFromInvoiceInput = z.infer<typeof CreateCreditFromInvoiceInput>;

// ---- Outputs ----

export const CreditNoteLineOutput = z.object({
  id: z.string().uuid(),
  lineNo: z.number().int(),
  productId: z.string().uuid().nullable().optional(),
  description: z.string(),
  uomId: z.string().uuid(),
  qty: z.string(), // Decimal string
  unitPrice: z.string(), // Money string
  lineTotal: z.string(), // Money string (computed)
});

export type CreditNoteLineOutput = z.infer<typeof CreditNoteLineOutput>;

export const CreditNoteOutput = z.object({
  id: z.string().uuid(),
  creditNo: z.string(),
  status: SalesCreditNoteStatus,
  partnerId: z.string().uuid(),
  currency: z.string(),
  sourceInvoiceId: z.string().uuid().nullable().optional(),
  reason: z.string().nullable().optional(),
  subtotal: z.string(), // Money string
  total: z.string(), // Money string
  notes: z.string().nullable().optional(),
  issuedAt: z.string().datetime().nullable().optional(),
  cancelledAt: z.string().datetime().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  lines: z.array(CreditNoteLineOutput).optional(), // Included when fetching single credit note
});

export type CreditNoteOutput = z.infer<typeof CreditNoteOutput>;

export const CreditNoteListOutput = z.object({
  items: z.array(CreditNoteOutput),
  nextCursor: z.string().nullable().optional(),
});

export type CreditNoteListOutput = z.infer<typeof CreditNoteListOutput>;
