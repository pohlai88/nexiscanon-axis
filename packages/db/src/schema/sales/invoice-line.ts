/**
 * Sales Invoice Line Items Schema (F01 Compliant)
 * 
 * Individual line items for sales invoices with COGS tracking.
 */

import { pgTable, uuid, integer, decimal, varchar, timestamp, jsonb, index, unique, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { tenants } from "../tenant";
import { salesInvoices } from "./invoice";
import { salesOrderLines } from "./order-line";
import { products } from "../inventory/product";

/**
 * Invoice Lines table.
 */
export const invoiceLines = pgTable(
  "invoice_lines",
  {
    // Identity
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Parent invoice
    invoiceId: uuid("invoice_id")
      .notNull()
      .references(() => salesInvoices.id, { onDelete: "cascade" }),

    // Line details
    lineNumber: integer("line_number").notNull(),
    orderLineId: uuid("order_line_id").references(() => salesOrderLines.id),
    productId: uuid("product_id").references(() => products.id, { onDelete: "restrict" }),
    description: varchar("description", { length: 500 }).notNull(),

    // Quantities
    quantity: decimal("quantity", { precision: 15, scale: 4 }).notNull(),
    unitOfMeasure: varchar("unit_of_measure", { length: 10 }).notNull().default("EA"),

    // Pricing
    unitPrice: decimal("unit_price", { precision: 15, scale: 4 }).notNull(),
    lineSubtotal: decimal("line_subtotal", { precision: 15, scale: 4 }).notNull(),
    discountPercent: decimal("discount_percent", { precision: 5, scale: 2 }),
    discountAmount: decimal("discount_amount", { precision: 15, scale: 4 }),
    taxRate: decimal("tax_rate", { precision: 5, scale: 4 }),
    taxAmount: decimal("tax_amount", { precision: 15, scale: 4 }),
    lineTotal: decimal("line_total", { precision: 15, scale: 4 }).notNull(),

    // COGS tracking (from inventory movements)
    unitCost: decimal("unit_cost", { precision: 15, scale: 4 }), // Weighted average cost
    lineCogs: decimal("line_cogs", { precision: 15, scale: 4 }), // quantity * unit_cost

    // Currency
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),

    // Metadata
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),

    // Audit fields (F01 LAW F01-02)
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    // Indexes (F01 LAW F01-04)
    tenantIdIdx: index("idx_invoice_lines_tenant_id").on(table.tenantId),
    invoiceIdIdx: index("idx_invoice_lines_invoice_id").on(table.invoiceId),
    orderLineIdIdx: index("idx_invoice_lines_order_line_id").on(table.orderLineId),
    productIdIdx: index("idx_invoice_lines_product_id").on(table.productId),

    // Unique constraint: line_number per invoice
    invoiceLineNumberUniq: unique("uq_invoice_lines_invoice_line_number").on(
      table.invoiceId,
      table.lineNumber
    ),

    // Check constraints
    quantityCheck: check(
      "chk_invoice_line_quantity",
      sql`quantity > 0`
    ),
  })
);

/**
 * Type inference for invoice lines.
 */
export type InvoiceLine = typeof invoiceLines.$inferSelect;
export type NewInvoiceLine = typeof invoiceLines.$inferInsert;
