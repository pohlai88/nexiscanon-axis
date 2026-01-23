/**
 * Purchase Order Line Items Schema (F01 Compliant)
 * 
 * Individual line items for purchase orders with product linkage.
 */

import { pgTable, uuid, integer, text, decimal, varchar, timestamp, jsonb, index, unique, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { tenants } from "../tenant";
import { purchaseOrders } from "./order";
import { products } from "../inventory/product";

/**
 * Purchase Order Lines table.
 */
export const purchaseOrderLines = pgTable(
  "purchase_order_lines",
  {
    // Identity
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Parent order
    orderId: uuid("order_id")
      .notNull()
      .references(() => purchaseOrders.id, { onDelete: "cascade" }),

    // Line details
    lineNumber: integer("line_number").notNull(),
    productId: uuid("product_id").references(() => products.id, { onDelete: "restrict" }),
    description: varchar("description", { length: 500 }).notNull(),

    // Quantities
    quantityOrdered: decimal("quantity_ordered", { precision: 15, scale: 4 }).notNull(),
    quantityReceived: decimal("quantity_received", { precision: 15, scale: 4 }).notNull().default("0"),
    unitOfMeasure: varchar("unit_of_measure", { length: 10 }).notNull().default("EA"),

    // Pricing
    unitPrice: decimal("unit_price", { precision: 15, scale: 4 }).notNull(),
    lineSubtotal: decimal("line_subtotal", { precision: 15, scale: 4 }).notNull(),
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
    tenantIdIdx: index("idx_po_lines_tenant_id").on(table.tenantId),
    orderIdIdx: index("idx_po_lines_order_id").on(table.orderId),
    productIdIdx: index("idx_po_lines_product_id").on(table.productId),

    // Unique constraint: line_number per order
    orderLineNumberUniq: unique("uq_po_lines_order_line_number").on(
      table.orderId,
      table.lineNumber
    ),

    // Check constraints
    quantityOrderedCheck: check(
      "chk_po_line_quantity_ordered",
      sql`quantity_ordered > 0`
    ),
    quantityReceivedCheck: check(
      "chk_po_line_quantity_received",
      sql`quantity_received >= 0`
    ),
    quantitiesCheck: check(
      "chk_po_line_quantities",
      sql`quantity_received <= quantity_ordered`
    ),
  })
);

/**
 * Type inference for purchase order lines.
 */
export type PurchaseOrderLine = typeof purchaseOrderLines.$inferSelect;
export type NewPurchaseOrderLine = typeof purchaseOrderLines.$inferInsert;
