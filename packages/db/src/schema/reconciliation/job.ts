/**
 * Reconciliation Job Table (B09)
 *
 * Reconciliation job tracking.
 */

import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  integer,
  numeric,
  text,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";
import { fiscalPeriods } from "../accounting/period";
import {
  type ReconciliationType,
  type ReconciliationStatus,
} from "@axis/registry/schemas";

export const reconciliationJobs = pgTable(
  "recon_jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Identity
    jobNumber: varchar("job_number", { length: 50 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),

    // Type
    reconciliationType: varchar("reconciliation_type", { length: 30 })
      .notNull()
      .$type<ReconciliationType>(),

    // Scope
    fiscalPeriodId: uuid("fiscal_period_id").references(
      () => fiscalPeriods.id
    ),
    asOfDate: timestamp("as_of_date", { withTimezone: true }).notNull(),

    // Source and Target
    sourceType: varchar("source_type", { length: 50 }).notNull(),
    sourceId: uuid("source_id"),
    targetType: varchar("target_type", { length: 50 }).notNull(),
    targetId: uuid("target_id"),

    // Status
    status: varchar("status", { length: 20 })
      .notNull()
      .default("pending")
      .$type<ReconciliationStatus>(),

    // Results summary
    totalSourceRecords: integer("total_source_records").notNull().default(0),
    totalTargetRecords: integer("total_target_records").notNull().default(0),
    matchedRecords: integer("matched_records").notNull().default(0),
    unmatchedRecords: integer("unmatched_records").notNull().default(0),
    exceptionCount: integer("exception_count").notNull().default(0),

    // Amounts
    sourceTotal: numeric("source_total", { precision: 18, scale: 4 })
      .notNull()
      .default("0"),
    targetTotal: numeric("target_total", { precision: 18, scale: 4 })
      .notNull()
      .default("0"),
    varianceAmount: numeric("variance_amount", { precision: 18, scale: 4 })
      .notNull()
      .default("0"),

    // Tolerance
    toleranceAmount: numeric("tolerance_amount", { precision: 18, scale: 4 })
      .notNull()
      .default("0"),
    tolerancePercent: numeric("tolerance_percent", { precision: 5, scale: 2 })
      .notNull()
      .default("0"),

    // Execution
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),

    // Approval
    reviewedBy: uuid("reviewed_by"),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    approvedBy: uuid("approved_by"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdBy: uuid("created_by").notNull(),
  },
  (table) => [
    uniqueIndex("uq_recon_jobs_number").on(table.tenantId, table.jobNumber),
    index("idx_recon_jobs_tenant").on(table.tenantId),
    index("idx_recon_jobs_type").on(table.tenantId, table.reconciliationType),
    index("idx_recon_jobs_status").on(table.tenantId, table.status),
    index("idx_recon_jobs_date").on(table.tenantId, table.asOfDate),
    index("idx_recon_jobs_period").on(table.tenantId, table.fiscalPeriodId),
  ]
);

export const reconciliationJobsRelations = relations(
  reconciliationJobs,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [reconciliationJobs.tenantId],
      references: [tenants.id],
    }),
    fiscalPeriod: one(fiscalPeriods, {
      fields: [reconciliationJobs.fiscalPeriodId],
      references: [fiscalPeriods.id],
    }),
  })
);

export type ReconJobRow = typeof reconciliationJobs.$inferSelect;
export type NewReconJobRow = typeof reconciliationJobs.$inferInsert;
