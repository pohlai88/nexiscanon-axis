/**
 * Sales Order Line Items Schema (F01 Compliant)
 * 
 * Individual line items for sales orders with product linkage.
 */

import { pgTable, uuid, integer, text, decimal, varchar, timestamp, jsonb, index, unique, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { tenants } from "../tenant";
import { salesOrders } from "./order";
import { products } from "../inventory/product";

/**
 * Sales Order Lines table.
 */
export const salesOrderLines = pgTable(
  "sales_order_lines",
  {
    // Identity
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Parent order
    orderId: uuid("order_id")
      .notNull()
      .references(() => salesOrders.id, { onDelete: "cascade" }),

    // Line details
    lineNumber: integer("line_number").notNull(),
    productId: uuid("product_id").references(() => products.id, { onDelete: "restrict" }),
    description: varchar("description", { length: 500 }).notNull(),

    // Quantities
    quantityOrdered: decimal("quantity_ordered", { precision: 15, scale: 4 }).notNull(),
    quantityFulfilled: decimal("quantity_fulfilled", { precision: 15, scale: 4 }).notNull().default("0"),
    quantityInvoiced: decimal("quantity_invoiced", { precision: 15, scale: 4 }).notNull().default("0"),
    unitOfMeasure: varchar("unit_of_measure", { length: 10 }).notNull().default("EA"),

    // Pricing
    unitPrice: decimal("unit_price", { precision: 15, scale: 4 }).notNull(),
    lineSubtotal: decimal("line_subtotal", { precision: 15, scale: 4 }).notNull(),
    discountPercent: decimal("discount_percent", { precision: 5, scale: 2 }),
    discountAmount: decimal("discount_amount", { precision: 15, scale: 4 }),
    taxRate: decimal("tax_rate", { precision: 5, scale: 4 }),
    taxAmount: decimal("tax_amount", { precision: 15, scale: 4 }),
    lineTotal: decimal("line_total", { precision: 15, scale: 4 }).notNull(),

    // Currency
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),

    // Metadata
    notes: text("notes"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),

    // Audit fields (F01 LAW F01-02)
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => ({
    // Indexes (F01 LAW F01-04)
    tenantIdIdx: index("idx_so_lines_tenant_id").on(table.tenantId),
    orderIdIdx: index("idx_so_lines_order_id").on(table.orderId),
    productIdIdx: index("idx_so_lines_product_id").on(table.productId),

    // Unique constraint: line_number per order
    orderLineNumberUniq: unique("uq_so_lines_order_line_number").on(
      table.orderId,
      table.lineNumber
    ),

    // Check constraints
    quantityOrderedCheck: check(
      "chk_so_line_quantity_ordered",
      sql`quantity_ordered > 0`
    ),
    quantityFulfilledCheck: check(
      "chk_so_line_quantity_fulfilled",
      sql`quantity_fulfilled >= 0`
    ),
    quantityInvoicedCheck: check(
      "chk_so_line_quantity_invoiced",
      sql`quantity_invoiced >= 0`
    ),
    quantitiesCheck: check(
      "chk_so_line_quantities",
      sql`quantity_fulfilled <= quantity_ordered AND quantity_invoiced <= quantity_fulfilled`
    ),
  })
);

/**
 * Type inference for sales order lines.
 */
export type SalesOrderLine = typeof salesOrderLines.$inferSelect;
export type NewSalesOrderLine = typeof salesOrderLines.$inferInsert;
