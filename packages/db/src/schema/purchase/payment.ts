/**
 * Purchase Payment Table (B05)
 *
 * Records cash/bank payment to supplier.
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
  type PurchasePaymentStatus,
  type PurchasePaymentMethod,
  type PurchasePaymentAllocation,
} from "@axis/registry/schemas";

export const purchasePayments = pgTable(
  "purchase_payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Identity
    documentNumber: varchar("document_number", { length: 50 }).notNull(),

    // Supplier (reference by UUID, not FK per B02)
    supplierId: uuid("supplier_id").notNull(),
    supplierName: varchar("supplier_name", { length: 255 }).notNull(),

    // Payment details
    status: varchar("status", { length: 20 })
      .notNull()
      .default("draft")
      .$type<PurchasePaymentStatus>(),
    paymentDate: timestamp("payment_date", { withTimezone: true }).notNull(),
    paymentMethod: varchar("payment_method", { length: 20 })
      .notNull()
      .$type<PurchasePaymentMethod>(),

    // Amounts
    currency: varchar("currency", { length: 3 }).notNull(),
    exchangeRate: numeric("exchange_rate", { precision: 12, scale: 6 })
      .notNull()
      .default("1"),
    amount: numeric("amount", { precision: 18, scale: 4 }).notNull(),

    // Bank/Cash account (reference by UUID, not FK per B02)
    bankAccountId: uuid("bank_account_id").notNull(),
    bankAccountName: varchar("bank_account_name", { length: 255 }).notNull(),

    // Reference
    referenceNumber: varchar("reference_number", { length: 100 }),
    checkNumber: varchar("check_number", { length: 50 }),

    // Allocation to bills
    allocations: jsonb("allocations")
      .notNull()
      .$type<PurchasePaymentAllocation[]>(),

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
    approvedBy: uuid("approved_by"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),

    // Version
    version: integer("version").notNull().default(1),
  },
  (table) => [
    index("idx_purchase_payments_tenant").on(table.tenantId),
    index("idx_purchase_payments_supplier").on(
      table.tenantId,
      table.supplierId
    ),
    index("idx_purchase_payments_status").on(table.tenantId, table.status),
    index("idx_purchase_payments_doc_number").on(
      table.tenantId,
      table.documentNumber
    ),
    index("idx_purchase_payments_payment_date").on(
      table.tenantId,
      table.paymentDate
    ),
  ]
);

export const purchasePaymentsRelations = relations(
  purchasePayments,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [purchasePayments.tenantId],
      references: [tenants.id],
    }),
  })
);

export type PurchasePaymentRow = typeof purchasePayments.$inferSelect;
export type NewPurchasePaymentRow = typeof purchasePayments.$inferInsert;
