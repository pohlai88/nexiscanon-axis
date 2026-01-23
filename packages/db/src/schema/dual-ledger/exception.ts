/**
 * Migration Exception Tables (C04)
 *
 * "The Machine analyzes reconciliation exceptions"
 */

import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  jsonb,
  numeric,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";
import { migrationStates } from "../migration/state";
import { migrationRecons } from "./recon";
import {
  type DualLedgerExceptionType,
  type DualLedgerExceptionStatus,
  type MigrationReconType,
  type ExceptionResolution,
  type ReconPriority,
} from "@axis/registry/schemas";

// ============================================================================
// Migration Exceptions
// ============================================================================

export const migrationExceptions = pgTable(
  "dual_ledger_exceptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    migrationStateId: uuid("migration_state_id")
      .notNull()
      .references(() => migrationStates.id, { onDelete: "cascade" }),
    reconId: uuid("recon_id")
      .notNull()
      .references(() => migrationRecons.id, { onDelete: "cascade" }),

    // Exception details
    exceptionType: varchar("exception_type", { length: 50 })
      .notNull()
      .$type<DualLedgerExceptionType>(),
    reconType: varchar("recon_type", { length: 50 })
      .notNull()
      .$type<MigrationReconType>(),

    // Affected entity
    entityType: varchar("entity_type", { length: 50 }).notNull(),
    entityKey: varchar("entity_key", { length: 255 }).notNull(),
    entityName: varchar("entity_name", { length: 500 }).notNull(),

    // Values
    legacyValue: numeric("legacy_value", { precision: 20, scale: 4 }).notNull(),
    axisValue: numeric("axis_value", { precision: 20, scale: 4 }).notNull(),
    variance: numeric("variance", { precision: 20, scale: 4 }).notNull(),
    variancePercent: numeric("variance_percent", { precision: 10, scale: 4 }),

    // Machine analysis
    suggestedAction: varchar("suggested_action", { length: 2000 }).notNull(),
    suggestedReason: varchar("suggested_reason", { length: 2000 }).notNull(),
    confidence: numeric("confidence", { precision: 5, scale: 4 }).notNull(),
    analysisContext: jsonb("analysis_context"),

    // Status
    status: varchar("status", { length: 30 })
      .notNull()
      .default("open")
      .$type<DualLedgerExceptionStatus>(),

    // Resolution (JSONB)
    resolution: jsonb("resolution").$type<ExceptionResolution>(),

    // Assignment
    assignedTo: uuid("assigned_to"),
    assignedAt: timestamp("assigned_at", { withTimezone: true }),

    // Priority
    priority: varchar("priority", { length: 20 })
      .notNull()
      .default("medium")
      .$type<ReconPriority>(),

    // Notes (JSONB)
    notes: jsonb("notes")
      .$type<{ content: string; createdBy: string; createdAt: string }[]>()
      .notNull()
      .default([]),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_exceptions_tenant").on(table.tenantId),
    index("idx_exceptions_migration").on(table.migrationStateId),
    index("idx_exceptions_recon").on(table.reconId),
    index("idx_exceptions_status").on(table.status),
    index("idx_exceptions_type").on(table.exceptionType),
    index("idx_exceptions_priority").on(table.priority),
    index("idx_exceptions_assigned").on(table.assignedTo),
  ]
);

export const migrationExceptionsRelations = relations(migrationExceptions, ({ one }) => ({
  tenant: one(tenants, {
    fields: [migrationExceptions.tenantId],
    references: [tenants.id],
  }),
  migrationState: one(migrationStates, {
    fields: [migrationExceptions.migrationStateId],
    references: [migrationStates.id],
  }),
  recon: one(migrationRecons, {
    fields: [migrationExceptions.reconId],
    references: [migrationRecons.id],
  }),
}));

export type MigrationExceptionRow = typeof migrationExceptions.$inferSelect;
export type NewMigrationExceptionRow = typeof migrationExceptions.$inferInsert;
