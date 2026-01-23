/**
 * Sales Order Table (B04)
 *
 * Binding commitment driving delivery and invoicing.
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
  type OrderStatus,
  type AddressSnapshot,
  type SalesOrderLine,
} from "@axis/registry/schemas";

export const salesOrders = pgTable(
  "sales_orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Identity
    documentNumber: varchar("document_number", { length: 50 }).notNull(),

    // Source
    sourceQuoteId: uuid("source_quote_id"),

    // Customer (reference by UUID, not FK per B02)
    customerId: uuid("customer_id").notNull(),
    customerName: varchar("customer_name", { length: 255 }).notNull(),
    customerPO: varchar("customer_po", { length: 100 }),

    // Addresses (snapshot)
    billingAddress: jsonb("billing_address").notNull().$type<AddressSnapshot>(),
    shippingAddress: jsonb("shipping_address")
      .notNull()
      .$type<AddressSnapshot>(),

    // Status
    status: varchar("status", { length: 30 })
      .notNull()
      .default("draft")
      .$type<OrderStatus>(),
    orderDate: timestamp("order_date", { withTimezone: true }).notNull(),
    requestedDeliveryDate: timestamp("requested_delivery_date", {
      withTimezone: true,
    }),
    promisedDeliveryDate: timestamp("promised_delivery_date", {
      withTimezone: true,
    }),

    // Pricing
    priceListId: uuid("price_list_id"),
    currency: varchar("currency", { length: 3 }).notNull(),

    // Lines
    lines: jsonb("lines").notNull().$type<SalesOrderLine[]>(),

    // Totals
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
    shippingMethod: varchar("shipping_method", { length: 100 }),
    notes: text("notes"),

    // Fulfillment tracking
    deliveryIds: jsonb("delivery_ids").$type<string[]>(),
    invoiceIds: jsonb("invoice_ids").$type<string[]>(),

    // Audit
    createdBy: uuid("created_by").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedBy: uuid("updated_by"),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    confirmedBy: uuid("confirmed_by"),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),

    // Version
    version: integer("version").notNull().default(1),
  },
  (table) => [
    index("idx_sales_orders_tenant").on(table.tenantId),
    index("idx_sales_orders_customer").on(table.tenantId, table.customerId),
    index("idx_sales_orders_status").on(table.tenantId, table.status),
    index("idx_sales_orders_doc_number").on(
      table.tenantId,
      table.documentNumber
    ),
    index("idx_sales_orders_order_date").on(table.tenantId, table.orderDate),
  ]
);

export const salesOrdersRelations = relations(salesOrders, ({ one }) => ({
  tenant: one(tenants, {
    fields: [salesOrders.tenantId],
    references: [tenants.id],
  }),
}));

export type SalesOrderRow = typeof salesOrders.$inferSelect;
export type NewSalesOrderRow = typeof salesOrders.$inferInsert;
