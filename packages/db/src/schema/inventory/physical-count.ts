/**
 * Physical Count Table (B06)
 *
 * Reconciliation of physical stock with book values.
 */

import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  jsonb,
  integer,
  numeric,
  text,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";
import {
  type CountStatus,
  type CountType,
  type CountLine,
} from "@axis/registry/schemas";

export const physicalCounts = pgTable(
  "physical_counts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Identity
    documentNumber: varchar("document_number", { length: 50 }).notNull(),

    // Scope (reference by UUID, not FK per B02)
    warehouseId: uuid("warehouse_id").notNull(),
    warehouseName: varchar("warehouse_name", { length: 255 }).notNull(),
    locationIds: jsonb("location_ids").$type<string[]>(),
    categoryIds: jsonb("category_ids").$type<string[]>(),

    // Type
    countType: varchar("count_type", { length: 20 })
      .notNull()
      .$type<CountType>(),
    status: varchar("status", { length: 20 })
      .notNull()
      .default("draft")
      .$type<CountStatus>(),

    // Dates
    countDate: timestamp("count_date", { withTimezone: true }).notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),

    // Counters
    countedBy: jsonb("counted_by").$type<string[]>(),
    verifiedBy: uuid("verified_by"),

    // Freeze book values at count start
    bookValuesFrozenAt: timestamp("book_values_frozen_at", {
      withTimezone: true,
    }),

    // Lines
    lines: jsonb("lines").notNull().$type<CountLine[]>(),

    // Summary
    totalItems: integer("total_items").notNull(),
    itemsCounted: integer("items_counted").notNull().default(0),
    itemsWithVariance: integer("items_with_variance").notNull().default(0),
    totalVarianceValue: numeric("total_variance_value", {
      precision: 18,
      scale: 4,
    })
      .notNull()
      .default("0"),

    // Adjustment reference (same domain, optional FK)
    adjustmentId: uuid("adjustment_id"),

    notes: text("notes"),

    // Audit
    createdBy: uuid("created_by").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedBy: uuid("updated_by"),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    approvedBy: uuid("approved_by"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),

    // Version
    version: integer("version").notNull().default(1),
  },
  (table) => [
    index("idx_physical_counts_tenant").on(table.tenantId),
    index("idx_physical_counts_warehouse").on(table.tenantId, table.warehouseId),
    index("idx_physical_counts_status").on(table.tenantId, table.status),
    index("idx_physical_counts_doc_number").on(
      table.tenantId,
      table.documentNumber
    ),
    index("idx_physical_counts_date").on(table.tenantId, table.countDate),
  ]
);

export const physicalCountsRelations = relations(physicalCounts, ({ one }) => ({
  tenant: one(tenants, {
    fields: [physicalCounts.tenantId],
    references: [tenants.id],
  }),
}));

export type PhysicalCountRow = typeof physicalCounts.$inferSelect;
export type NewPhysicalCountRow = typeof physicalCounts.$inferInsert;
