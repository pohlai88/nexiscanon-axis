/**
 * Stock Adjustment Table (B06)
 *
 * Reconciles physical counts with book values.
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
import {
  type AdjustmentReason,
  type AdjustmentLine,
} from "@axis/registry/schemas";

export const stockAdjustments = pgTable(
  "stock_adjustments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Identity
    documentNumber: varchar("document_number", { length: 50 }).notNull(),

    // Context (reference by UUID, not FK per B02)
    warehouseId: uuid("warehouse_id").notNull(),
    warehouseName: varchar("warehouse_name", { length: 255 }).notNull(),
    adjustmentDate: timestamp("adjustment_date", {
      withTimezone: true,
    }).notNull(),
    reason: varchar("reason", { length: 30 })
      .notNull()
      .$type<AdjustmentReason>(),
    reasonDescription: text("reason_description"),

    // Reference (same domain, optional FK)
    physicalCountId: uuid("physical_count_id"),

    // Lines
    lines: jsonb("lines").notNull().$type<AdjustmentLine[]>(),

    // Totals
    totalValueAdjustment: numeric("total_value_adjustment", {
      precision: 18,
      scale: 4,
    }).notNull(),

    // Approval (Danger Zone)
    requiresApproval: boolean("requires_approval").notNull().default(true),
    approvedBy: uuid("approved_by"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),

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
    postedBy: uuid("posted_by"),
    postedAt: timestamp("posted_at", { withTimezone: true }),

    // Version
    version: integer("version").notNull().default(1),
  },
  (table) => [
    index("idx_stock_adjustments_tenant").on(table.tenantId),
    index("idx_stock_adjustments_warehouse").on(
      table.tenantId,
      table.warehouseId
    ),
    index("idx_stock_adjustments_doc_number").on(
      table.tenantId,
      table.documentNumber
    ),
    index("idx_stock_adjustments_date").on(
      table.tenantId,
      table.adjustmentDate
    ),
  ]
);

export const stockAdjustmentsRelations = relations(
  stockAdjustments,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [stockAdjustments.tenantId],
      references: [tenants.id],
    }),
  })
);

export type StockAdjustmentRow = typeof stockAdjustments.$inferSelect;
export type NewStockAdjustmentRow = typeof stockAdjustments.$inferInsert;
