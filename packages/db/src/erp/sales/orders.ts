// packages/db/src/erp/sales/orders.ts
// Sales Orders - Order headers for ERP sales module

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
import { salesQuotes } from "./quotes";

/**
 * Sales Order Status Enum
 * 
 * State machine (lean, inventory-decoupled):
 * - DRAFT → CONFIRMED
 * - DRAFT → CANCELLED
 * - CONFIRMED → CANCELLED
 * 
 * After CANCELLED, order becomes immutable.
 * PROCESSING/DONE states deferred to Phase 2.3.
 */
export const salesOrderStatusEnum = ["DRAFT", "CONFIRMED", "CANCELLED"] as const;
export type SalesOrderStatus = (typeof salesOrderStatusEnum)[number];

/**
 * Sales Orders Table
 * 
 * Order header representing committed commercial intent after quote acceptance.
 * Each order has lines (see sales_order_lines) with product/pricing details.
 * 
 * Conversion tracking:
 * - sourceQuoteId links back to originating quote (nullable for manual orders)
 */
export const salesOrders = pgTable(
  "sales_orders",
  {
    // Identity
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),

    // Document Number (from SequenceService using code "sales.order")
    orderNo: text("order_no").notNull(),

    // Workflow Status
    status: text("status", { enum: salesOrderStatusEnum }).notNull(),

    // Commercial Details
    partnerId: uuid("partner_id")
      .notNull()
      .references(() => erpPartners.id, { onDelete: "restrict" }),

    currency: text("currency").notNull(), // ISO code: USD, VND, etc.

    // Conversion Tracking (nullable for manual orders)
    sourceQuoteId: uuid("source_quote_id").references(() => salesQuotes.id, {
      onDelete: "set null",
    }),

    // Denormalized Total (computed from lines, stored for fast list views)
    totalCents: integer("total_cents").notNull().default(0),

    // Notes
    notes: text("notes"),

    // Status Timestamps (set when transitions happen)
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
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
    // Unique constraint: order number must be unique per tenant
    unique("uq_sales_orders_tenant_order_no").on(t.tenantId, t.orderNo),

    // Index for list views filtered by status and sorted by date
    index("idx_sales_orders_tenant_status_created").on(
      t.tenantId,
      t.status,
      t.createdAt
    ),

    // Index for filtering by partner
    index("idx_sales_orders_tenant_partner").on(t.tenantId, t.partnerId),

    // Index for tracking quote conversions
    index("idx_sales_orders_tenant_source_quote").on(
      t.tenantId,
      t.sourceQuoteId
    ),
  ]
);
