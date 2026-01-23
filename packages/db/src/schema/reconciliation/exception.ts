/**
 * Reconciliation Exception Table (B09)
 *
 * Exception tracking and resolution.
 */

import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  numeric,
  boolean,
  text,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";
import { reconciliationJobs } from "./job";
import { matchRecords } from "./match";
import { journalEntries } from "../accounting/journal";
import {
  type ExceptionType,
  type ExceptionStatus,
  type ExceptionSeverity,
  type ResolutionType,
} from "@axis/registry/schemas";

export const reconciliationExceptions = pgTable(
  "recon_exceptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    jobId: uuid("job_id")
      .notNull()
      .references(() => reconciliationJobs.id, { onDelete: "cascade" }),
    matchRecordId: uuid("match_record_id").references(() => matchRecords.id, {
      onDelete: "set null",
    }),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Classification
    exceptionType: varchar("exception_type", { length: 30 })
      .notNull()
      .$type<ExceptionType>(),
    severity: varchar("severity", { length: 20 })
      .notNull()
      .default("medium")
      .$type<ExceptionSeverity>(),

    // Status
    status: varchar("status", { length: 20 })
      .notNull()
      .default("open")
      .$type<ExceptionStatus>(),

    // Details
    sourceType: varchar("source_type", { length: 50 }),
    sourceId: uuid("source_id"),
    sourceReference: varchar("source_reference", { length: 100 }),
    sourceAmount: numeric("source_amount", { precision: 18, scale: 4 }),

    targetType: varchar("target_type", { length: 50 }),
    targetId: uuid("target_id"),
    targetReference: varchar("target_reference", { length: 100 }),
    targetAmount: numeric("target_amount", { precision: 18, scale: 4 }),

    // Variance
    varianceAmount: numeric("variance_amount", { precision: 18, scale: 4 }),
    variancePercent: numeric("variance_percent", { precision: 8, scale: 4 }),

    // Description
    description: text("description").notNull(),
    suggestedAction: text("suggested_action"),

    // Investigation
    assignedTo: uuid("assigned_to"),
    investigationNotes: text("investigation_notes"),

    // Resolution
    resolutionType: varchar("resolution_type", { length: 30 }).$type<ResolutionType>(),
    resolutionNotes: text("resolution_notes"),
    resolvedBy: uuid("resolved_by"),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),

    // For adjustments
    adjustmentJournalId: uuid("adjustment_journal_id").references(
      () => journalEntries.id
    ),

    // Approval (for write-offs)
    approvalRequired: boolean("approval_required").notNull().default(false),
    approvedBy: uuid("approved_by"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_recon_exc_job").on(table.jobId),
    index("idx_recon_exc_tenant").on(table.tenantId),
    index("idx_recon_exc_status").on(table.tenantId, table.status),
    index("idx_recon_exc_type").on(table.tenantId, table.exceptionType),
    index("idx_recon_exc_severity").on(table.tenantId, table.severity),
    index("idx_recon_exc_assigned").on(table.tenantId, table.assignedTo),
    index("idx_recon_exc_open").on(table.tenantId, table.status, table.createdAt),
  ]
);

export const reconciliationExceptionsRelations = relations(
  reconciliationExceptions,
  ({ one }) => ({
    job: one(reconciliationJobs, {
      fields: [reconciliationExceptions.jobId],
      references: [reconciliationJobs.id],
    }),
    matchRecord: one(matchRecords, {
      fields: [reconciliationExceptions.matchRecordId],
      references: [matchRecords.id],
    }),
    tenant: one(tenants, {
      fields: [reconciliationExceptions.tenantId],
      references: [tenants.id],
    }),
    adjustmentJournal: one(journalEntries, {
      fields: [reconciliationExceptions.adjustmentJournalId],
      references: [journalEntries.id],
    }),
  })
);

export type ReconExceptionRow = typeof reconciliationExceptions.$inferSelect;
export type NewReconExceptionRow = typeof reconciliationExceptions.$inferInsert;
