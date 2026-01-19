// packages/db/src/erp/sales/invoice-lines.ts
// Sales Invoice Lines - Line items for sales invoices

import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  timestamp,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { tenants } from "../../schema";
import { salesInvoices } from "./invoices";
import { erpProducts } from "../base/products";
import { erpUoms } from "../base/uoms";

/**
 * Sales Invoice Lines Table
 * 
 * Line items for sales invoices containing:
 * - Product reference (optional - allows free-text lines)
 * - Quantity and unit price
 * - Computed line totals
 * 
 * Line numbers are stable (1..n) and unique within an invoice.
 * During order conversion, line_no values are preserved.
 */
export const salesInvoiceLines = pgTable(
  "sales_invoice_lines",
  {
    // Identity
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),

    // Parent Invoice
    invoiceId: uuid("invoice_id")
      .notNull()
      .references(() => salesInvoices.id, { onDelete: "cascade" }),

    // Line Number (stable, 1..n within invoice)
    lineNo: integer("line_no").notNull(),

    // Product Reference (optional for free-text lines)
    productId: uuid("product_id").references(() => erpProducts.id, {
      onDelete: "set null",
    }),

    // Line Details
    description: text("description").notNull(),

    // Unit of Measure (required)
    uomId: uuid("uom_id")
      .notNull()
      .references(() => erpUoms.id, { onDelete: "restrict" }),

    // Quantity (stored as numeric to avoid float precision issues)
    // API boundary uses string representation
    qty: numeric("qty", { precision: 18, scale: 6 }).notNull(),

    // Pricing (stored as integer cents)
    unitPriceCents: integer("unit_price_cents").notNull(),
    lineTotalCents: integer("line_total_cents").notNull(),

    // Audit Fields
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    // Unique constraint: line number must be unique per invoice per tenant
    unique("uq_sales_invoice_lines_tenant_invoice_line_no").on(
      t.tenantId,
      t.invoiceId,
      t.lineNo
    ),

    // Index for fetching all lines for an invoice
    index("idx_sales_invoice_lines_tenant_invoice").on(t.tenantId, t.invoiceId),
  ]
);
