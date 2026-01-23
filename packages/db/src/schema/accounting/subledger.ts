/**
 * Subledger Tables (B07)
 *
 * AR and AP subledger entries.
 */

import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  numeric,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";
import { journalEntries } from "./journal";
import { glPostingBatches } from "./posting";

// ============================================================================
// AR Subledger Table
// ============================================================================

export const arSubledger = pgTable(
  "ar_subledger",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Party (reference by UUID, not FK per B02)
    customerId: uuid("customer_id").notNull(),
    customerName: varchar("customer_name", { length: 255 }).notNull(),

    // Reference (cross-domain reference by UUID, not FK per B02)
    documentType: varchar("document_type", { length: 50 }).notNull(),
    documentId: uuid("document_id").notNull(),
    documentNumber: varchar("document_number", { length: 50 }).notNull(),
    documentDate: timestamp("document_date", { withTimezone: true }).notNull(),

    // Amounts
    debitAmount: numeric("debit_amount", { precision: 18, scale: 4 }).notNull(),
    creditAmount: numeric("credit_amount", { precision: 18, scale: 4 }).notNull(),

    // Currency
    currency: varchar("currency", { length: 3 }).notNull(),
    baseCurrencyAmount: numeric("base_currency_amount", {
      precision: 18,
      scale: 4,
    }).notNull(),

    // GL link (same domain, FK allowed)
    journalId: uuid("journal_id")
      .notNull()
      .references(() => journalEntries.id),
    postingBatchId: uuid("posting_batch_id")
      .notNull()
      .references(() => glPostingBatches.id),

    // Dates
    effectiveDate: timestamp("effective_date", { withTimezone: true }).notNull(),
    dueDate: timestamp("due_date", { withTimezone: true }),

    // Payment terms (reference by UUID, not FK per B02)
    paymentTermId: uuid("payment_term_id"),

    // Reconciliation
    isReconciled: boolean("is_reconciled").notNull().default(false),
    reconciledDocumentId: uuid("reconciled_document_id"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_ar_subledger_tenant").on(table.tenantId),
    index("idx_ar_subledger_customer").on(table.tenantId, table.customerId),
    index("idx_ar_subledger_document").on(
      table.tenantId,
      table.documentType,
      table.documentId
    ),
    index("idx_ar_subledger_effective").on(table.tenantId, table.effectiveDate),
    index("idx_ar_subledger_due").on(table.tenantId, table.dueDate),
    index("idx_ar_subledger_reconciled").on(table.tenantId, table.isReconciled),
  ]
);

export const arSubledgerRelations = relations(arSubledger, ({ one }) => ({
  tenant: one(tenants, {
    fields: [arSubledger.tenantId],
    references: [tenants.id],
  }),
  journal: one(journalEntries, {
    fields: [arSubledger.journalId],
    references: [journalEntries.id],
  }),
  postingBatch: one(glPostingBatches, {
    fields: [arSubledger.postingBatchId],
    references: [glPostingBatches.id],
  }),
}));

export type ArSubledgerRow = typeof arSubledger.$inferSelect;
export type NewArSubledgerRow = typeof arSubledger.$inferInsert;

// ============================================================================
// AP Subledger Table
// ============================================================================

export const apSubledger = pgTable(
  "ap_subledger",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Party (reference by UUID, not FK per B02)
    supplierId: uuid("supplier_id").notNull(),
    supplierName: varchar("supplier_name", { length: 255 }).notNull(),

    // Reference (cross-domain reference by UUID, not FK per B02)
    documentType: varchar("document_type", { length: 50 }).notNull(),
    documentId: uuid("document_id").notNull(),
    documentNumber: varchar("document_number", { length: 50 }).notNull(),
    supplierInvoiceNumber: varchar("supplier_invoice_number", { length: 100 }),
    documentDate: timestamp("document_date", { withTimezone: true }).notNull(),

    // Amounts
    debitAmount: numeric("debit_amount", { precision: 18, scale: 4 }).notNull(),
    creditAmount: numeric("credit_amount", { precision: 18, scale: 4 }).notNull(),

    // Currency
    currency: varchar("currency", { length: 3 }).notNull(),
    baseCurrencyAmount: numeric("base_currency_amount", {
      precision: 18,
      scale: 4,
    }).notNull(),

    // GL link (same domain, FK allowed)
    journalId: uuid("journal_id")
      .notNull()
      .references(() => journalEntries.id),
    postingBatchId: uuid("posting_batch_id")
      .notNull()
      .references(() => glPostingBatches.id),

    // Dates
    effectiveDate: timestamp("effective_date", { withTimezone: true }).notNull(),
    dueDate: timestamp("due_date", { withTimezone: true }),

    // Reconciliation
    isReconciled: boolean("is_reconciled").notNull().default(false),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_ap_subledger_tenant").on(table.tenantId),
    index("idx_ap_subledger_supplier").on(table.tenantId, table.supplierId),
    index("idx_ap_subledger_document").on(
      table.tenantId,
      table.documentType,
      table.documentId
    ),
    index("idx_ap_subledger_effective").on(table.tenantId, table.effectiveDate),
    index("idx_ap_subledger_due").on(table.tenantId, table.dueDate),
    index("idx_ap_subledger_reconciled").on(table.tenantId, table.isReconciled),
  ]
);

export const apSubledgerRelations = relations(apSubledger, ({ one }) => ({
  tenant: one(tenants, {
    fields: [apSubledger.tenantId],
    references: [tenants.id],
  }),
  journal: one(journalEntries, {
    fields: [apSubledger.journalId],
    references: [journalEntries.id],
  }),
  postingBatch: one(glPostingBatches, {
    fields: [apSubledger.postingBatchId],
    references: [glPostingBatches.id],
  }),
}));

export type ApSubledgerRow = typeof apSubledger.$inferSelect;
export type NewApSubledgerRow = typeof apSubledger.$inferInsert;
