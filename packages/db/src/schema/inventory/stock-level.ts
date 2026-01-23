/**
 * Stock Level Table (B06)
 *
 * Tracks quantity at Item + Location + Lot dimension.
 */

import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  integer,
  numeric,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";

export const stockLevels = pgTable(
  "stock_levels",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Dimensions (reference by UUID, not FK per B02)
    itemId: uuid("item_id").notNull(),
    locationId: uuid("location_id").notNull(),
    lotNumber: varchar("lot_number", { length: 100 }),

    // Quantities (in base UoM)
    onHand: numeric("on_hand", { precision: 18, scale: 4 })
      .notNull()
      .default("0"),
    reserved: numeric("reserved", { precision: 18, scale: 4 })
      .notNull()
      .default("0"),
    available: numeric("available", { precision: 18, scale: 4 })
      .notNull()
      .default("0"),

    // Future quantities
    incoming: numeric("incoming", { precision: 18, scale: 4 })
      .notNull()
      .default("0"),
    outgoing: numeric("outgoing", { precision: 18, scale: 4 })
      .notNull()
      .default("0"),
    projected: numeric("projected", { precision: 18, scale: 4 })
      .notNull()
      .default("0"),

    // UoM (reference by UUID, not FK per B02)
    baseUomId: uuid("base_uom_id").notNull(),

    // Valuation
    totalCost: numeric("total_cost", { precision: 18, scale: 4 })
      .notNull()
      .default("0"),
    averageCost: numeric("average_cost", { precision: 18, scale: 6 })
      .notNull()
      .default("0"),

    // For lot-tracked items
    expiryDate: timestamp("expiry_date", { withTimezone: true }),

    // Metadata
    lastMoveDate: timestamp("last_move_date", { withTimezone: true }),
    lastCountDate: timestamp("last_count_date", { withTimezone: true }),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    // Version
    version: integer("version").notNull().default(1),
  },
  (table) => [
    // Unique constraint on item + location + lot
    uniqueIndex("uq_stock_levels_dimension").on(
      table.tenantId,
      table.itemId,
      table.locationId,
      table.lotNumber
    ),
    index("idx_stock_levels_item").on(table.tenantId, table.itemId),
    index("idx_stock_levels_location").on(table.tenantId, table.locationId),
    index("idx_stock_levels_expiry").on(table.tenantId, table.expiryDate),
  ]
);

export const stockLevelsRelations = relations(stockLevels, ({ one }) => ({
  tenant: one(tenants, {
    fields: [stockLevels.tenantId],
    references: [tenants.id],
  }),
}));

export type StockLevelRow = typeof stockLevels.$inferSelect;
export type NewStockLevelRow = typeof stockLevels.$inferInsert;
