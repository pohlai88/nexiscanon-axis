/**
 * Sales Invoice Table (B04)
 *
 * Records revenue recognition and creates AR entry.
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
  type InvoiceStatus,
  type AddressSnapshot,
  type SalesInvoiceLine,
} from "@axis/registry/schemas";

export const salesInvoices = pgTable(
  "sales_invoices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Identity
    documentNumber: varchar("document_number", { length: 50 }).notNull(),

    // Source (references by UUID)
    sourceOrderId: uuid("source_order_id"),
    sourceOrderNumber: varchar("source_order_number", { length: 50 }),
    sourceDeliveryIds: jsonb("source_delivery_ids").$type<string[]>(),

    // Customer (reference by UUID, not FK per B02)
    customerId: uuid("customer_id").notNull(),
    customerName: varchar("customer_name", { length: 255 }).notNull(),
    customerTaxId: varchar("customer_tax_id", { length: 50 }),

    // Addresses (snapshot)
    billingAddress: jsonb("billing_address").notNull().$type<AddressSnapshot>(),

    // Status
    status: varchar("status", { length: 20 })
      .notNull()
      .default("draft")
      .$type<InvoiceStatus>(),
    invoiceDate: timestamp("invoice_date", { withTimezone: true }).notNull(),
    dueDate: timestamp("due_date", { withTimezone: true }).notNull(),

    // Pricing
    currency: varchar("currency", { length: 3 }).notNull(),
    exchangeRate: numeric("exchange_rate", { precision: 12, scale: 6 })
      .notNull()
      .default("1"),

    // Lines
    lines: jsonb("lines").notNull().$type<SalesInvoiceLine[]>(),

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
    paymentTermDays: integer("payment_term_days"),

    // Notes
    notes: text("notes"),

    // Accounting references (UUID, not FK per B02)
    arAccountId: uuid("ar_account_id").notNull(),
    revenueAccountId: uuid("revenue_account_id").notNull(),

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
    index("idx_sales_invoices_tenant").on(table.tenantId),
    index("idx_sales_invoices_customer").on(table.tenantId, table.customerId),
    index("idx_sales_invoices_status").on(table.tenantId, table.status),
    index("idx_sales_invoices_doc_number").on(
      table.tenantId,
      table.documentNumber
    ),
    index("idx_sales_invoices_due_date").on(table.tenantId, table.dueDate),
    index("idx_sales_invoices_invoice_date").on(
      table.tenantId,
      table.invoiceDate
    ),
  ]
);

export const salesInvoicesRelations = relations(salesInvoices, ({ one }) => ({
  tenant: one(tenants, {
    fields: [salesInvoices.tenantId],
    references: [tenants.id],
  }),
}));

export type SalesInvoiceRow = typeof salesInvoices.$inferSelect;
export type NewSalesInvoiceRow = typeof salesInvoices.$inferInsert;
