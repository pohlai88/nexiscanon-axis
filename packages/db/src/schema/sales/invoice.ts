import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  numeric,
  jsonb,
  text,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";
import { users } from "../user";
import { customers } from "../customer";
import { salesOrders } from "./order";
import { documents } from "../document";

/**
 * Invoice status values.
 */
export const INVOICE_STATUS = [
  "draft",
  "sent",
  "viewed",
  "paid",
  "partially_paid",
  "overdue",
  "cancelled",
] as const;
export type InvoiceStatus = (typeof INVOICE_STATUS)[number];

/**
 * Invoice line item structure.
 */
export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unit_price: string; // String for decimal precision
  tax_rate?: string;
  amount: string;
  product_id?: string;
  account_code?: string; // For GL posting
}

/**
 * Sales Invoices table (Posting Spine Integration).
 * 
 * Final step in sales cycle: Quote → Order → Invoice → Posted
 * Integrates with B01 Posting Spine for GL posting.
 */
export const salesInvoices = pgTable(
  "sales_invoices",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    /** Tenant isolation */
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    /** Invoice details */
    invoiceNumber: varchar("invoice_number", { length: 50 }).notNull(),
    invoiceDate: timestamp("invoice_date", { withTimezone: true }).notNull(),
    dueDate: timestamp("due_date", { withTimezone: true }).notNull(),

    /** Customer reference */
    customerId: uuid("customer_id").references(() => customers.id, { onDelete: "restrict" }),
    customerName: varchar("customer_name", { length: 255 }).notNull(),
    customerEmail: varchar("customer_email", { length: 255 }),

    /** Source tracking */
    orderId: uuid("order_id").references(() => salesOrders.id),

    /** Status & workflow */
    status: varchar("status", { length: 20 })
      .notNull()
      .default("draft")
      .$type<InvoiceStatus>(),

    /** Financial */
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    subtotal: numeric("subtotal", { precision: 19, scale: 4 }).notNull(),
    taxTotal: numeric("tax_total", { precision: 19, scale: 4 }).notNull().default("0"),
    totalAmount: numeric("total_amount", { precision: 19, scale: 4 }).notNull(),
    amountPaid: numeric("amount_paid", { precision: 19, scale: 4 }).notNull().default("0"),
    amountDue: numeric("amount_due", { precision: 19, scale: 4 }).notNull(),

    /** Line items (JSONB array) */
    lineItems: jsonb("line_items").notNull().$type<InvoiceLineItem[]>(),

    /** B01 Integration: Link to posting spine document */
    documentId: uuid("document_id").references(() => documents.id),
    postedAt: timestamp("posted_at", { withTimezone: true }),

    /** Payment tracking */
    paymentTerms: varchar("payment_terms", { length: 50 }),
    lastPaymentDate: timestamp("last_payment_date", { withTimezone: true }),

    /** Metadata */
    notes: text("notes"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),

    /** Audit */
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
    modifiedBy: uuid("modified_by")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_sales_invoices_tenant").on(table.tenantId),
    index("idx_sales_invoices_customer").on(table.tenantId, table.customerId),
    index("idx_sales_invoices_status").on(table.tenantId, table.status),
    index("idx_sales_invoices_order").on(table.orderId),
    index("idx_sales_invoices_document").on(table.documentId),
    // Partial index for overdue invoices
    index("idx_sales_invoices_due").on(table.tenantId, table.dueDate),
    uniqueIndex("sales_invoices_tenant_number_idx").on(table.tenantId, table.invoiceNumber),
  ]
);

/**
 * Sales Invoices relations.
 */
export const salesInvoicesRelations = relations(salesInvoices, ({ one }) => ({
  tenant: one(tenants, {
    fields: [salesInvoices.tenantId],
    references: [tenants.id],
  }),
  order: one(salesOrders, {
    fields: [salesInvoices.orderId],
    references: [salesOrders.id],
  }),
  document: one(documents, {
    fields: [salesInvoices.documentId],
    references: [documents.id],
  }),
  creator: one(users, {
    fields: [salesInvoices.createdBy],
    references: [users.id],
    relationName: "invoice_creator",
  }),
  modifier: one(users, {
    fields: [salesInvoices.modifiedBy],
    references: [users.id],
    relationName: "invoice_modifier",
  }),
}));

/**
 * TypeScript types inferred from schema.
 */
export type SalesInvoice = typeof salesInvoices.$inferSelect;
export type NewSalesInvoice = typeof salesInvoices.$inferInsert;
