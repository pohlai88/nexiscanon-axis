/**
 * Journal Entry Table (B07)
 *
 * Balanced double-entry accounting records.
 */

import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  jsonb,
  integer,
  numeric,
  boolean,
  text,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";
import {
  type JournalType,
  type JournalStatus,
  type JournalLine,
} from "@axis/registry/schemas";

export const journalEntries = pgTable(
  "journal_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Identity
    documentNumber: varchar("document_number", { length: 50 }).notNull(),
    journalType: varchar("journal_type", { length: 20 })
      .notNull()
      .$type<JournalType>(),

    // Description
    description: text("description").notNull(),
    reference: varchar("reference", { length: 100 }),

    // Source document (cross-domain reference by UUID, not FK per B02)
    sourceDocumentType: varchar("source_document_type", { length: 50 }),
    sourceDocumentId: uuid("source_document_id"),
    sourceDocumentNumber: varchar("source_document_number", { length: 50 }),

    // Dates
    journalDate: timestamp("journal_date", { withTimezone: true }).notNull(),
    effectiveDate: timestamp("effective_date", { withTimezone: true }).notNull(),

    // Period (reference by UUID, not FK per B02)
    fiscalPeriodId: uuid("fiscal_period_id").notNull(),
    fiscalYear: integer("fiscal_year").notNull(),
    fiscalMonth: integer("fiscal_month").notNull(),

    // Currency
    currency: varchar("currency", { length: 3 }).notNull(),
    exchangeRate: numeric("exchange_rate", { precision: 12, scale: 6 })
      .notNull()
      .default("1"),

    // Status
    status: varchar("status", { length: 20 })
      .notNull()
      .default("draft")
      .$type<JournalStatus>(),

    // Lines
    lines: jsonb("lines").notNull().$type<JournalLine[]>(),

    // Totals (must be equal)
    totalDebit: numeric("total_debit", { precision: 18, scale: 4 }).notNull(),
    totalCredit: numeric("total_credit", { precision: 18, scale: 4 }).notNull(),

    // Approval
    approvedBy: uuid("approved_by"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),

    // Posting
    postedBy: uuid("posted_by"),
    postedAt: timestamp("posted_at", { withTimezone: true }),
    postingBatchId: uuid("posting_batch_id"),

    // Reversal (same domain, FK allowed)
    isReversal: boolean("is_reversal").notNull().default(false),
    reversesJournalId: uuid("reverses_journal_id"),
    reversedByJournalId: uuid("reversed_by_journal_id"),

    // Metadata
    createdBy: uuid("created_by").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    // Version
    version: integer("version").notNull().default(1),
  },
  (table) => [
    index("idx_journal_entries_tenant").on(table.tenantId),
    index("idx_journal_entries_type").on(table.tenantId, table.journalType),
    index("idx_journal_entries_status").on(table.tenantId, table.status),
    index("idx_journal_entries_doc_number").on(
      table.tenantId,
      table.documentNumber
    ),
    index("idx_journal_entries_effective").on(
      table.tenantId,
      table.effectiveDate
    ),
    index("idx_journal_entries_period").on(
      table.tenantId,
      table.fiscalYear,
      table.fiscalMonth
    ),
    index("idx_journal_entries_source").on(
      table.tenantId,
      table.sourceDocumentType,
      table.sourceDocumentId
    ),
  ]
);

export const journalEntriesRelations = relations(journalEntries, ({ one }) => ({
  tenant: one(tenants, {
    fields: [journalEntries.tenantId],
    references: [tenants.id],
  }),
  reversesJournal: one(journalEntries, {
    fields: [journalEntries.reversesJournalId],
    references: [journalEntries.id],
  }),
}));

export type JournalEntryRow = typeof journalEntries.$inferSelect;
export type NewJournalEntryRow = typeof journalEntries.$inferInsert;
