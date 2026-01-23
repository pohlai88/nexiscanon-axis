/**
 * Transform Tables (C02)
 *
 * Transformation pipeline from source to AXIS canonical.
 */

import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  integer,
  boolean,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";
import { migrationStates } from "../migration/state";
import { sourceSchemas } from "./source";
import {
  type TransformSpec,
  type TransformChain,
} from "@axis/registry/schemas";

// ============================================================================
// Column Transform Rules
// ============================================================================

export const columnTransformRules = pgTable(
  "adapter_column_transform_rules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    sourceSchemaId: uuid("source_schema_id")
      .notNull()
      .references(() => sourceSchemas.id, { onDelete: "cascade" }),

    // Source reference
    sourceTable: varchar("source_table", { length: 255 }).notNull(),
    sourceColumn: varchar("source_column", { length: 255 }).notNull(),

    // Target reference
    targetEntity: varchar("target_entity", { length: 100 }).notNull(),
    targetField: varchar("target_field", { length: 100 }).notNull(),

    // Transform (JSONB)
    transform: jsonb("transform").$type<TransformSpec>(),
    transformChain: jsonb("transform_chain").$type<TransformChain>(),

    // Defaults
    defaultValue: jsonb("default_value"),
    isRequired: boolean("is_required").notNull().default(false),

    // Validation
    validationRegex: varchar("validation_regex", { length: 500 }),
    validationMessage: varchar("validation_message", { length: 500 }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdBy: uuid("created_by").notNull(),
  },
  (table) => [
    index("idx_transform_rules_tenant").on(table.tenantId),
    index("idx_transform_rules_source").on(table.sourceSchemaId),
    index("idx_transform_rules_table").on(table.sourceSchemaId, table.sourceTable),
    index("idx_transform_rules_target").on(table.targetEntity, table.targetField),
  ]
);

export const columnTransformRulesRelations = relations(
  columnTransformRules,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [columnTransformRules.tenantId],
      references: [tenants.id],
    }),
    sourceSchema: one(sourceSchemas, {
      fields: [columnTransformRules.sourceSchemaId],
      references: [sourceSchemas.id],
    }),
  })
);

export type ColumnTransformRuleRow = typeof columnTransformRules.$inferSelect;
export type NewColumnTransformRuleRow = typeof columnTransformRules.$inferInsert;

// ============================================================================
// Canonical Records
// ============================================================================

export const canonicalRecords = pgTable(
  "adapter_canonical_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    migrationStateId: uuid("migration_state_id")
      .notNull()
      .references(() => migrationStates.id, { onDelete: "cascade" }),

    // Source reference
    sourceTable: varchar("source_table", { length: 255 }).notNull(),
    sourceRowId: varchar("source_row_id", { length: 255 }).notNull(),
    rawRecordId: uuid("raw_record_id").notNull(),

    // Target entity
    targetEntity: varchar("target_entity", { length: 100 }).notNull(),

    // Transformed data (JSONB)
    canonicalData: jsonb("canonical_data").notNull(),

    // Validation status
    isValid: boolean("is_valid").notNull().default(false),
    validationErrors: jsonb("validation_errors")
      .$type<string[]>()
      .notNull()
      .default([]),

    // Import status
    isImported: boolean("is_imported").notNull().default(false),
    importedAt: timestamp("imported_at", { withTimezone: true }),
    importedRecordId: uuid("imported_record_id"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_canonical_records_tenant").on(table.tenantId),
    index("idx_canonical_records_migration").on(table.migrationStateId),
    index("idx_canonical_records_source").on(table.sourceTable, table.sourceRowId),
    index("idx_canonical_records_entity").on(table.targetEntity),
    index("idx_canonical_records_valid").on(table.tenantId, table.isValid),
    index("idx_canonical_records_imported").on(table.tenantId, table.isImported),
  ]
);

export const canonicalRecordsRelations = relations(
  canonicalRecords,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [canonicalRecords.tenantId],
      references: [tenants.id],
    }),
    migrationState: one(migrationStates, {
      fields: [canonicalRecords.migrationStateId],
      references: [migrationStates.id],
    }),
  })
);

export type CanonicalRecordRow = typeof canonicalRecords.$inferSelect;
export type NewCanonicalRecordRow = typeof canonicalRecords.$inferInsert;

// ============================================================================
// Transform Batches (for tracking batch transforms)
// ============================================================================

export const transformBatches = pgTable(
  "adapter_transform_batches",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    migrationStateId: uuid("migration_state_id")
      .notNull()
      .references(() => migrationStates.id, { onDelete: "cascade" }),

    // Source
    sourceTable: varchar("source_table", { length: 255 }).notNull(),
    targetEntity: varchar("target_entity", { length: 100 }).notNull(),

    // Counts
    totalRecords: integer("total_records").notNull().default(0),
    successCount: integer("success_count").notNull().default(0),
    errorCount: integer("error_count").notNull().default(0),
    skippedCount: integer("skipped_count").notNull().default(0),

    // Errors (JSONB - sample)
    errors: jsonb("errors")
      .$type<
        {
          sourceRowId: string;
          column: string;
          error: string;
          sourceValue?: unknown;
        }[]
      >()
      .notNull()
      .default([]),

    // Timing
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    durationMs: integer("duration_ms"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdBy: uuid("created_by").notNull(),
  },
  (table) => [
    index("idx_transform_batches_tenant").on(table.tenantId),
    index("idx_transform_batches_migration").on(table.migrationStateId),
  ]
);

export const transformBatchesRelations = relations(
  transformBatches,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [transformBatches.tenantId],
      references: [tenants.id],
    }),
    migrationState: one(migrationStates, {
      fields: [transformBatches.migrationStateId],
      references: [migrationStates.id],
    }),
  })
);

export type TransformBatchRow = typeof transformBatches.$inferSelect;
export type NewTransformBatchRow = typeof transformBatches.$inferInsert;
