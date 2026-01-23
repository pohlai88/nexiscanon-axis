/**
 * Purchase Bill Table (B05)
 *
 * Records supplier's invoice, creates AP entry.
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
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";
import {
  type BillStatus,
  type MatchStatus,
  type AddressSnapshot,
  type PurchaseBillLine,
  type MatchException,
} from "@axis/registry/schemas";

export const purchaseBills = pgTable(
  "purchase_bills",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Identity
    documentNumber: varchar("document_number", { length: 50 }).notNull(),
    supplierInvoiceNumber: varchar("supplier_invoice_number", {
      length: 100,
    }).notNull(),

    // Source
    sourcePoIds: jsonb("source_po_ids").$type<string[]>(),
    sourceReceiptIds: jsonb("source_receipt_ids").$type<string[]>(),

    // Supplier (reference by UUID, not FK per B02)
    supplierId: uuid("supplier_id").notNull(),
    supplierName: varchar("supplier_name", { length: 255 }).notNull(),
    supplierTaxId: varchar("supplier_tax_id", { length: 50 }),

    // Addresses
    supplierAddress: jsonb("supplier_address")
      .notNull()
      .$type<AddressSnapshot>(),

    // Status
    status: varchar("status", { length: 20 })
      .notNull()
      .default("draft")
      .$type<BillStatus>(),
    billDate: timestamp("bill_date", { withTimezone: true }).notNull(),
    receivedDate: timestamp("received_date", { withTimezone: true }).notNull(),
    dueDate: timestamp("due_date", { withTimezone: true }).notNull(),

    // Pricing
    currency: varchar("currency", { length: 3 }).notNull(),
    exchangeRate: numeric("exchange_rate", { precision: 12, scale: 6 })
      .notNull()
      .default("1"),

    // Lines
    lines: jsonb("lines").notNull().$type<PurchaseBillLine[]>(),

    // Totals
    subtotal: numeric("subtotal", { precision: 18, scale: 4 }).notNull(),
    discountTotal: numeric("discount_total", { precision: 18, scale: 4 })
      .notNull()
      .default("0"),
    taxableAmount: numeric("taxable_amount", { precision: 18, scale: 4 })
      .notNull()
      .default("0"),
    taxTotal: numeric("tax_total", { precision: 18, scale: 4 })
      .notNull()
      .default("0"),
    grandTotal: numeric("grand_total", { precision: 18, scale: 4 }).notNull(),

    // Payment tracking
    amountPaid: numeric("amount_paid", { precision: 18, scale: 4 })
      .notNull()
      .default("0"),
    amountDue: numeric("amount_due", { precision: 18, scale: 4 }).notNull(),

    // Terms
    paymentTermId: uuid("payment_term_id"),

    // Matching status
    matchStatus: varchar("match_status", { length: 20 })
      .notNull()
      .default("unmatched")
      .$type<MatchStatus>(),
    matchExceptions: jsonb("match_exceptions").$type<MatchException[]>(),

    // Notes
    notes: text("notes"),

    // Accounting references (UUID, not FK per B02)
    apAccountId: uuid("ap_account_id").notNull(),

    // Payment records
    paymentIds: jsonb("payment_ids").$type<string[]>(),

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
    index("idx_purchase_bills_tenant").on(table.tenantId),
    index("idx_purchase_bills_supplier").on(table.tenantId, table.supplierId),
    index("idx_purchase_bills_status").on(table.tenantId, table.status),
    index("idx_purchase_bills_doc_number").on(
      table.tenantId,
      table.documentNumber
    ),
    index("idx_purchase_bills_due_date").on(table.tenantId, table.dueDate),
    index("idx_purchase_bills_bill_date").on(table.tenantId, table.billDate),
  ]
);

export const purchaseBillsRelations = relations(purchaseBills, ({ one }) => ({
  tenant: one(tenants, {
    fields: [purchaseBills.tenantId],
    references: [tenants.id],
  }),
}));

export type PurchaseBillRow = typeof purchaseBills.$inferSelect;
export type NewPurchaseBillRow = typeof purchaseBills.$inferInsert;
