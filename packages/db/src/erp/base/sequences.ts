// packages/db/src/erp/base/sequences.ts
// ERP Sequences - document numbering generator

import { pgTable, uuid, text, bigint, integer, boolean, index, unique } from "drizzle-orm/pg-core";
import { tenants } from "../../schema";

/**
 * Document Sequences
 *
 * Generates unique document numbers for ERP entities (orders, invoices, etc.).
 * Supports yearly reset and padding.
 *
 * Example: "SO-2026-000001", "INV-2026-000042"
 */
export const erpSequences = pgTable(
  "erp_sequences",
  {
    // Identity
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),

    // Configuration
    sequenceKey: text("sequence_key").notNull(), // e.g., "SALES_ORDER", "INVOICE"
    prefix: text("prefix").notNull(), // e.g., "SO-", "INV-"
    nextValue: bigint("next_value", { mode: "number" }).notNull().default(1),
    padding: integer("padding").notNull().default(6), // number of digits (e.g., 6 = 000001)

    // Yearly reset
    yearReset: boolean("year_reset").notNull().default(true),
    currentYear: integer("current_year"), // NULL or YYYY
  },
  (table) => ({
    // Indexes
    tenantIdx: index("idx_erp_sequences_tenant").on(table.tenantId),

    // Unique constraints
    uniqueKey: unique("uq_erp_sequences_tenant_key").on(table.tenantId, table.sequenceKey),
  })
);

// ---- Type exports ----

export type ErpSequence = typeof erpSequences.$inferSelect;
export type NewErpSequence = typeof erpSequences.$inferInsert;

// ---- Sequence Keys ----

export const SEQUENCE_KEYS = {
  PARTNER: "PARTNER",
  PRODUCT: "PRODUCT",
  SALES_ORDER: "SALES_ORDER",
  PURCHASE_ORDER: "PURCHASE_ORDER",
  INVOICE: "INVOICE",
  STOCK_MOVE: "STOCK_MOVE",
} as const;

export type SequenceKey = (typeof SEQUENCE_KEYS)[keyof typeof SEQUENCE_KEYS];
