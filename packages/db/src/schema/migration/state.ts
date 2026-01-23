/**
 * Migration State Table (C01)
 *
 * Tracks migration progress and mode transitions.
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
import {
  type MigrationMode,
  type SourceSystemType,
  type SyncFrequency,
  type ReconStatusBlock,
} from "@axis/registry/schemas";

export const migrationStates = pgTable(
  "migration_states",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Current mode
    currentMode: varchar("current_mode", { length: 20 })
      .notNull()
      .default("setup")
      .$type<MigrationMode>(),

    // Source system
    sourceSystem: varchar("source_system", { length: 50 })
      .notNull()
      .$type<SourceSystemType>(),
    sourceVersion: varchar("source_version", { length: 50 }),
    sourceConnectionId: uuid("source_connection_id"),

    // Sync configuration
    lastSyncAt: timestamp("last_sync_at", { withTimezone: true }),
    syncFrequency: varchar("sync_frequency", { length: 20 })
      .notNull()
      .default("manual")
      .$type<SyncFrequency>(),

    // Reconciliation status (JSONB)
    reconciliationStatus: jsonb("reconciliation_status")
      .$type<ReconStatusBlock>()
      .notNull()
      .default({
        trialBalance: "pending",
        arAging: "pending",
        apAging: "pending",
        inventory: "pending",
      }),

    // Gate readiness
    readyForMirror: boolean("ready_for_mirror").notNull().default(false),
    readyForParallel: boolean("ready_for_parallel").notNull().default(false),
    readyForCutover: boolean("ready_for_cutover").notNull().default(false),

    // Milestone dates
    setupStartedAt: timestamp("setup_started_at", { withTimezone: true }),
    mirrorStartedAt: timestamp("mirror_started_at", { withTimezone: true }),
    parallelStartedAt: timestamp("parallel_started_at", { withTimezone: true }),
    cutoverAt: timestamp("cutover_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),

    // Metrics
    totalRecordsImported: integer("total_records_imported").notNull().default(0),
    totalErrors: integer("total_errors").notNull().default(0),
    mappingConfidenceAvg: numeric("mapping_confidence_avg", {
      precision: 5,
      scale: 4,
    }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdBy: uuid("created_by").notNull(),
  },
  (table) => [
    index("idx_migration_state_tenant").on(table.tenantId),
    index("idx_migration_state_mode").on(table.tenantId, table.currentMode),
  ]
);

export const migrationStatesRelations = relations(migrationStates, ({ one }) => ({
  tenant: one(tenants, {
    fields: [migrationStates.tenantId],
    references: [tenants.id],
  }),
}));

export type MigrationStateRow = typeof migrationStates.$inferSelect;
export type NewMigrationStateRow = typeof migrationStates.$inferInsert;
