/**
 * Cutover Rollback Tables (C05)
 *
 * "Reversible. Raw zone preserved."
 */

import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  jsonb,
  integer,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";
import { migrationStates } from "../migration/state";
import { cutoverExecutions } from "./execution";
import {
  type RollbackTrigger,
  type CutoverStatus,
  type DeltaTransaction,
} from "@axis/registry/schemas";

export const rollbackExecutions = pgTable(
  "cutover_rollbacks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    migrationStateId: uuid("migration_state_id")
      .notNull()
      .references(() => migrationStates.id, { onDelete: "cascade" }),
    cutoverExecutionId: uuid("cutover_execution_id")
      .notNull()
      .references(() => cutoverExecutions.id, { onDelete: "cascade" }),

    // Trigger
    trigger: varchar("trigger", { length: 50 })
      .notNull()
      .$type<RollbackTrigger>(),
    triggerDetails: varchar("trigger_details", { length: 2000 }),

    // Authorization
    authorizedBy: uuid("authorized_by").notNull(),
    authorizedAt: timestamp("authorized_at", { withTimezone: true }).notNull(),
    authorizationNote: varchar("authorization_note", { length: 2000 }),

    // Delta capture
    deltaTransactionCount: integer("delta_transaction_count").notNull().default(0),
    deltaTransactions: jsonb("delta_transactions")
      .$type<DeltaTransaction[]>()
      .notNull()
      .default([]),
    deltaCapturedAt: timestamp("delta_captured_at", { withTimezone: true }),

    // Execution steps (JSONB)
    steps: jsonb("steps")
      .$type<{
        axisDisabled: { status: CutoverStatus; completedAt?: string };
        legacyReenabled: { status: CutoverStatus; completedAt?: string };
        deltaApplied: {
          status: CutoverStatus;
          applied: boolean;
          appliedCount?: number;
          failedCount?: number;
          completedAt?: string;
        };
        verified: { status: CutoverStatus; completedAt?: string };
      }>()
      .notNull(),

    // Status
    overallStatus: varchar("overall_status", { length: 30 })
      .notNull()
      .default("in_progress")
      .$type<CutoverStatus>(),

    // Timing
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    durationMs: integer("duration_ms"),

    // Post-mortem
    postMortemScheduled: boolean("post_mortem_scheduled").notNull().default(false),
    postMortemScheduledAt: timestamp("post_mortem_scheduled_at", { withTimezone: true }),
    postMortemNotes: varchar("post_mortem_notes", { length: 5000 }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_rollbacks_tenant").on(table.tenantId),
    index("idx_rollbacks_cutover").on(table.cutoverExecutionId),
    index("idx_rollbacks_status").on(table.overallStatus),
  ]
);

export const rollbackExecutionsRelations = relations(rollbackExecutions, ({ one }) => ({
  tenant: one(tenants, {
    fields: [rollbackExecutions.tenantId],
    references: [tenants.id],
  }),
  migrationState: one(migrationStates, {
    fields: [rollbackExecutions.migrationStateId],
    references: [migrationStates.id],
  }),
  cutoverExecution: one(cutoverExecutions, {
    fields: [rollbackExecutions.cutoverExecutionId],
    references: [cutoverExecutions.id],
  }),
}));

export type RollbackExecutionRow = typeof rollbackExecutions.$inferSelect;
export type NewRollbackExecutionRow = typeof rollbackExecutions.$inferInsert;
