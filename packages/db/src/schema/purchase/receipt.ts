/**
 * Purchase Receipt (GRN) Table (B05)
 *
 * Records goods received from supplier.
 */

import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  jsonb,
  integer,
  boolean,
  text,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";
import { purchaseOrders } from "./order";
import {
  type ReceiptStatus,
  type PurchaseReceiptLine,
} from "@axis/registry/schemas";

export const purchaseReceipts = pgTable(
  "purchase_receipts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Identity
    documentNumber: varchar("document_number", { length: 50 }).notNull(),

    // Source (same domain, FK allowed)
    sourcePoId: uuid("source_po_id")
      .notNull()
      .references(() => purchaseOrders.id),
    sourcePoNumber: varchar("source_po_number", { length: 50 }).notNull(),

    // Supplier (reference by UUID, not FK per B02)
    supplierId: uuid("supplier_id").notNull(),
    supplierName: varchar("supplier_name", { length: 255 }).notNull(),

    // Delivery details
    supplierDeliveryNote: varchar("supplier_delivery_note", { length: 100 }),
    carrierName: varchar("carrier_name", { length: 100 }),
    trackingNumber: varchar("tracking_number", { length: 100 }),

    // Status
    status: varchar("status", { length: 30 })
      .notNull()
      .default("draft")
      .$type<ReceiptStatus>(),
    receivedDate: timestamp("received_date", { withTimezone: true }).notNull(),
    inspectionDate: timestamp("inspection_date", { withTimezone: true }),

    // Warehouse (reference by UUID, not FK per B02)
    warehouseId: uuid("warehouse_id").notNull(),
    warehouseName: varchar("warehouse_name", { length: 255 }).notNull(),

    // Lines
    lines: jsonb("lines").notNull().$type<PurchaseReceiptLine[]>(),

    // Quality
    requiresInspection: boolean("requires_inspection").notNull().default(false),
    inspectedBy: uuid("inspected_by"),

    // Notes
    notes: text("notes"),

    // Bill tracking
    billId: uuid("bill_id"),

    // Posting reference (B01)
    postingBatchId: uuid("posting_batch_id"),

    // Audit
    createdBy: uuid("created_by").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedBy: uuid("updated_by"),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    receivedBy: uuid("received_by"),

    // Version
    version: integer("version").notNull().default(1),
  },
  (table) => [
    index("idx_purchase_receipts_tenant").on(table.tenantId),
    index("idx_purchase_receipts_po").on(table.tenantId, table.sourcePoId),
    index("idx_purchase_receipts_supplier").on(
      table.tenantId,
      table.supplierId
    ),
    index("idx_purchase_receipts_status").on(table.tenantId, table.status),
    index("idx_purchase_receipts_doc_number").on(
      table.tenantId,
      table.documentNumber
    ),
  ]
);

export const purchaseReceiptsRelations = relations(
  purchaseReceipts,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [purchaseReceipts.tenantId],
      references: [tenants.id],
    }),
    sourcePo: one(purchaseOrders, {
      fields: [purchaseReceipts.sourcePoId],
      references: [purchaseOrders.id],
    }),
  })
);

export type PurchaseReceiptRow = typeof purchaseReceipts.$inferSelect;
export type NewPurchaseReceiptRow = typeof purchaseReceipts.$inferInsert;
