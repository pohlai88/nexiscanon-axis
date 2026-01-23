/**
 * Migration Reconciliation Tables (C04)
 *
 * "Proving Balance: Legacy ↔ AXIS"
 */

import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  jsonb,
  numeric,
  integer,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";
import { migrationStates } from "../migration/state";
import {
  type MigrationReconType,
  type DualLedgerReconStatus,
  type ReconDetail,
  type ReconExceptionSummary,
} from "@axis/registry/schemas";

// ============================================================================
// Migration Reconciliations
// ============================================================================

export const migrationRecons = pgTable(
  "dual_ledger_recons",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    migrationStateId: uuid("migration_state_id")
      .notNull()
      .references(() => migrationStates.id, { onDelete: "cascade" }),

    // Type
    reconType: varchar("recon_type", { length: 50 })
      .notNull()
      .$type<MigrationReconType>(),

    // Timing
    asOfDate: timestamp("as_of_date", { withTimezone: true }).notNull(),
    executedAt: timestamp("executed_at", { withTimezone: true }).notNull(),

    // Totals
    legacyTotal: numeric("legacy_total", { precision: 20, scale: 4 }).notNull(),
    axisTotal: numeric("axis_total", { precision: 20, scale: 4 }).notNull(),
    variance: numeric("variance", { precision: 20, scale: 4 }).notNull(),
    variancePercent: numeric("variance_percent", { precision: 10, scale: 4 }).notNull(),

    // Tolerance
    toleranceAmount: numeric("tolerance_amount", { precision: 20, scale: 4 }).notNull(),
    tolerancePercent: numeric("tolerance_percent", { precision: 10, scale: 4 }).notNull(),

    // Status
    status: varchar("status", { length: 30 })
      .notNull()
      .$type<DualLedgerReconStatus>(),

    // Details (JSONB)
    details: jsonb("details")
      .$type<ReconDetail[]>()
      .notNull()
      .default([]),

    // Exceptions
    exceptionCount: integer("exception_count").notNull().default(0),
    exceptions: jsonb("exceptions").$type<ReconExceptionSummary[]>(),

    // Execution
    durationMs: integer("duration_ms"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_recons_tenant").on(table.tenantId),
    index("idx_recons_migration").on(table.migrationStateId),
    index("idx_recons_type").on(table.reconType),
    index("idx_recons_status").on(table.status),
    index("idx_recons_date").on(table.migrationStateId, table.asOfDate),
  ]
);

export const migrationReconsRelations = relations(migrationRecons, ({ one }) => ({
  tenant: one(tenants, {
    fields: [migrationRecons.tenantId],
    references: [tenants.id],
  }),
  migrationState: one(migrationStates, {
    fields: [migrationRecons.migrationStateId],
    references: [migrationStates.id],
  }),
}));

export type MigrationReconRow = typeof migrationRecons.$inferSelect;
export type NewMigrationReconRow = typeof migrationRecons.$inferInsert;

// ============================================================================
// Reconciliation Runs
// ============================================================================

export const reconRuns = pgTable(
  "dual_ledger_recon_runs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    migrationStateId: uuid("migration_state_id")
      .notNull()
      .references(() => migrationStates.id, { onDelete: "cascade" }),

    // Run info
    triggeredBy: varchar("triggered_by", { length: 30 }).notNull(),
    triggeredByUserId: uuid("triggered_by_user_id"),

    // Timing
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    durationMs: integer("duration_ms"),

    // Types included
    reconTypes: jsonb("recon_types")
      .$type<MigrationReconType[]>()
      .notNull()
      .default([]),

    // Results (JSONB)
    results: jsonb("results")
      .$type<{ reconType: MigrationReconType; reconId: string; status: DualLedgerReconStatus; variance: string }[]>()
      .notNull()
      .default([]),

    // Summary
    allMatched: boolean("all_matched").notNull().default(false),
    failedCount: integer("failed_count").notNull().default(0),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_recon_runs_tenant").on(table.tenantId),
    index("idx_recon_runs_migration").on(table.migrationStateId),
    index("idx_recon_runs_started").on(table.startedAt),
  ]
);

export const reconRunsRelations = relations(reconRuns, ({ one }) => ({
  tenant: one(tenants, {
    fields: [reconRuns.tenantId],
    references: [tenants.id],
  }),
  migrationState: one(migrationStates, {
    fields: [reconRuns.migrationStateId],
    references: [migrationStates.id],
  }),
}));

export type ReconRunRow = typeof reconRuns.$inferSelect;
export type NewReconRunRow = typeof reconRuns.$inferInsert;
