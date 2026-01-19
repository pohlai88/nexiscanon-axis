// packages/validation/src/erp/sales/invoice.ts
// Sales Invoice Zod Contracts (SSOT)
//
// Validation schemas for sales invoices following Phase 2.1/2.2 patterns:
// - Money as string (converted to cents in service)
// - Qty as decimal string (converted to numeric in service)
// - Immutable business keys
// - List envelope: { items, nextCursor }

import { z } from "zod";
import { MoneyString, QtyString, normalizeSearch } from "./quote";

// ---- Status Enum ----

export const SalesInvoiceStatus = z.enum(["DRAFT", "ISSUED", "CANCELLED"]);
export type SalesInvoiceStatus = z.infer<typeof SalesInvoiceStatus>;

// ---- Create Input ----

export const InvoiceCreateInput = z.object({
  partnerId: z.string().uuid("Partner ID must be a valid UUID"),
  currency: z
    .string()
    .min(3, "Currency code must be at least 3 characters")
    .max(8, "Currency code must be at most 8 characters")
    .toUpperCase(), // Normalize to uppercase (USD, VND, etc.)
  notes: z.string().max(5000, "Notes must be at most 5000 characters").nullable().optional(),
});

export type InvoiceCreateInput = z.infer<typeof InvoiceCreateInput>;

// ---- Update Input (DRAFT only) ----

export const InvoiceUpdateInput = z.object({
  partnerId: z.string().uuid("Partner ID must be a valid UUID").optional(),
  currency: z
    .string()
    .min(3, "Currency code must be at least 3 characters")
    .max(8, "Currency code must be at most 8 characters")
    .toUpperCase()
    .optional(),
  notes: z.string().max(5000, "Notes must be at most 5000 characters").nullable().optional(),
});

export type InvoiceUpdateInput = z.infer<typeof InvoiceUpdateInput>;

// ---- Invoice Line Input ----

export const InvoiceLineUpsertInput = z.object({
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

export type InvoiceLineUpsertInput = z.infer<typeof InvoiceLineUpsertInput>;

// ---- List Query ----

export const InvoiceListQuery = z.object({
  q: z
    .string()
    .min(1, "Search query must not be empty")
    .max(200, "Search query must be at most 200 characters")
    .transform(normalizeSearch)
    .optional(),
  status: z
    .array(SalesInvoiceStatus)
    .min(1, "At least one status required when filtering by status")
    .optional(),
  partnerId: z.string().uuid("Partner ID must be a valid UUID").optional(),
  cursor: z.string().min(1, "Cursor must not be empty").optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type InvoiceListQuery = z.infer<typeof InvoiceListQuery>;

// ---- Create Invoice from Order Input ----

export const CreateInvoiceFromOrderInput = z.object({
  // Empty body - orderId comes from URL params
  // This schema exists for consistency and future extensibility
});

export type CreateInvoiceFromOrderInput = z.infer<typeof CreateInvoiceFromOrderInput>;

// ---- Outputs ----

export const InvoiceLineOutput = z.object({
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

export type InvoiceLineOutput = z.infer<typeof InvoiceLineOutput>;

export const InvoiceOutput = z.object({
  id: z.string().uuid(),
  invoiceNo: z.string(),
  status: SalesInvoiceStatus,
  partnerId: z.string().uuid(),
  currency: z.string(),
  sourceOrderId: z.string().uuid().nullable().optional(),
  subtotal: z.string(), // Money string
  total: z.string(), // Money string (equals subtotal for now; tax later)
  notes: z.string().nullable().optional(),

  // Status timestamps
  issuedAt: z.string().datetime().nullable().optional(),
  cancelledAt: z.string().datetime().nullable().optional(),

  // Audit timestamps
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),

  // Lines (included in detail view)
  lines: z.array(InvoiceLineOutput),
});

export type InvoiceOutput = z.infer<typeof InvoiceOutput>;

// Invoice list item (without lines for list view performance)
export const InvoiceListItemOutput = InvoiceOutput.omit({ lines: true });
export type InvoiceListItemOutput = z.infer<typeof InvoiceListItemOutput>;

export const InvoiceListOutput = z.object({
  items: z.array(InvoiceListItemOutput),
  nextCursor: z.string().nullable(),
});

export type InvoiceListOutput = z.infer<typeof InvoiceListOutput>;
