/**
 * Purchase Order Table (B05)
 *
 * Binding commitment to supplier.
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
  type PoStatus,
  type AddressSnapshot,
  type PurchaseOrderLine,
} from "@axis/registry/schemas";

export const purchaseOrders = pgTable(
  "purchase_orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Identity
    documentNumber: varchar("document_number", { length: 50 }).notNull(),

    // Source
    sourcePrIds: jsonb("source_pr_ids").$type<string[]>(),

    // Supplier (reference by UUID, not FK per B02)
    supplierId: uuid("supplier_id").notNull(),
    supplierName: varchar("supplier_name", { length: 255 }).notNull(),
    supplierContactName: varchar("supplier_contact_name", { length: 255 }),
    supplierContactEmail: varchar("supplier_contact_email", { length: 255 }),

    // Addresses
    supplierAddress: jsonb("supplier_address")
      .notNull()
      .$type<AddressSnapshot>(),
    deliveryAddress: jsonb("delivery_address")
      .notNull()
      .$type<AddressSnapshot>(),

    // Status
    status: varchar("status", { length: 30 })
      .notNull()
      .default("draft")
      .$type<PoStatus>(),
    orderDate: timestamp("order_date", { withTimezone: true }).notNull(),
    expectedDeliveryDate: timestamp("expected_delivery_date", {
      withTimezone: true,
    }),

    // Pricing
    priceListId: uuid("price_list_id"),
    currency: varchar("currency", { length: 3 }).notNull(),
    exchangeRate: numeric("exchange_rate", { precision: 12, scale: 6 })
      .notNull()
      .default("1"),

    // Lines
    lines: jsonb("lines").notNull().$type<PurchaseOrderLine[]>(),

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
    paymentTermDays: integer("payment_term_days"),
    incoterm: varchar("incoterm", { length: 20 }),
    shippingMethod: varchar("shipping_method", { length: 100 }),

    // Notes
    notes: text("notes"),
    supplierNotes: text("supplier_notes"),

    // Receipt/Bill tracking
    receiptIds: jsonb("receipt_ids").$type<string[]>(),
    billIds: jsonb("bill_ids").$type<string[]>(),

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
    index("idx_purchase_orders_tenant").on(table.tenantId),
    index("idx_purchase_orders_supplier").on(table.tenantId, table.supplierId),
    index("idx_purchase_orders_status").on(table.tenantId, table.status),
    index("idx_purchase_orders_doc_number").on(
      table.tenantId,
      table.documentNumber
    ),
    index("idx_purchase_orders_order_date").on(table.tenantId, table.orderDate),
  ]
);

export const purchaseOrdersRelations = relations(
  purchaseOrders,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [purchaseOrders.tenantId],
      references: [tenants.id],
    }),
  })
);

export type PurchaseOrderRow = typeof purchaseOrders.$inferSelect;
export type NewPurchaseOrderRow = typeof purchaseOrders.$inferInsert;
