/**
 * Stock Transfer Table (B06)
 *
 * Moves stock between locations.
 */

import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  jsonb,
  integer,
  numeric,
  boolean,
  text,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";
import { type TransferStatus, type TransferLine } from "@axis/registry/schemas";

export const stockTransfers = pgTable(
  "stock_transfers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Identity
    documentNumber: varchar("document_number", { length: 50 }).notNull(),

    // Locations (reference by UUID, not FK per B02)
    fromWarehouseId: uuid("from_warehouse_id").notNull(),
    fromWarehouseName: varchar("from_warehouse_name", { length: 255 }).notNull(),
    toWarehouseId: uuid("to_warehouse_id").notNull(),
    toWarehouseName: varchar("to_warehouse_name", { length: 255 }).notNull(),

    // Status
    status: varchar("status", { length: 20 })
      .notNull()
      .default("draft")
      .$type<TransferStatus>(),

    // Dates
    scheduledDate: timestamp("scheduled_date", { withTimezone: true }),
    shippedDate: timestamp("shipped_date", { withTimezone: true }),
    receivedDate: timestamp("received_date", { withTimezone: true }),

    // Transit
    isInTransit: boolean("is_in_transit").notNull().default(false),
    transitLocationId: uuid("transit_location_id"),

    // Lines
    lines: jsonb("lines").notNull().$type<TransferLine[]>(),

    // Totals
    totalQuantity: numeric("total_quantity", {
      precision: 18,
      scale: 4,
    }).notNull(),
    totalValue: numeric("total_value", { precision: 18, scale: 4 }).notNull(),

    notes: text("notes"),

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
    receivedBy: uuid("received_by"),

    // Version
    version: integer("version").notNull().default(1),
  },
  (table) => [
    index("idx_stock_transfers_tenant").on(table.tenantId),
    index("idx_stock_transfers_from").on(table.tenantId, table.fromWarehouseId),
    index("idx_stock_transfers_to").on(table.tenantId, table.toWarehouseId),
    index("idx_stock_transfers_status").on(table.tenantId, table.status),
    index("idx_stock_transfers_doc_number").on(
      table.tenantId,
      table.documentNumber
    ),
  ]
);

export const stockTransfersRelations = relations(stockTransfers, ({ one }) => ({
  tenant: one(tenants, {
    fields: [stockTransfers.tenantId],
    references: [tenants.id],
  }),
}));

export type StockTransferRow = typeof stockTransfers.$inferSelect;
export type NewStockTransferRow = typeof stockTransfers.$inferInsert;
