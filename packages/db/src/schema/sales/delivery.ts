/**
 * Sales Delivery Table (B04)
 *
 * Records shipments to customers, creates stock moves.
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
import { salesOrders } from "./order";
import {
  type DeliveryStatus,
  type AddressSnapshot,
  type SalesDeliveryLine,
} from "@axis/registry/schemas";

export const salesDeliveries = pgTable(
  "sales_deliveries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Identity
    documentNumber: varchar("document_number", { length: 50 }).notNull(),

    // Source (same domain, FK allowed)
    sourceOrderId: uuid("source_order_id")
      .notNull()
      .references(() => salesOrders.id),
    sourceOrderNumber: varchar("source_order_number", { length: 50 }).notNull(),

    // Customer (reference by UUID, not FK per B02)
    customerId: uuid("customer_id").notNull(),
    customerName: varchar("customer_name", { length: 255 }).notNull(),

    // Shipping
    shippingAddress: jsonb("shipping_address")
      .notNull()
      .$type<AddressSnapshot>(),
    shippingMethod: varchar("shipping_method", { length: 100 }),
    trackingNumber: varchar("tracking_number", { length: 100 }),
    carrier: varchar("carrier", { length: 100 }),

    // Status
    status: varchar("status", { length: 20 })
      .notNull()
      .default("draft")
      .$type<DeliveryStatus>(),
    scheduledDate: timestamp("scheduled_date", { withTimezone: true }),
    shippedDate: timestamp("shipped_date", { withTimezone: true }),
    deliveredDate: timestamp("delivered_date", { withTimezone: true }),

    // Warehouse (reference by UUID, not FK per B02)
    warehouseId: uuid("warehouse_id").notNull(),
    warehouseName: varchar("warehouse_name", { length: 255 }).notNull(),

    // Lines
    lines: jsonb("lines").notNull().$type<SalesDeliveryLine[]>(),

    // Weights/Dimensions
    totalWeight: numeric("total_weight", { precision: 12, scale: 4 }),
    weightUom: varchar("weight_uom", { length: 10 }),
    packageCount: integer("package_count"),

    // Notes
    notes: text("notes"),

    // Invoice tracking (same domain, FK allowed)
    invoiceId: uuid("invoice_id"),

    // Posting reference (B01)
    postingBatchId: uuid("posting_batch_id"),

    // Audit
    createdBy: uuid("created_by").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedBy: uuid("updated_by"),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    shippedBy: uuid("shipped_by"),

    // Version
    version: integer("version").notNull().default(1),
  },
  (table) => [
    index("idx_sales_deliveries_tenant").on(table.tenantId),
    index("idx_sales_deliveries_order").on(table.tenantId, table.sourceOrderId),
    index("idx_sales_deliveries_customer").on(table.tenantId, table.customerId),
    index("idx_sales_deliveries_status").on(table.tenantId, table.status),
    index("idx_sales_deliveries_doc_number").on(
      table.tenantId,
      table.documentNumber
    ),
  ]
);

export const salesDeliveriesRelations = relations(
  salesDeliveries,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [salesDeliveries.tenantId],
      references: [tenants.id],
    }),
    sourceOrder: one(salesOrders, {
      fields: [salesDeliveries.sourceOrderId],
      references: [salesOrders.id],
    }),
  })
);

export type SalesDeliveryRow = typeof salesDeliveries.$inferSelect;
export type NewSalesDeliveryRow = typeof salesDeliveries.$inferInsert;
