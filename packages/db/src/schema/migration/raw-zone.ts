/**
 * Raw Zone Tables (C01)
 *
 * Raw zone is NEVER mutated — replayable.
 */

import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  integer,
  boolean,
  jsonb,
  text,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";
import { migrationStates } from "./state";
import { type RawEntityType, type ImportStatus } from "@axis/registry/schemas";

// ============================================================================
// Import Batches
// ============================================================================

export const importBatches = pgTable(
  "migration_import_batches",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    migrationStateId: uuid("migration_state_id")
      .notNull()
      .references(() => migrationStates.id, { onDelete: "cascade" }),

    // Batch metadata
    batchNumber: integer("batch_number").notNull(),
    label: varchar("label", { length: 255 }),

    // Source
    sourceTableName: varchar("source_table_name", { length: 255 }).notNull(),
    mappingVersionId: uuid("mapping_version_id"),

    // Status
    status: varchar("status", { length: 20 })
      .notNull()
      .default("pending")
      .$type<ImportStatus>(),

    // Metrics
    totalRecords: integer("total_records").notNull().default(0),
    processedRecords: integer("processed_records").notNull().default(0),
    successRecords: integer("success_records").notNull().default(0),
    errorRecords: integer("error_records").notNull().default(0),
    skippedRecords: integer("skipped_records").notNull().default(0),

    // Timing
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    durationMs: integer("duration_ms"),

    // Error summary (JSONB)
    errors: jsonb("errors"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdBy: uuid("created_by").notNull(),
  },
  (table) => [
    index("idx_import_batches_tenant").on(table.tenantId),
    index("idx_import_batches_migration").on(table.migrationStateId),
    index("idx_import_batches_status").on(table.tenantId, table.status),
  ]
);

export const importBatchesRelations = relations(importBatches, ({ one }) => ({
  tenant: one(tenants, {
    fields: [importBatches.tenantId],
    references: [tenants.id],
  }),
  migrationState: one(migrationStates, {
    fields: [importBatches.migrationStateId],
    references: [migrationStates.id],
  }),
}));

export type ImportBatchRow = typeof importBatches.$inferSelect;
export type NewImportBatchRow = typeof importBatches.$inferInsert;

// ============================================================================
// Raw Records
// ============================================================================

export const rawRecords = pgTable(
  "migration_raw_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    importBatchId: uuid("import_batch_id")
      .notNull()
      .references(() => importBatches.id, { onDelete: "cascade" }),

    // Source reference
    sourceTableName: varchar("source_table_name", { length: 255 }).notNull(),
    sourcePrimaryKey: varchar("source_primary_key", { length: 255 }),

    // Raw data (JSONB — untouched from source)
    rawData: jsonb("raw_data").notNull(),

    // Entity classification
    entityType: varchar("entity_type", { length: 50 })
      .notNull()
      .default("unknown")
      .$type<RawEntityType>(),

    // Processing status
    isProcessed: boolean("is_processed").notNull().default(false),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    normalizedRecordId: uuid("normalized_record_id"),

    // Errors
    hasError: boolean("has_error").notNull().default(false),
    errorMessage: text("error_message"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_raw_records_tenant").on(table.tenantId),
    index("idx_raw_records_batch").on(table.importBatchId),
    index("idx_raw_records_entity").on(table.tenantId, table.entityType),
    index("idx_raw_records_processed").on(table.tenantId, table.isProcessed),
    index("idx_raw_records_error").on(table.tenantId, table.hasError),
  ]
);

export const rawRecordsRelations = relations(rawRecords, ({ one }) => ({
  tenant: one(tenants, {
    fields: [rawRecords.tenantId],
    references: [tenants.id],
  }),
  importBatch: one(importBatches, {
    fields: [rawRecords.importBatchId],
    references: [importBatches.id],
  }),
}));

export type RawRecordRow = typeof rawRecords.$inferSelect;
export type NewRawRecordRow = typeof rawRecords.$inferInsert;
