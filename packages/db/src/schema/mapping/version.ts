/**
 * Mapping Version Tables (C03)
 *
 * Versioned snapshots for trial imports.
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
import { migrationStates } from "../migration/state";
import {
  type MappingVersionStatus,
  type TrialImportStatus,
  type MappingChange,
} from "@axis/registry/schemas";

// ============================================================================
// Mapping Versions
// ============================================================================

export const mappingVersions = pgTable(
  "mapping_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    migrationStateId: uuid("migration_state_id")
      .notNull()
      .references(() => migrationStates.id, { onDelete: "cascade" }),

    // Version number
    version: integer("version").notNull(),
    label: varchar("label", { length: 255 }),

    // Status
    status: varchar("status", { length: 30 })
      .notNull()
      .default("draft")
      .$type<MappingVersionStatus>(),

    // Snapshot counts
    columnMappingCount: integer("column_mapping_count").notNull().default(0),
    coaMappingCount: integer("coa_mapping_count").notNull().default(0),
    aliasMappingCount: integer("alias_mapping_count").notNull().default(0),
    taxMappingCount: integer("tax_mapping_count").notNull().default(0),

    // Confidence metrics
    overallConfidence: numeric("overall_confidence", { precision: 5, scale: 4 })
      .notNull()
      .default("0"),
    autoAcceptedCount: integer("auto_accepted_count").notNull().default(0),
    pendingReviewCount: integer("pending_review_count").notNull().default(0),
    confirmedCount: integer("confirmed_count").notNull().default(0),
    exceptionCount: integer("exception_count").notNull().default(0),

    // Changes (JSONB)
    changes: jsonb("changes").$type<MappingChange[]>().notNull().default([]),

    // Trial import reference
    trialImportId: uuid("trial_import_id"),
    trialImportStatus: varchar("trial_import_status", { length: 30 })
      .$type<TrialImportStatus>(),
    trialImportResult: jsonb("trial_import_result"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdBy: uuid("created_by").notNull(),
  },
  (table) => [
    index("idx_mapping_versions_tenant").on(table.tenantId),
    index("idx_mapping_versions_migration").on(table.migrationStateId),
    index("idx_mapping_versions_status").on(table.status),
    index("idx_mapping_versions_number").on(table.migrationStateId, table.version),
  ]
);

export const mappingVersionsRelations = relations(mappingVersions, ({ one }) => ({
  tenant: one(tenants, {
    fields: [mappingVersions.tenantId],
    references: [tenants.id],
  }),
  migrationState: one(migrationStates, {
    fields: [mappingVersions.migrationStateId],
    references: [migrationStates.id],
  }),
}));

export type MappingVersionRow = typeof mappingVersions.$inferSelect;
export type NewMappingVersionRow = typeof mappingVersions.$inferInsert;

// ============================================================================
// Trial Imports
// ============================================================================

export const trialImports = pgTable(
  "mapping_trial_imports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    migrationStateId: uuid("migration_state_id")
      .notNull()
      .references(() => migrationStates.id, { onDelete: "cascade" }),
    mappingVersionId: uuid("mapping_version_id")
      .notNull()
      .references(() => mappingVersions.id, { onDelete: "cascade" }),

    // Status
    status: varchar("status", { length: 30 })
      .notNull()
      .default("pending")
      .$type<TrialImportStatus>(),

    // Progress
    totalRecords: integer("total_records").notNull().default(0),
    processedRecords: integer("processed_records").notNull().default(0),
    successCount: integer("success_count").notNull().default(0),
    errorCount: integer("error_count").notNull().default(0),
    skippedCount: integer("skipped_count").notNull().default(0),

    // Errors (JSONB - sample)
    errors: jsonb("errors")
      .$type<{ entityType: string; sourceId: string; error: string }[]>()
      .notNull()
      .default([]),

    // Warnings
    warnings: jsonb("warnings").$type<string[]>().notNull().default([]),

    // Timing
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    durationMs: integer("duration_ms"),

    // Cleanup
    isCleanedUp: boolean("is_cleaned_up").notNull().default(false),
    cleanedUpAt: timestamp("cleaned_up_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdBy: uuid("created_by").notNull(),
  },
  (table) => [
    index("idx_trial_imports_tenant").on(table.tenantId),
    index("idx_trial_imports_migration").on(table.migrationStateId),
    index("idx_trial_imports_version").on(table.mappingVersionId),
    index("idx_trial_imports_status").on(table.status),
  ]
);

export const trialImportsRelations = relations(trialImports, ({ one }) => ({
  tenant: one(tenants, {
    fields: [trialImports.tenantId],
    references: [tenants.id],
  }),
  migrationState: one(migrationStates, {
    fields: [trialImports.migrationStateId],
    references: [migrationStates.id],
  }),
  mappingVersion: one(mappingVersions, {
    fields: [trialImports.mappingVersionId],
    references: [mappingVersions.id],
  }),
}));

export type TrialImportRow = typeof trialImports.$inferSelect;
export type NewTrialImportRow = typeof trialImports.$inferInsert;
