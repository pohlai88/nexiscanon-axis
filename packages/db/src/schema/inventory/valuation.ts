/**
 * Valuation Tables (B06)
 *
 * Cost tracking per stock move.
 */

import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  integer,
  numeric,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";
import { stockMoves } from "./stock-move";
import { type CostingMethod } from "@axis/registry/schemas";

// ============================================================================
// Valuation Entry Table
// ============================================================================

export const valuationEntries = pgTable(
  "valuation_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Reference (same domain, FK allowed)
    stockMoveId: uuid("stock_move_id")
      .notNull()
      .references(() => stockMoves.id),
    stockMoveLineNumber: integer("stock_move_line_number").notNull(),

    // Item (reference by UUID, not FK per B02)
    itemId: uuid("item_id").notNull(),
    locationId: uuid("location_id").notNull(),
    lotNumber: varchar("lot_number", { length: 100 }),

    // Quantity (positive for IN, negative for OUT)
    quantity: numeric("quantity", { precision: 18, scale: 4 }).notNull(),
    baseUomId: uuid("base_uom_id").notNull(),

    // Costing
    costingMethod: varchar("costing_method", { length: 20 })
      .notNull()
      .$type<CostingMethod>(),
    unitCost: numeric("unit_cost", { precision: 18, scale: 6 }).notNull(),
    totalCost: numeric("total_cost", { precision: 18, scale: 4 }).notNull(),

    // For FIFO (same domain, FK allowed)
    costLayerId: uuid("cost_layer_id"),

    // For Standard
    standardCost: numeric("standard_cost", { precision: 18, scale: 6 }),
    priceVariance: numeric("price_variance", { precision: 18, scale: 4 }),

    // Running totals (after this entry)
    runningQuantity: numeric("running_quantity", {
      precision: 18,
      scale: 4,
    }).notNull(),
    runningValue: numeric("running_value", {
      precision: 18,
      scale: 4,
    }).notNull(),
    runningAverageCost: numeric("running_average_cost", {
      precision: 18,
      scale: 6,
    }).notNull(),

    // Dates
    effectiveDate: timestamp("effective_date", {
      withTimezone: true,
    }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_valuation_entries_tenant").on(table.tenantId),
    index("idx_valuation_entries_move").on(table.tenantId, table.stockMoveId),
    index("idx_valuation_entries_item").on(table.tenantId, table.itemId),
    index("idx_valuation_entries_effective").on(
      table.tenantId,
      table.itemId,
      table.effectiveDate
    ),
  ]
);

export const valuationEntriesRelations = relations(
  valuationEntries,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [valuationEntries.tenantId],
      references: [tenants.id],
    }),
    stockMove: one(stockMoves, {
      fields: [valuationEntries.stockMoveId],
      references: [stockMoves.id],
    }),
  })
);

export type ValuationEntryRow = typeof valuationEntries.$inferSelect;
export type NewValuationEntryRow = typeof valuationEntries.$inferInsert;

// ============================================================================
// FIFO Cost Layer Table
// ============================================================================

export const costLayers = pgTable(
  "cost_layers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Item (reference by UUID, not FK per B02)
    itemId: uuid("item_id").notNull(),
    locationId: uuid("location_id").notNull(),
    lotNumber: varchar("lot_number", { length: 100 }),

    // Original receipt (same domain, FK allowed)
    receiptMoveId: uuid("receipt_move_id")
      .notNull()
      .references(() => stockMoves.id),
    receiptDate: timestamp("receipt_date", { withTimezone: true }).notNull(),

    // Quantities
    originalQuantity: numeric("original_quantity", {
      precision: 18,
      scale: 4,
    }).notNull(),
    remainingQuantity: numeric("remaining_quantity", {
      precision: 18,
      scale: 4,
    }).notNull(),
    consumedQuantity: numeric("consumed_quantity", {
      precision: 18,
      scale: 4,
    })
      .notNull()
      .default("0"),

    // Cost
    unitCost: numeric("unit_cost", { precision: 18, scale: 6 }).notNull(),

    // Status
    isExhausted: boolean("is_exhausted").notNull().default(false),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_cost_layers_tenant").on(table.tenantId),
    index("idx_cost_layers_item").on(
      table.tenantId,
      table.itemId,
      table.locationId,
      table.isExhausted
    ),
    index("idx_cost_layers_fifo").on(
      table.tenantId,
      table.itemId,
      table.receiptDate
    ),
  ]
);

export const costLayersRelations = relations(costLayers, ({ one }) => ({
  tenant: one(tenants, {
    fields: [costLayers.tenantId],
    references: [tenants.id],
  }),
  receiptMove: one(stockMoves, {
    fields: [costLayers.receiptMoveId],
    references: [stockMoves.id],
  }),
}));

export type CostLayerRow = typeof costLayers.$inferSelect;
export type NewCostLayerRow = typeof costLayers.$inferInsert;
