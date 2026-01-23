/**
 * Post-Cutover Report Tables (C05)
 *
 * "Migration complete. Here's the proof."
 */

import {
  pgTable,
  timestamp,
  uuid,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";
import { migrationStates } from "../migration/state";
import { cutoverExecutions } from "./execution";
import {
  type MigrationTimeline,
  type DataSummary,
  type QualityMetrics,
} from "@axis/registry/schemas";

export const postCutoverReports = pgTable(
  "cutover_reports",
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

    // Timeline (JSONB)
    timeline: jsonb("timeline").$type<MigrationTimeline>().notNull(),

    // Data summary (JSONB)
    dataSummary: jsonb("data_summary").$type<DataSummary>().notNull(),

    // Quality metrics (JSONB)
    qualityMetrics: jsonb("quality_metrics").$type<QualityMetrics>().notNull(),

    // Sign-offs (JSONB)
    signOffs: jsonb("sign_offs")
      .$type<{
        financial: { signedBy: string; signedAt: string };
        operational: { signedBy: string; signedAt: string };
        final: { signedBy: string; signedAt: string };
      }>()
      .notNull(),

    // Participants (JSONB)
    participants: jsonb("participants")
      .$type<{ userId: string; role: string; contribution?: string }[]>()
      .notNull()
      .default([]),

    // Recommendations
    recommendations: jsonb("recommendations").$type<string[]>().notNull().default([]),

    // Lessons learned
    lessonsLearned: jsonb("lessons_learned").$type<string[]>(),

    generatedAt: timestamp("generated_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_reports_tenant").on(table.tenantId),
    index("idx_reports_migration").on(table.migrationStateId),
    index("idx_reports_cutover").on(table.cutoverExecutionId),
  ]
);

export const postCutoverReportsRelations = relations(postCutoverReports, ({ one }) => ({
  tenant: one(tenants, {
    fields: [postCutoverReports.tenantId],
    references: [tenants.id],
  }),
  migrationState: one(migrationStates, {
    fields: [postCutoverReports.migrationStateId],
    references: [migrationStates.id],
  }),
  cutoverExecution: one(cutoverExecutions, {
    fields: [postCutoverReports.cutoverExecutionId],
    references: [cutoverExecutions.id],
  }),
}));

export type PostCutoverReportRow = typeof postCutoverReports.$inferSelect;
export type NewPostCutoverReportRow = typeof postCutoverReports.$inferInsert;
