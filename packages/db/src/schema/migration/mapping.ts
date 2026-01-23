/**
 * Column Mapping Tables (C01)
 *
 * The Machine understands columns, not ERPs.
 */

import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  integer,
  boolean,
  jsonb,
  numeric,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";
import { migrationStates } from "./state";
import {
  type RawEntityType,
  type ColumnSemanticType,
  type MappingConfidence,
  type MappingStatus,
  type SourceColumn,
} from "@axis/registry/schemas";

// ============================================================================
// Source Tables
// ============================================================================

export const sourceTables = pgTable(
  "migration_source_tables",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    migrationStateId: uuid("migration_state_id")
      .notNull()
      .references(() => migrationStates.id, { onDelete: "cascade" }),

    // Table metadata
    schemaName: varchar("schema_name", { length: 255 }),
    tableName: varchar("table_name", { length: 255 }).notNull(),
    rowCount: integer("row_count"),

    // Columns (JSONB)
    columns: jsonb("columns").$type<SourceColumn[]>().notNull().default([]),

    // Entity type detection
    detectedEntityType: varchar("detected_entity_type", { length: 50 }).$type<RawEntityType>(),
    entityTypeConfidence: numeric("entity_type_confidence", {
      precision: 5,
      scale: 4,
    }),

    // Mapping status
    isMapped: boolean("is_mapped").notNull().default(false),
    mappedToEntity: varchar("mapped_to_entity", { length: 100 }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_source_tables_tenant").on(table.tenantId),
    index("idx_source_tables_migration").on(table.migrationStateId),
    index("idx_source_tables_name").on(table.tenantId, table.tableName),
  ]
);

export const sourceTablesRelations = relations(sourceTables, ({ one }) => ({
  tenant: one(tenants, {
    fields: [sourceTables.tenantId],
    references: [tenants.id],
  }),
  migrationState: one(migrationStates, {
    fields: [sourceTables.migrationStateId],
    references: [migrationStates.id],
  }),
}));

export type SourceTableRow = typeof sourceTables.$inferSelect;
export type NewSourceTableRow = typeof sourceTables.$inferInsert;

// ============================================================================
// Column Mappings
// ============================================================================

export const columnMappings = pgTable(
  "migration_column_mappings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    sourceTableId: uuid("source_table_id")
      .notNull()
      .references(() => sourceTables.id, { onDelete: "cascade" }),

    // Source column
    sourceColumnName: varchar("source_column_name", { length: 255 }).notNull(),
    sourceDataType: varchar("source_data_type", { length: 100 }).notNull(),

    // Target mapping
    targetEntity: varchar("target_entity", { length: 100 }).notNull(),
    targetField: varchar("target_field", { length: 100 }).notNull(),

    // Semantic classification
    semanticType: varchar("semantic_type", { length: 50 }).$type<ColumnSemanticType>(),

    // Confidence
    confidence: varchar("confidence", { length: 20 })
      .notNull()
      .default("uncertain")
      .$type<MappingConfidence>(),
    confidenceScore: numeric("confidence_score", { precision: 5, scale: 4 }),
    confidenceFactors: jsonb("confidence_factors"),

    // Status
    status: varchar("status", { length: 30 })
      .notNull()
      .default("unmapped")
      .$type<MappingStatus>(),

    // Transformation
    transformationRule: varchar("transformation_rule", { length: 500 }),
    defaultValue: jsonb("default_value"),

    // User override
    overriddenBy: uuid("overridden_by"),
    overriddenAt: timestamp("overridden_at", { withTimezone: true }),
    overrideReason: varchar("override_reason", { length: 500 }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_column_mappings_tenant").on(table.tenantId),
    index("idx_column_mappings_source").on(table.sourceTableId),
    index("idx_column_mappings_target").on(table.targetEntity, table.targetField),
    index("idx_column_mappings_status").on(table.tenantId, table.status),
  ]
);

export const columnMappingsRelations = relations(columnMappings, ({ one }) => ({
  tenant: one(tenants, {
    fields: [columnMappings.tenantId],
    references: [tenants.id],
  }),
  sourceTable: one(sourceTables, {
    fields: [columnMappings.sourceTableId],
    references: [sourceTables.id],
  }),
}));

export type ColumnMappingRow = typeof columnMappings.$inferSelect;
export type NewColumnMappingRow = typeof columnMappings.$inferInsert;
