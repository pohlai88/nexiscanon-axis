/**
 * Cutover Execution Tables (C05)
 *
 * "A state machine transition, not a leap of faith."
 */

import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  jsonb,
  integer,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";
import { migrationStates } from "../migration/state";
import {
  type CutoverPhase,
  type CutoverStatus,
  type PhaseStatus,
  type FreezePhase,
  type SwitchPhase,
  type ValidationPhase,
  type CutoverParticipant,
  type FinalSignoff,
} from "@axis/registry/schemas";

export const cutoverExecutions = pgTable(
  "cutover_executions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    migrationStateId: uuid("migration_state_id")
      .notNull()
      .references(() => migrationStates.id, { onDelete: "cascade" }),

    // Scheduling
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
    freezeWindowStart: timestamp("freeze_window_start", { withTimezone: true }).notNull(),
    freezeWindowEnd: timestamp("freeze_window_end", { withTimezone: true }).notNull(),
    freezeWindowHours: integer("freeze_window_hours").notNull().default(4),

    // Current phase
    currentPhase: varchar("current_phase", { length: 30 })
      .notNull()
      .$type<CutoverPhase>(),

    // Phase status (JSONB)
    phases: jsonb("phases")
      .$type<{
        preparation: PhaseStatus;
        freeze: FreezePhase;
        switch: SwitchPhase;
        validation: ValidationPhase;
        completion: PhaseStatus;
      }>()
      .notNull(),

    // Overall status
    overallStatus: varchar("overall_status", { length: 30 })
      .notNull()
      .default("not_started")
      .$type<CutoverStatus>(),

    // Participants
    cutoverLead: uuid("cutover_lead").notNull(),
    participants: jsonb("participants")
      .$type<CutoverParticipant[]>()
      .notNull()
      .default([]),

    // Final sign-off (JSONB)
    finalSignOff: jsonb("final_sign_off").$type<FinalSignoff>(),

    // Timing
    actualStartedAt: timestamp("actual_started_at", { withTimezone: true }),
    actualCompletedAt: timestamp("actual_completed_at", { withTimezone: true }),
    totalDurationMs: integer("total_duration_ms"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_executions_tenant").on(table.tenantId),
    index("idx_executions_migration").on(table.migrationStateId),
    index("idx_executions_status").on(table.overallStatus),
    index("idx_executions_phase").on(table.currentPhase),
    index("idx_executions_scheduled").on(table.scheduledAt),
  ]
);

export const cutoverExecutionsRelations = relations(cutoverExecutions, ({ one }) => ({
  tenant: one(tenants, {
    fields: [cutoverExecutions.tenantId],
    references: [tenants.id],
  }),
  migrationState: one(migrationStates, {
    fields: [cutoverExecutions.migrationStateId],
    references: [migrationStates.id],
  }),
}));

export type CutoverExecutionRow = typeof cutoverExecutions.$inferSelect;
export type NewCutoverExecutionRow = typeof cutoverExecutions.$inferInsert;
