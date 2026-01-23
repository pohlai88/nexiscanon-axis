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
import { salesQuotes } from "./quote";

/**
 * Order status values.
 */
export const ORDER_STATUS = [
  "pending",
  "confirmed",
  "in_progress",
  "delivered",
  "invoiced",
  "cancelled",
] as const;
export type OrderStatus = (typeof ORDER_STATUS)[number];

/**
 * Sales order line item structure.
 */
export interface SalesOrderLineItem {
  description: string;
  quantity: number;
  unit_price: string; // String for decimal precision
  tax_rate?: string;
  amount: string;
  product_id?: string;
}

/** @deprecated Use SalesOrderLineItem instead */
export type OrderLineItem = SalesOrderLineItem;

/**
 * Sales delivery address structure.
 */
export interface SalesDeliveryAddress {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
}

/** @deprecated Use SalesDeliveryAddress instead */
export type DeliveryAddress = SalesDeliveryAddress;

/**
 * Sales Orders table.
 * 
 * Second step in sales cycle: Quote → Order → Invoice
 */
export const salesOrders = pgTable(
  "sales_orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    /** Tenant isolation */
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    /** Order details */
    orderNumber: varchar("order_number", { length: 50 }).notNull(),
    orderDate: timestamp("order_date", { withTimezone: true }).notNull(),
    expectedDeliveryDate: timestamp("expected_delivery_date", { withTimezone: true }),

    /** Customer reference */
    customerId: uuid("customer_id").references(() => customers.id, { onDelete: "restrict" }),
    customerName: varchar("customer_name", { length: 255 }).notNull(),
    customerEmail: varchar("customer_email", { length: 255 }),

    /** Source tracking */
    quoteId: uuid("quote_id").references(() => salesQuotes.id),

    /** Status & workflow */
    status: varchar("status", { length: 20 })
      .notNull()
      .default("pending")
      .$type<OrderStatus>(),

    /** Financial */
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    subtotal: numeric("subtotal", { precision: 19, scale: 4 }).notNull(),
    taxTotal: numeric("tax_total", { precision: 19, scale: 4 }).notNull().default("0"),
    totalAmount: numeric("total_amount", { precision: 19, scale: 4 }).notNull(),

    /** Line items (JSONB array) */
    lineItems: jsonb("line_items").notNull().$type<SalesOrderLineItem[]>(),

    /** Delivery tracking */
    deliveryAddress: jsonb("delivery_address").$type<SalesDeliveryAddress>(),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),

    /** Invoice tracking */
    invoicedAt: timestamp("invoiced_at", { withTimezone: true }),
    invoiceId: uuid("invoice_id"),

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
    index("idx_sales_orders_tenant").on(table.tenantId),
    index("idx_sales_orders_customer").on(table.tenantId, table.customerId),
    index("idx_sales_orders_status").on(table.tenantId, table.status),
    index("idx_sales_orders_quote").on(table.quoteId),
    uniqueIndex("sales_orders_tenant_number_idx").on(table.tenantId, table.orderNumber),
  ]
);

/**
 * Sales Orders relations.
 */
export const salesOrdersRelations = relations(salesOrders, ({ one }) => ({
  tenant: one(tenants, {
    fields: [salesOrders.tenantId],
    references: [tenants.id],
  }),
  quote: one(salesQuotes, {
    fields: [salesOrders.quoteId],
    references: [salesQuotes.id],
  }),
  creator: one(users, {
    fields: [salesOrders.createdBy],
    references: [users.id],
    relationName: "order_creator",
  }),
  modifier: one(users, {
    fields: [salesOrders.modifiedBy],
    references: [users.id],
    relationName: "order_modifier",
  }),
}));

/**
 * TypeScript types inferred from schema.
 */
export type SalesOrder = typeof salesOrders.$inferSelect;
export type NewSalesOrder = typeof salesOrders.$inferInsert;
