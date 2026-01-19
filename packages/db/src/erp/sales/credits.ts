// packages/db/src/erp/sales/credits.ts
// Sales Credit Notes - Invoice corrections and reversals

import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  timestamp,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { tenants } from "../../schema";
import { erpPartners } from "../base/partners";
import { erpProducts } from "../base/products";
import { erpUoms } from "../base/uoms";
import { salesInvoices } from "./invoices";

/**
 * Sales Credit Note Status Enum
 * 
 * State machine:
 * - DRAFT → ISSUED
 * - DRAFT → CANCELLED
 * - ISSUED → CANCELLED
 * 
 * After CANCELLED, credit note becomes immutable.
 */
export const salesCreditNoteStatusEnum = ["DRAFT", "ISSUED", "CANCELLED"] as const;
export type SalesCreditNoteStatus = (typeof salesCreditNoteStatusEnum)[number];

/**
 * Sales Credit Notes Table
 * 
 * Credit note header representing negative value adjustments to invoices.
 * Used for invoice corrections, returns, and reversals.
 * 
 * Accounting integrity:
 * - Credit notes represent negative value (stored as positive cents, interpreted by type)
 * - Multiple credits per invoice allowed (partial credits)
 * - Cap enforcement: SUM(issued credits) ≤ invoice total
 * 
 * Reversal tracking:
 * - sourceInvoiceId links back to originating invoice (nullable for manual credits)
 */
export const salesCreditNotes = pgTable(
  "sales_credit_notes",
  {
    // Identity
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),

    // Document Number (from SequenceService using code "sales.credit")
    creditNo: text("credit_no").notNull(),

    // Workflow Status
    status: text("status", { enum: salesCreditNoteStatusEnum }).notNull(),

    // Commercial Details
    partnerId: uuid("partner_id")
      .notNull()
      .references(() => erpPartners.id, { onDelete: "restrict" }),

    currency: text("currency").notNull(), // ISO code: USD, VND, etc.

    // Reversal Tracking (nullable for manual credits not tied to invoice)
    sourceInvoiceId: uuid("source_invoice_id").references(() => salesInvoices.id, {
      onDelete: "set null",
    }),

    // Business Rationale (optional human explanation for credit)
    reason: text("reason"),

    // Denormalized Totals (computed from lines, stored for fast list views)
    // Stored as positive values; interpretation as credit/negative done by type
    subtotalCents: integer("subtotal_cents").notNull().default(0),
    totalCents: integer("total_cents").notNull().default(0), // subtotal for now; tax later

    // Notes
    notes: text("notes"),

    // Status Timestamps (set when transitions happen)
    issuedAt: timestamp("issued_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),

    // Audit Fields
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    // Unique constraint: credit number must be unique per tenant
    unique("uq_sales_credit_notes_tenant_credit_no").on(t.tenantId, t.creditNo),

    // Index for list views filtered by status and sorted by date
    index("idx_sales_credit_notes_tenant_status_created").on(
      t.tenantId,
      t.status,
      t.createdAt
    ),

    // Index for filtering by partner
    index("idx_sales_credit_notes_tenant_partner").on(t.tenantId, t.partnerId),

    // Index for tracking invoice reversals
    index("idx_sales_credit_notes_tenant_source_invoice").on(
      t.tenantId,
      t.sourceInvoiceId
    ),
  ]
);

/**
 * Sales Credit Note Lines Table
 * 
 * Line items for credit notes with product/pricing details.
 * 
 * Accounting integrity:
 * - line_total_cents = qty × unit_price_cents
 * - SUM(lines.line_total_cents) = header.subtotal_cents
 * - All amounts stored as positive; interpretation as credit done by type
 * 
 * Line management:
 * - Mutable only when credit note is DRAFT
 * - line_no must be unique per credit note
 * - Changes trigger header total recalculation (atomic)
 */
export const salesCreditNoteLines = pgTable(
  "sales_credit_note_lines",
  {
    // Identity
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),

    // Parent Relationship
    creditNoteId: uuid("credit_note_id")
      .notNull()
      .references(() => salesCreditNotes.id, { onDelete: "cascade" }),

    // Line Ordering (business key for line identification)
    lineNo: integer("line_no").notNull(),

    // Product Details (nullable: free-text lines allowed)
    productId: uuid("product_id").references(() => erpProducts.id, {
      onDelete: "set null",
    }),
    description: text("description").notNull(),

    // Quantity & UoM
    uomId: uuid("uom_id")
      .notNull()
      .references(() => erpUoms.id, { onDelete: "restrict" }),
    qty: numeric("qty", { precision: 18, scale: 6 }).notNull(),

    // Pricing (stored as positive cents)
    unitPriceCents: integer("unit_price_cents").notNull(),
    lineTotalCents: integer("line_total_cents").notNull(), // qty × unit_price_cents

    // Audit Fields
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    // Unique constraint: line_no must be unique per credit note
    unique("uq_sales_credit_note_lines_tenant_credit_line").on(
      t.tenantId,
      t.creditNoteId,
      t.lineNo
    ),

    // Index for querying lines by credit note
    index("idx_sales_credit_note_lines_tenant_credit").on(
      t.tenantId,
      t.creditNoteId
    ),
  ]
);
