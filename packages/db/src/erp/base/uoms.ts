// packages/db/src/erp/base/uoms.ts
// ERP Units of Measure - quantity units for products

import { pgTable, uuid, text, boolean, timestamp, index, unique } from "drizzle-orm/pg-core";
import { tenants } from "../../schema";

/**
 * Units of Measure (UoM)
 *
 * Represents measurement units for products (weight, length, volume, time, quantity).
 * Each tenant has their own UoM set.
 *
 * Examples: KG, UNIT, HR, M, L
 */
export const erpUoms = pgTable(
  "erp_uoms",
  {
    // Identity
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),

    // Definition
    code: text("code").notNull(), // e.g., "KG", "PCS", "HR"
    name: text("name").notNull(), // e.g., "Kilogram", "Pieces", "Hour"
    category: text("category").notNull(), // e.g., "weight", "quantity", "time", "length", "volume"

    // Status
    isActive: boolean("is_active").notNull().default(true),

    // Audit
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    // Indexes
    tenantIdx: index("idx_erp_uoms_tenant").on(table.tenantId),
    tenantCategoryIdx: index("idx_erp_uoms_tenant_category").on(table.tenantId, table.category),

    // Unique constraints
    uniqueCode: unique("uq_erp_uoms_tenant_code").on(table.tenantId, table.code),
  })
);

// ---- Type exports ----

export type ErpUom = typeof erpUoms.$inferSelect;
export type NewErpUom = typeof erpUoms.$inferInsert;

// ---- UoM Categories ----

export const UOM_CATEGORIES = {
  QUANTITY: "quantity",
  WEIGHT: "weight",
  LENGTH: "length",
  VOLUME: "volume",
  TIME: "time",
} as const;

export type UomCategory = (typeof UOM_CATEGORIES)[keyof typeof UOM_CATEGORIES];
