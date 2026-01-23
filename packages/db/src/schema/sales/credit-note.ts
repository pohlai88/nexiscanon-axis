/**
 * Sales Credit Note Table (B04)
 *
 * Handles returns, pricing adjustments, and refunds.
 */

import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  jsonb,
  integer,
  numeric,
  text,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";
import { salesInvoices } from "./invoice";
import {
  type CreditNoteReason,
  type CreditNoteLine,
} from "@axis/registry/schemas";

export const salesCreditNotes = pgTable(
  "sales_credit_notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Identity
    documentNumber: varchar("document_number", { length: 50 }).notNull(),

    // Source invoice (same domain, FK allowed)
    sourceInvoiceId: uuid("source_invoice_id")
      .notNull()
      .references(() => salesInvoices.id),
    sourceInvoiceNumber: varchar("source_invoice_number", {
      length: 50,
    }).notNull(),

    // Customer (reference by UUID, not FK per B02)
    customerId: uuid("customer_id").notNull(),
    customerName: varchar("customer_name", { length: 255 }).notNull(),

    // Credit Note details
    creditNoteDate: timestamp("credit_note_date", {
      withTimezone: true,
    }).notNull(),
    reason: varchar("reason", { length: 30 }).notNull().$type<CreditNoteReason>(),
    reasonDescription: text("reason_description"),

    // Currency (must match invoice)
    currency: varchar("currency", { length: 3 }).notNull(),

    // Lines
    lines: jsonb("lines").notNull().$type<CreditNoteLine[]>(),

    // Totals
    subtotal: numeric("subtotal", { precision: 18, scale: 4 }).notNull(),
    taxTotal: numeric("tax_total", { precision: 18, scale: 4 })
      .notNull()
      .default("0"),
    grandTotal: numeric("grand_total", { precision: 18, scale: 4 }).notNull(),

    // Application
    applyToInvoice: boolean("apply_to_invoice").notNull().default(true),
    refundRequested: boolean("refund_requested").notNull().default(false),

    // Notes
    notes: text("notes"),

    // Posting reference (B01)
    postingBatchId: uuid("posting_batch_id"),

    // Audit
    createdBy: uuid("created_by").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedBy: uuid("updated_by"),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    postedBy: uuid("posted_by"),
    postedAt: timestamp("posted_at", { withTimezone: true }),

    // Version
    version: integer("version").notNull().default(1),
  },
  (table) => [
    index("idx_sales_credit_notes_tenant").on(table.tenantId),
    index("idx_sales_credit_notes_invoice").on(
      table.tenantId,
      table.sourceInvoiceId
    ),
    index("idx_sales_credit_notes_customer").on(
      table.tenantId,
      table.customerId
    ),
    index("idx_sales_credit_notes_doc_number").on(
      table.tenantId,
      table.documentNumber
    ),
  ]
);

export const salesCreditNotesRelations = relations(
  salesCreditNotes,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [salesCreditNotes.tenantId],
      references: [tenants.id],
    }),
    sourceInvoice: one(salesInvoices, {
      fields: [salesCreditNotes.sourceInvoiceId],
      references: [salesInvoices.id],
    }),
  })
);

export type SalesCreditNoteRow = typeof salesCreditNotes.$inferSelect;
export type NewSalesCreditNoteRow = typeof salesCreditNotes.$inferInsert;
