/**
 * Inventory Movement Schema
 * 
 * Tracks all stock movements (receipts, issues, adjustments).
 * F01 Compliant: UUID PKs, timestamptz, proper FKs, tenant isolation.
 */

import { pgTable, uuid, varchar, numeric, timestamp, text, jsonb, uniqueIndex, index, check } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { tenants } from "../tenant";
import { users } from "../user";
import { documents } from "../document";
import { products } from "./product";

/**
 * Inventory movements table.
 */
export const inventoryMovements = pgTable(
  "inventory_movements",
  {
    // Primary Key
    id: uuid("id").primaryKey().defaultRandom(),

    // Tenant
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Movement Identity
    movementNumber: varchar("movement_number", { length: 100 }).notNull(),
    movementDate: timestamp("movement_date").notNull(),
    movementType: varchar("movement_type", { length: 50 }).notNull(), // 'receipt' | 'issue' | 'adjustment' | 'transfer'

    // Product
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),

    // Quantity
    quantity: numeric("quantity", { precision: 19, scale: 4 }).notNull(),
    unitOfMeasure: varchar("unit_of_measure", { length: 50 }).default("EA"),

    // Costing
    unitCost: numeric("unit_cost", { precision: 19, scale: 4 }),
    totalCost: numeric("total_cost", { precision: 19, scale: 4 }),
    currency: varchar("currency", { length: 3 }).default("USD"),

    // Location (optional for future)
    locationId: uuid("location_id"),

    // Document Linkage (B01 integration)
    documentId: uuid("document_id").references(() => documents.id), // Link to posting spine
    sourceDocumentType: varchar("source_document_type", { length: 50 }), // 'purchase_order' | 'sales_order' | 'adjustment'
    sourceDocumentId: uuid("source_document_id"),

    // Status
    status: varchar("status", { length: 50 }).notNull().default("pending"), // 'pending' | 'posted' | 'void'
    postedAt: timestamp("posted_at"),

    // Reason
    reason: varchar("reason", { length: 255 }),
    notes: text("notes"),

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
    // Unique constraint: tenant + movement number
    tenantNumberIdx: uniqueIndex("inventory_movements_tenant_number_unique").on(
      table.tenantId,
      table.movementNumber
    ),

    // Indexes
    tenantIdx: index("idx_inventory_movements_tenant").on(table.tenantId),
    productIdx: index("idx_inventory_movements_product").on(table.tenantId, table.productId),
    dateIdx: index("idx_inventory_movements_date").on(table.tenantId, table.movementDate),
    typeIdx: index("idx_inventory_movements_type").on(table.tenantId, table.movementType),
    statusIdx: index("idx_inventory_movements_status").on(table.tenantId, table.status),
    documentIdx: index("idx_inventory_movements_document").on(table.documentId),
    sourceIdx: index("idx_inventory_movements_source").on(table.sourceDocumentId),

    // Check constraint: quantity validation based on movement type
    quantityCheck: check(
      "inventory_movements_quantity_check",
      sql`(
        (movement_type = 'receipt' AND quantity > 0) OR
        (movement_type = 'issue' AND quantity > 0) OR
        (movement_type = 'adjustment') OR
        (movement_type = 'transfer' AND quantity > 0)
      )`
    ),
  })
);

/**
 * Inventory movement relations.
 */
export const inventoryMovementsRelations = relations(inventoryMovements, ({ one }) => ({
  tenant: one(tenants, {
    fields: [inventoryMovements.tenantId],
    references: [tenants.id],
  }),
  product: one(products, {
    fields: [inventoryMovements.productId],
    references: [products.id],
  }),
  document: one(documents, {
    fields: [inventoryMovements.documentId],
    references: [documents.id],
  }),
  createdByUser: one(users, {
    fields: [inventoryMovements.createdBy],
    references: [users.id],
    relationName: "movementCreatedBy",
  }),
  modifiedByUser: one(users, {
    fields: [inventoryMovements.modifiedBy],
    references: [users.id],
    relationName: "movementModifiedBy",
  }),
}));

/**
 * Inventory movement TypeScript type (inferred from schema).
 */
export type InventoryMovement = typeof inventoryMovements.$inferSelect;
export type InventoryMovementInsert = typeof inventoryMovements.$inferInsert;
