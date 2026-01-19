// packages/db/src/erp/base/products.ts
// ERP Products - goods and services

import { pgTable, uuid, text, boolean, timestamp, integer, bigint, index, unique } from "drizzle-orm/pg-core";
import { tenants, users } from "../../schema";
import { erpUoms } from "./uoms";

/**
 * Products (Goods and Services)
 *
 * Represents sellable/purchasable items.
 * Can be physical goods or services.
 */
export const erpProducts = pgTable(
  "erp_products",
  {
    // Identity
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),

    // Business identity
    sku: text("sku").notNull(), // stock keeping unit
    name: text("name").notNull(),
    description: text("description"),

    // Classification
    productType: text("product_type").notNull().default("GOODS"), // GOODS, SERVICE
    category: text("category"), // user-defined category (free text for v0)

    // Pricing (in cents to avoid floating point issues)
    defaultSalePriceCents: bigint("default_sale_price_cents", { mode: "number" })
      .notNull()
      .default(0),
    defaultPurchasePriceCents: bigint("default_purchase_price_cents", { mode: "number" })
      .notNull()
      .default(0),
    currencyCode: text("currency_code").notNull().default("USD"), // ISO 4217

    // UoM
    defaultUomId: uuid("default_uom_id").references(() => erpUoms.id),

    // Inventory (for GOODS)
    isStockable: boolean("is_stockable").notNull().default(true), // false for services
    trackInventory: boolean("track_inventory").notNull().default(true), // whether to track stock levels

    // Status
    isActive: boolean("is_active").notNull().default(true),
    isSellable: boolean("is_sellable").notNull().default(true),
    isPurchasable: boolean("is_purchasable").notNull().default(true),

    // Audit
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    createdBy: uuid("created_by").references(() => users.id),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    updatedBy: uuid("updated_by").references(() => users.id),
    version: integer("version").notNull().default(1),

    // Notes
    internalNotes: text("internal_notes"),
  },
  (table) => ({
    // Indexes
    tenantIdx: index("idx_erp_products_tenant").on(table.tenantId),
    tenantActiveIdx: index("idx_erp_products_tenant_active").on(table.tenantId, table.isActive),
    tenantCategoryIdx: index("idx_erp_products_tenant_category").on(table.tenantId, table.category),

    // Unique constraints
    uniqueSku: unique("uq_erp_products_tenant_sku").on(table.tenantId, table.sku),
  })
);

// ---- Type exports ----

export type ErpProduct = typeof erpProducts.$inferSelect;
export type NewErpProduct = typeof erpProducts.$inferInsert;

// ---- Product Types ----

export const PRODUCT_TYPES = {
  GOODS: "GOODS",
  SERVICE: "SERVICE",
} as const;

export type ProductType = (typeof PRODUCT_TYPES)[keyof typeof PRODUCT_TYPES];
