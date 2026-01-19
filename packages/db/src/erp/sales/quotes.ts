// packages/db/src/erp/sales/quotes.ts
// Sales Quotes - Quote headers for ERP sales module

import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { tenants } from "../../schema";
import { erpPartners } from "../base/partners";

/**
 * Sales Quote Status Enum
 * 
 * State machine:
 * - DRAFT → SENT → ACCEPTED
 * - DRAFT → CANCELLED
 * - SENT → CANCELLED
 * 
 * After ACCEPTED or CANCELLED, quote becomes immutable
 */
export const salesQuoteStatusEnum = ["DRAFT", "SENT", "ACCEPTED", "CANCELLED"] as const;
export type SalesQuoteStatus = (typeof salesQuoteStatusEnum)[number];

/**
 * Sales Quotes Table
 * 
 * Quote header containing commercial intent before order commitment.
 * Each quote has lines (see sales_quote_lines) with product/pricing details.
 */
export const salesQuotes = pgTable(
  "sales_quotes",
  {
    // Identity
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),

    // Document Number (from SequenceService using code "sales.quote")
    quoteNo: text("quote_no").notNull(),

    // Workflow Status
    status: text("status", { enum: salesQuoteStatusEnum }).notNull(),

    // Commercial Details
    partnerId: uuid("partner_id")
      .notNull()
      .references(() => erpPartners.id, { onDelete: "restrict" }),

    currency: text("currency").notNull(), // ISO code: USD, VND, etc.

    // Denormalized Total (computed from lines, stored for fast list views)
    totalCents: integer("total_cents").notNull().default(0),

    // Notes
    notes: text("notes"),

    // Status Timestamps (set when transitions happen)
    issuedAt: timestamp("issued_at", { withTimezone: true }),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),

    // Soft Delete (separate from status workflow)
    isActive: boolean("is_active").notNull().default(true),

    // Audit Fields
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    // Unique constraint: quote number must be unique per tenant
    unique("uq_sales_quotes_tenant_quote_no").on(t.tenantId, t.quoteNo),

    // Index for list views filtered by status and sorted by date
    index("idx_sales_quotes_tenant_status_created").on(
      t.tenantId,
      t.status,
      t.createdAt
    ),

    // Index for filtering by partner
    index("idx_sales_quotes_tenant_partner").on(t.tenantId, t.partnerId),
  ]
);
