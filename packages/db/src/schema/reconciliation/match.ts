/**
 * Match Record Table (B09)
 *
 * Matching results between source and target records.
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
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";
import { reconciliationJobs } from "./job";
import { type ReconMatchStatus } from "@axis/registry/schemas";

export const matchRecords = pgTable(
  "recon_match_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    jobId: uuid("job_id")
      .notNull()
      .references(() => reconciliationJobs.id, { onDelete: "cascade" }),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Match status
    matchStatus: varchar("match_status", { length: 20 })
      .notNull()
      .$type<ReconMatchStatus>(),

    // Source record
    sourceType: varchar("source_type", { length: 50 }).notNull(),
    sourceId: uuid("source_id").notNull(),
    sourceReference: varchar("source_reference", { length: 100 }),
    sourceDate: timestamp("source_date", { withTimezone: true }).notNull(),
    sourceAmount: numeric("source_amount", { precision: 18, scale: 4 }).notNull(),
    sourceCurrency: varchar("source_currency", { length: 3 }).notNull(),

    // Target record (if matched)
    targetType: varchar("target_type", { length: 50 }),
    targetId: uuid("target_id"),
    targetReference: varchar("target_reference", { length: 100 }),
    targetDate: timestamp("target_date", { withTimezone: true }),
    targetAmount: numeric("target_amount", { precision: 18, scale: 4 }),
    targetCurrency: varchar("target_currency", { length: 3 }),

    // Variance
    amountVariance: numeric("amount_variance", { precision: 18, scale: 4 })
      .notNull()
      .default("0"),
    dateVarianceDays: integer("date_variance_days").notNull().default(0),

    // Match confidence
    matchScore: numeric("match_score", { precision: 5, scale: 2 }),
    matchReason: text("match_reason"),

    // Manual match
    matchedBy: uuid("matched_by"),
    matchedAt: timestamp("matched_at", { withTimezone: true }),
    matchNotes: text("match_notes"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_recon_match_job").on(table.jobId),
    index("idx_recon_match_tenant").on(table.tenantId),
    index("idx_recon_match_status").on(table.jobId, table.matchStatus),
    index("idx_recon_match_source").on(table.jobId, table.sourceType, table.sourceId),
    index("idx_recon_match_target").on(table.jobId, table.targetType, table.targetId),
  ]
);

export const matchRecordsRelations = relations(matchRecords, ({ one }) => ({
  job: one(reconciliationJobs, {
    fields: [matchRecords.jobId],
    references: [reconciliationJobs.id],
  }),
  tenant: one(tenants, {
    fields: [matchRecords.tenantId],
    references: [tenants.id],
  }),
}));

export type MatchRecordRow = typeof matchRecords.$inferSelect;
export type NewMatchRecordRow = typeof matchRecords.$inferInsert;
