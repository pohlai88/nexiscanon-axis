/**
 * Product Schema (Inventory Module)
 * 
 * Product catalog for items we buy and sell.
 * F01 Compliant: UUID PKs, timestamptz, proper FKs, tenant isolation.
 */

import { pgTable, uuid, varchar, text, numeric, boolean, jsonb, timestamp, uniqueIndex, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";
import { users } from "../user";
import { glAccounts as accounts } from "../accounting/coa";

/**
 * Products table.
 */
export const products = pgTable(
  "products",
  {
    // Primary Key
    id: uuid("id").primaryKey().defaultRandom(),

    // Tenant
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Product Identity
    sku: varchar("sku", { length: 100 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),

    // Classification
    productType: varchar("product_type", { length: 50 }).notNull(), // 'inventory' | 'service' | 'non-inventory'
    category: varchar("category", { length: 100 }),

    // Inventory Control
    isTracked: boolean("is_tracked").notNull().default(true),
    trackBySerial: boolean("track_by_serial").notNull().default(false),
    trackByLot: boolean("track_by_lot").notNull().default(false),

    // Pricing
    defaultUnitCost: numeric("default_unit_cost", { precision: 19, scale: 4 }),
    defaultUnitPrice: numeric("default_unit_price", { precision: 19, scale: 4 }),
    currency: varchar("currency", { length: 3 }).default("USD"),

    // Accounting (GL account links)
    assetAccountId: uuid("asset_account_id").references(() => accounts.id), // Inventory Asset
    cogsAccountId: uuid("cogs_account_id").references(() => accounts.id), // Cost of Goods Sold
    revenueAccountId: uuid("revenue_account_id").references(() => accounts.id), // Revenue

    // Status
    isActive: varchar("is_active", { length: 10 }).notNull().default("true"), // 'true' | 'false'

    // Metadata
    metadata: jsonb("metadata").default({}).notNull(),

    // Audit
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
    modifiedBy: uuid("modified_by")
      .notNull()
      .references(() => users.id),
  },
  (table) => ({
    // Unique constraint: tenant + SKU
    tenantSkuIdx: uniqueIndex("products_tenant_sku_unique").on(table.tenantId, table.sku),

    // Indexes
    tenantIdx: index("idx_products_tenant").on(table.tenantId),
    skuIdx: index("idx_products_sku").on(table.tenantId, table.sku),
    typeIdx: index("idx_products_type").on(table.tenantId, table.productType),
    activeIdx: index("idx_products_active").on(table.tenantId, table.isActive),
  })
);

/**
 * Product relations.
 */
export const productsRelations = relations(products, ({ one }) => ({
  tenant: one(tenants, {
    fields: [products.tenantId],
    references: [tenants.id],
  }),
  createdByUser: one(users, {
    fields: [products.createdBy],
    references: [users.id],
    relationName: "productCreatedBy",
  }),
  modifiedByUser: one(users, {
    fields: [products.modifiedBy],
    references: [users.id],
    relationName: "productModifiedBy",
  }),
  assetAccount: one(accounts, {
    fields: [products.assetAccountId],
    references: [accounts.id],
    relationName: "productAssetAccount",
  }),
  cogsAccount: one(accounts, {
    fields: [products.cogsAccountId],
    references: [accounts.id],
    relationName: "productCogsAccount",
  }),
  revenueAccount: one(accounts, {
    fields: [products.revenueAccountId],
    references: [accounts.id],
    relationName: "productRevenueAccount",
  }),
}));

/**
 * Product TypeScript type (inferred from schema).
 */
export type Product = typeof products.$inferSelect;
export type ProductInsert = typeof products.$inferInsert;
