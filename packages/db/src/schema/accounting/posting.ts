/**
 * Ledger Posting Tables (B07)
 *
 * Immutable ledger entries.
 */

import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  integer,
  numeric,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";
import { journalEntries } from "./journal";
import { glAccounts } from "./coa";

// ============================================================================
// Posting Batch Table
// ============================================================================

export const glPostingBatches = pgTable(
  "gl_posting_batches",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Source (cross-domain reference by UUID, not FK per B02)
    sourceDocumentType: varchar("source_document_type", {
      length: 50,
    }).notNull(),
    sourceDocumentId: uuid("source_document_id").notNull(),
    sourceDocumentNumber: varchar("source_document_number", {
      length: 50,
    }).notNull(),

    // Status
    status: varchar("status", { length: 20 }).notNull().default("open"),

    // Totals
    totalDebit: numeric("total_debit", { precision: 18, scale: 4 }).notNull(),
    totalCredit: numeric("total_credit", { precision: 18, scale: 4 }).notNull(),

    // Balance check
    isBalanced: boolean("is_balanced").notNull(),

    // Seal timestamp
    sealedAt: timestamp("sealed_at", { withTimezone: true }),
    sealedBy: uuid("sealed_by"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_gl_posting_batches_tenant").on(table.tenantId),
    index("idx_gl_posting_batches_source").on(
      table.tenantId,
      table.sourceDocumentType,
      table.sourceDocumentId
    ),
    index("idx_gl_posting_batches_status").on(table.tenantId, table.status),
  ]
);

export const glPostingBatchesRelations = relations(
  glPostingBatches,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [glPostingBatches.tenantId],
      references: [tenants.id],
    }),
  })
);

export type GlPostingBatchRow = typeof glPostingBatches.$inferSelect;
export type NewGlPostingBatchRow = typeof glPostingBatches.$inferInsert;

// ============================================================================
// Ledger Posting Table
// ============================================================================

export const glLedgerPostings = pgTable(
  "gl_ledger_postings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Batch (same domain, FK allowed)
    postingBatchId: uuid("posting_batch_id")
      .notNull()
      .references(() => glPostingBatches.id),

    // Journal reference (same domain, FK allowed)
    journalId: uuid("journal_id")
      .notNull()
      .references(() => journalEntries.id),
    journalNumber: varchar("journal_number", { length: 50 }).notNull(),
    journalLineNumber: integer("journal_line_number").notNull(),

    // Account (same domain, FK allowed)
    accountId: uuid("account_id")
      .notNull()
      .references(() => glAccounts.id),
    accountCode: varchar("account_code", { length: 20 }).notNull(),

    // Amounts
    debit: numeric("debit", { precision: 18, scale: 4 })
      .notNull()
      .default("0"),
    credit: numeric("credit", { precision: 18, scale: 4 })
      .notNull()
      .default("0"),

    // Currency
    currency: varchar("currency", { length: 3 }).notNull(),
    exchangeRate: numeric("exchange_rate", { precision: 12, scale: 6 }).notNull(),
    baseCurrencyDebit: numeric("base_currency_debit", {
      precision: 18,
      scale: 4,
    })
      .notNull()
      .default("0"),
    baseCurrencyCredit: numeric("base_currency_credit", {
      precision: 18,
      scale: 4,
    })
      .notNull()
      .default("0"),

    // Subledger (reference by UUID, not FK per B02)
    partyId: uuid("party_id"),

    // Dimensions
    costCenterId: uuid("cost_center_id"),
    projectId: uuid("project_id"),

    // Dates
    effectiveDate: timestamp("effective_date", { withTimezone: true }).notNull(),

    // Period
    fiscalPeriodId: uuid("fiscal_period_id").notNull(),
    fiscalYear: integer("fiscal_year").notNull(),
    fiscalMonth: integer("fiscal_month").notNull(),

    // Source (cross-domain reference by UUID, not FK per B02)
    sourceDocumentType: varchar("source_document_type", { length: 50 }),
    sourceDocumentId: uuid("source_document_id"),

    // Immutability flag
    isPosted: boolean("is_posted").notNull().default(true),
    postedAt: timestamp("posted_at", { withTimezone: true }).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_gl_ledger_postings_tenant").on(table.tenantId),
    index("idx_gl_ledger_postings_batch").on(
      table.tenantId,
      table.postingBatchId
    ),
    index("idx_gl_ledger_postings_journal").on(table.tenantId, table.journalId),
    index("idx_gl_ledger_postings_account").on(table.tenantId, table.accountId),
    index("idx_gl_ledger_postings_effective").on(
      table.tenantId,
      table.effectiveDate
    ),
    index("idx_gl_ledger_postings_period").on(
      table.tenantId,
      table.fiscalYear,
      table.fiscalMonth
    ),
    index("idx_gl_ledger_postings_party").on(table.tenantId, table.partyId),
  ]
);

export const glLedgerPostingsRelations = relations(
  glLedgerPostings,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [glLedgerPostings.tenantId],
      references: [tenants.id],
    }),
    postingBatch: one(glPostingBatches, {
      fields: [glLedgerPostings.postingBatchId],
      references: [glPostingBatches.id],
    }),
    journal: one(journalEntries, {
      fields: [glLedgerPostings.journalId],
      references: [journalEntries.id],
    }),
    account: one(glAccounts, {
      fields: [glLedgerPostings.accountId],
      references: [glAccounts.id],
    }),
  })
);

export type GlLedgerPostingRow = typeof glLedgerPostings.$inferSelect;
export type NewGlLedgerPostingRow = typeof glLedgerPostings.$inferInsert;
