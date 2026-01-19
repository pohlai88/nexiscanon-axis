// packages/validation/src/erp/sales/order.ts
// Sales Order Zod Contracts (SSOT)
//
// Validation schemas for sales orders following Phase 2.1 patterns:
// - Money as string (converted to cents in service)
// - Qty as decimal string (converted to numeric in service)
// - Immutable business keys
// - List envelope: { items, nextCursor }

import { z } from "zod";
import { MoneyString, QtyString, normalizeSearch } from "./quote";

// ---- Status Enum ----

export const SalesOrderStatus = z.enum(["DRAFT", "CONFIRMED", "CANCELLED"]);
export type SalesOrderStatus = z.infer<typeof SalesOrderStatus>;

// ---- Create Input ----

export const OrderCreateInput = z.object({
  partnerId: z.string().uuid("Partner ID must be a valid UUID"),
  currency: z
    .string()
    .min(3, "Currency code must be at least 3 characters")
    .max(8, "Currency code must be at most 8 characters")
    .toUpperCase(), // Normalize to uppercase (USD, VND, etc.)
  notes: z.string().max(5000, "Notes must be at most 5000 characters").nullable().optional(),
});

export type OrderCreateInput = z.infer<typeof OrderCreateInput>;

// ---- Update Input (DRAFT only) ----

export const OrderUpdateInput = z.object({
  partnerId: z.string().uuid("Partner ID must be a valid UUID").optional(),
  currency: z
    .string()
    .min(3, "Currency code must be at least 3 characters")
    .max(8, "Currency code must be at most 8 characters")
    .toUpperCase()
    .optional(),
  notes: z.string().max(5000, "Notes must be at most 5000 characters").nullable().optional(),
});

export type OrderUpdateInput = z.infer<typeof OrderUpdateInput>;

// ---- Order Line Input ----

export const OrderLineUpsertInput = z.object({
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

export type OrderLineUpsertInput = z.infer<typeof OrderLineUpsertInput>;

// ---- List Query ----

export const OrderListQuery = z.object({
  q: z
    .string()
    .min(1, "Search query must not be empty")
    .max(200, "Search query must be at most 200 characters")
    .transform(normalizeSearch)
    .optional(),
  status: z
    .array(SalesOrderStatus)
    .min(1, "At least one status required when filtering by status")
    .optional(),
  partnerId: z.string().uuid("Partner ID must be a valid UUID").optional(),
  cursor: z.string().min(1, "Cursor must not be empty").optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type OrderListQuery = z.infer<typeof OrderListQuery>;

// ---- Convert Quote to Order Input ----

export const ConvertQuoteToOrderInput = z.object({
  // Empty body - quoteId comes from URL params
  // This schema exists for consistency and future extensibility
});

export type ConvertQuoteToOrderInput = z.infer<typeof ConvertQuoteToOrderInput>;

// ---- Outputs ----

export const OrderLineOutput = z.object({
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

export type OrderLineOutput = z.infer<typeof OrderLineOutput>;

export const OrderOutput = z.object({
  id: z.string().uuid(),
  orderNo: z.string(),
  status: SalesOrderStatus,
  partnerId: z.string().uuid(),
  currency: z.string(),
  sourceQuoteId: z.string().uuid().nullable().optional(),
  total: z.string(), // Money string
  notes: z.string().nullable().optional(),

  // Status timestamps
  confirmedAt: z.string().datetime().nullable().optional(),
  cancelledAt: z.string().datetime().nullable().optional(),

  // Audit timestamps
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),

  // Lines (included in detail view)
  lines: z.array(OrderLineOutput),
});

export type OrderOutput = z.infer<typeof OrderOutput>;

// Order list item (without lines for list view performance)
export const OrderListItemOutput = OrderOutput.omit({ lines: true });
export type OrderListItemOutput = z.infer<typeof OrderListItemOutput>;

export const OrderListOutput = z.object({
  items: z.array(OrderListItemOutput),
  nextCursor: z.string().nullable(),
});

export type OrderListOutput = z.infer<typeof OrderListOutput>;
