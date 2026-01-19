// packages/validation/src/erp/sales/quote.ts
// Sales Quote Zod Contracts (SSOT)
//
// Validation schemas for sales quotes following Phase 1 patterns:
// - Money as string (converted to cents in service)
// - Qty as decimal string (converted to numeric in service)
// - Immutable business keys
// - List envelope: { items, nextCursor }

import { z } from "zod";

// ---- Status Enum ----

export const SalesQuoteStatus = z.enum(["DRAFT", "SENT", "ACCEPTED", "CANCELLED"]);
export type SalesQuoteStatus = z.infer<typeof SalesQuoteStatus>;

// ---- Helpers ----

/**
 * Money String Validator
 * 
 * Format: decimal string with up to 2 decimal places
 * Examples: "10.50", "100", "0.99"
 * Service converts to integer cents for storage
 */
export const MoneyString = z
  .string()
  .min(1, "Money amount required")
  .regex(/^\d+(\.\d{1,2})?$/, "Invalid money format (use decimal with up to 2 places)")
  .refine((v) => parseFloat(v) >= 0, "Money amount must be >= 0");

/**
 * Quantity String Validator
 * 
 * Format: decimal string with up to 6 decimal places
 * Examples: "10.5", "100", "0.000001"
 * Service converts to numeric for storage
 */
export const QtyString = z
  .string()
  .min(1, "Quantity required")
  .regex(/^\d+(\.\d{1,6})?$/, "Invalid quantity format (use decimal with up to 6 places)")
  .refine((v) => parseFloat(v) > 0, "Quantity must be > 0");

/**
 * Normalize search query
 * Trims whitespace and collapses multiple spaces
 */
export function normalizeSearch(s: string): string {
  return s.trim().replace(/\s+/g, " ");
}

// ---- Create Input ----

export const QuoteCreateInput = z.object({
  partnerId: z.string().uuid("Partner ID must be a valid UUID"),
  currency: z
    .string()
    .min(3, "Currency code must be at least 3 characters")
    .max(8, "Currency code must be at most 8 characters")
    .toUpperCase(), // Normalize to uppercase (USD, VND, etc.)
  notes: z.string().max(5000, "Notes must be at most 5000 characters").nullable().optional(),
});

export type QuoteCreateInput = z.infer<typeof QuoteCreateInput>;

// ---- Update Input ----

export const QuoteUpdateInput = z.object({
  partnerId: z.string().uuid("Partner ID must be a valid UUID").optional(),
  currency: z
    .string()
    .min(3, "Currency code must be at least 3 characters")
    .max(8, "Currency code must be at most 8 characters")
    .toUpperCase()
    .optional(),
  notes: z.string().max(5000, "Notes must be at most 5000 characters").nullable().optional(),
});

export type QuoteUpdateInput = z.infer<typeof QuoteUpdateInput>;

// ---- Quote Line Input ----

export const QuoteLineUpsertInput = z.object({
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

export type QuoteLineUpsertInput = z.infer<typeof QuoteLineUpsertInput>;

// ---- List Query ----

export const QuoteListQuery = z.object({
  q: z
    .string()
    .min(1, "Search query must not be empty")
    .max(200, "Search query must be at most 200 characters")
    .transform(normalizeSearch)
    .optional(),
  status: z
    .array(SalesQuoteStatus)
    .min(1, "At least one status required when filtering by status")
    .optional(),
  partnerId: z.string().uuid("Partner ID must be a valid UUID").optional(),
  cursor: z.string().min(1, "Cursor must not be empty").optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type QuoteListQuery = z.infer<typeof QuoteListQuery>;

// ---- Outputs ----

export const QuoteLineOutput = z.object({
  id: z.string().uuid(),
  lineNo: z.number().int(),
  productId: z.string().uuid().nullable().optional(),
  description: z.string(),
  uomId: z.string().uuid(),
  qty: z.string(), // Decimal string
  unitPrice: z.string(), // Money string
  lineTotal: z.string(), // Money string
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type QuoteLineOutput = z.infer<typeof QuoteLineOutput>;

export const QuoteOutput = z.object({
  id: z.string().uuid(),
  quoteNo: z.string(),
  status: SalesQuoteStatus,
  partnerId: z.string().uuid(),
  currency: z.string(),
  total: z.string(), // Money string
  notes: z.string().nullable().optional(),

  // Status timestamps
  issuedAt: z.string().datetime().nullable().optional(),
  acceptedAt: z.string().datetime().nullable().optional(),
  cancelledAt: z.string().datetime().nullable().optional(),

  // Audit timestamps
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),

  // Lines (included in detail view)
  lines: z.array(QuoteLineOutput),
});

export type QuoteOutput = z.infer<typeof QuoteOutput>;

// Quote list item (without lines for list view performance)
export const QuoteListItemOutput = QuoteOutput.omit({ lines: true });
export type QuoteListItemOutput = z.infer<typeof QuoteListItemOutput>;

export const QuoteListOutput = z.object({
  items: z.array(QuoteListItemOutput),
  nextCursor: z.string().nullable(),
});

export type QuoteListOutput = z.infer<typeof QuoteListOutput>;
