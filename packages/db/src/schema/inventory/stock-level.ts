/**
 * Stock Level Schema
 * 
 * Current inventory levels per product (materialized view pattern).
 * F01 Compliant: UUID PKs, timestamptz, proper FKs, tenant isolation.
 */

import { pgTable, uuid, numeric, varchar, timestamp, uniqueIndex, index, check } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { tenants } from "../tenant";
import { products } from "./product";

/**
 * Stock levels table.
 */
export const stockLevels = pgTable(
  "stock_levels",
  {
    // Primary Key
    id: uuid("id").primaryKey().defaultRandom(),

    // Tenant
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Product
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),

    // Location (optional for future)
    locationId: uuid("location_id"),

    // Quantities
    quantityOnHand: numeric("quantity_on_hand", { precision: 19, scale: 4 })
      .notNull()
      .default("0"),
    quantityAvailable: numeric("quantity_available", { precision: 19, scale: 4 })
      .notNull()
      .default("0"), // on_hand - committed
    quantityCommitted: numeric("quantity_committed", { precision: 19, scale: 4 })
      .notNull()
      .default("0"), // reserved for orders

    // Costing (Weighted Average)
    averageUnitCost: numeric("average_unit_cost", { precision: 19, scale: 4 })
      .notNull()
      .default("0"),
    totalValue: numeric("total_value", { precision: 19, scale: 4 })
      .notNull()
      .default("0"), // quantity_on_hand * average_unit_cost
    currency: varchar("currency", { length: 3 }).default("USD"),

    // Last Activity
    lastMovementDate: timestamp("last_movement_date"),
    lastReceiptDate: timestamp("last_receipt_date"),
    lastIssueDate: timestamp("last_issue_date"),

    // Audit
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    // Unique constraint: tenant + product + location
    tenantProductLocationIdx: uniqueIndex("stock_levels_tenant_product_unique").on(
      table.tenantId,
      table.productId,
      table.locationId
    ),

    // Indexes
    tenantIdx: index("idx_stock_levels_tenant").on(table.tenantId),
    productIdx: index("idx_stock_levels_product").on(table.tenantId, table.productId),
    lowStockIdx: index("idx_stock_levels_low_stock")
      .on(table.tenantId, table.quantityAvailable)
      .where(sql`${table.quantityAvailable} < 10`),

    // Check constraint: quantities validation
    quantitiesCheck: check(
      "stock_levels_quantities_check",
      sql`
        quantity_on_hand >= 0 AND
        quantity_available >= 0 AND
        quantity_committed >= 0 AND
        quantity_available = quantity_on_hand - quantity_committed
      `
    ),
  })
);

/**
 * Stock level relations.
 */
export const stockLevelsRelations = relations(stockLevels, ({ one }) => ({
  tenant: one(tenants, {
    fields: [stockLevels.tenantId],
    references: [tenants.id],
  }),
  product: one(products, {
    fields: [stockLevels.productId],
    references: [products.id],
  }),
}));

/**
 * Stock level TypeScript type (inferred from schema).
 */
export type StockLevel = typeof stockLevels.$inferSelect;
export type StockLevelInsert = typeof stockLevels.$inferInsert;
