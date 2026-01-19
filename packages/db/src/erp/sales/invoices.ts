// packages/db/src/erp/sales/invoices.ts
// Sales Invoices - Invoice headers for ERP sales module

import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { tenants } from "../../schema";
import { erpPartners } from "../base/partners";
import { salesOrders } from "./orders";

/**
 * Sales Invoice Status Enum
 * 
 * State machine (lean, no payments yet):
 * - DRAFT → ISSUED
 * - DRAFT → CANCELLED
 * - ISSUED → CANCELLED
 * 
 * After CANCELLED, invoice becomes immutable.
 * Payment status deferred to Phase 4.x.
 */
export const salesInvoiceStatusEnum = ["DRAFT", "ISSUED", "CANCELLED"] as const;
export type SalesInvoiceStatus = (typeof salesInvoiceStatusEnum)[number];

/**
 * Sales Invoices Table
 * 
 * Invoice header representing billing intent after order confirmation.
 * Each invoice has lines (see sales_invoice_lines) with product/pricing details.
 * 
 * Conversion tracking:
 * - sourceOrderId links back to originating order (nullable for manual invoices)
 */
export const salesInvoices = pgTable(
  "sales_invoices",
  {
    // Identity
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),

    // Document Number (from SequenceService using code "sales.invoice")
    invoiceNo: text("invoice_no").notNull(),

    // Workflow Status
    status: text("status", { enum: salesInvoiceStatusEnum }).notNull(),

    // Commercial Details
    partnerId: uuid("partner_id")
      .notNull()
      .references(() => erpPartners.id, { onDelete: "restrict" }),

    currency: text("currency").notNull(), // ISO code: USD, VND, etc.

    // Conversion Tracking (nullable for manual invoices)
    sourceOrderId: uuid("source_order_id").references(() => salesOrders.id, {
      onDelete: "set null",
    }),

    // Denormalized Totals (computed from lines, stored for fast list views)
    subtotalCents: integer("subtotal_cents").notNull().default(0),
    totalCents: integer("total_cents").notNull().default(0), // subtotal for now; tax later

    // Notes
    notes: text("notes"),

    // Status Timestamps (set when transitions happen)
    issuedAt: timestamp("issued_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),

    // Audit Fields
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    // Unique constraint: invoice number must be unique per tenant
    unique("uq_sales_invoices_tenant_invoice_no").on(t.tenantId, t.invoiceNo),

    // Index for list views filtered by status and sorted by date
    index("idx_sales_invoices_tenant_status_created").on(
      t.tenantId,
      t.status,
      t.createdAt
    ),

    // Index for filtering by partner
    index("idx_sales_invoices_tenant_partner").on(t.tenantId, t.partnerId),

    // Index for tracking order conversions
    index("idx_sales_invoices_tenant_source_order").on(
      t.tenantId,
      t.sourceOrderId
    ),
  ]
);
