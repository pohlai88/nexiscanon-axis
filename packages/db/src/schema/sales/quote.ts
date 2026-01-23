/**
 * Sales Quote Table (B04)
 *
 * Non-binding commitment capturing customer requirements.
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
  type QuoteStatus,
  type AddressSnapshot,
  type SalesQuoteLine,
} from "@axis/registry/schemas";

export const salesQuotes = pgTable(
  "sales_quotes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Identity
    documentNumber: varchar("document_number", { length: 50 }).notNull(),

    // Customer (reference by UUID, not FK per B02)
    customerId: uuid("customer_id").notNull(),
    customerName: varchar("customer_name", { length: 255 }).notNull(),

    // Addresses (snapshot)
    billingAddress: jsonb("billing_address").notNull().$type<AddressSnapshot>(),
    shippingAddress: jsonb("shipping_address").$type<AddressSnapshot>(),

    // Status
    status: varchar("status", { length: 20 })
      .notNull()
      .default("draft")
      .$type<QuoteStatus>(),
    validUntil: timestamp("valid_until", { withTimezone: true }).notNull(),

    // Pricing
    priceListId: uuid("price_list_id"),
    currency: varchar("currency", { length: 3 }).notNull(),

    // Lines (embedded JSON for simplicity; can be normalized later)
    lines: jsonb("lines").notNull().$type<SalesQuoteLine[]>(),

    // Totals (decimal as numeric for precision)
    subtotal: numeric("subtotal", { precision: 18, scale: 4 }).notNull(),
    discountTotal: numeric("discount_total", { precision: 18, scale: 4 })
      .notNull()
      .default("0"),
    taxTotal: numeric("tax_total", { precision: 18, scale: 4 })
      .notNull()
      .default("0"),
    grandTotal: numeric("grand_total", { precision: 18, scale: 4 }).notNull(),

    // Terms
    paymentTermId: uuid("payment_term_id"),
    notes: text("notes"),
    termsAndConditions: text("terms_and_conditions"),

    // Conversion tracking
    convertedToOrderIds: jsonb("converted_to_order_ids").$type<string[]>(),

    // Audit
    createdBy: uuid("created_by").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedBy: uuid("updated_by"),
    updatedAt: timestamp("updated_at", { withTimezone: true }),

    // Version for optimistic locking
    version: integer("version").notNull().default(1),
  },
  (table) => [
    index("idx_sales_quotes_tenant").on(table.tenantId),
    index("idx_sales_quotes_customer").on(table.tenantId, table.customerId),
    index("idx_sales_quotes_status").on(table.tenantId, table.status),
    index("idx_sales_quotes_doc_number").on(
      table.tenantId,
      table.documentNumber
    ),
  ]
);

export const salesQuotesRelations = relations(salesQuotes, ({ one }) => ({
  tenant: one(tenants, {
    fields: [salesQuotes.tenantId],
    references: [tenants.id],
  }),
}));

export type SalesQuoteRow = typeof salesQuotes.$inferSelect;
export type NewSalesQuoteRow = typeof salesQuotes.$inferInsert;
