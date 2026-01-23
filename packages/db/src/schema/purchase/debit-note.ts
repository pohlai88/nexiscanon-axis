/**
 * Purchase Debit Note Table (B05)
 *
 * Handles returns, pricing adjustments, and claims.
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
import { purchaseBills } from "./bill";
import {
  type DebitNoteReason,
  type DebitNoteLine,
} from "@axis/registry/schemas";

export const purchaseDebitNotes = pgTable(
  "purchase_debit_notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Identity
    documentNumber: varchar("document_number", { length: 50 }).notNull(),

    // Source bill (same domain, FK allowed)
    sourceBillId: uuid("source_bill_id")
      .notNull()
      .references(() => purchaseBills.id),
    sourceBillNumber: varchar("source_bill_number", { length: 50 }).notNull(),

    // Supplier (reference by UUID, not FK per B02)
    supplierId: uuid("supplier_id").notNull(),
    supplierName: varchar("supplier_name", { length: 255 }).notNull(),

    // Debit Note details
    debitNoteDate: timestamp("debit_note_date", {
      withTimezone: true,
    }).notNull(),
    reason: varchar("reason", { length: 30 }).notNull().$type<DebitNoteReason>(),
    reasonDescription: text("reason_description"),

    // Currency (must match bill)
    currency: varchar("currency", { length: 3 }).notNull(),

    // Lines
    lines: jsonb("lines").notNull().$type<DebitNoteLine[]>(),

    // Totals
    subtotal: numeric("subtotal", { precision: 18, scale: 4 }).notNull(),
    taxTotal: numeric("tax_total", { precision: 18, scale: 4 })
      .notNull()
      .default("0"),
    grandTotal: numeric("grand_total", { precision: 18, scale: 4 }).notNull(),

    // Application
    applyToBill: boolean("apply_to_bill").notNull().default(true),
    refundRequested: boolean("refund_requested").notNull().default(false),

    // Return goods
    returnReceiptId: uuid("return_receipt_id"),

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
    index("idx_purchase_debit_notes_tenant").on(table.tenantId),
    index("idx_purchase_debit_notes_bill").on(
      table.tenantId,
      table.sourceBillId
    ),
    index("idx_purchase_debit_notes_supplier").on(
      table.tenantId,
      table.supplierId
    ),
    index("idx_purchase_debit_notes_doc_number").on(
      table.tenantId,
      table.documentNumber
    ),
  ]
);

export const purchaseDebitNotesRelations = relations(
  purchaseDebitNotes,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [purchaseDebitNotes.tenantId],
      references: [tenants.id],
    }),
    sourceBill: one(purchaseBills, {
      fields: [purchaseDebitNotes.sourceBillId],
      references: [purchaseBills.id],
    }),
  })
);

export type PurchaseDebitNoteRow = typeof purchaseDebitNotes.$inferSelect;
export type NewPurchaseDebitNoteRow = typeof purchaseDebitNotes.$inferInsert;
