/**
 * Bank Statement Tables (B09)
 *
 * Bank statement import and line items.
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
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";
import { reconciliationJobs } from "./job";
import {
  type BankTransactionType,
  type ImportSource,
} from "@axis/registry/schemas";

// ============================================================================
// Bank Statements Table
// ============================================================================

export const bankStatements = pgTable(
  "recon_bank_statements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Bank account (cross-domain reference by UUID)
    bankAccountId: uuid("bank_account_id").notNull(),
    bankAccountName: varchar("bank_account_name", { length: 255 }).notNull(),

    // Statement info
    statementNumber: varchar("statement_number", { length: 50 }).notNull(),
    statementDate: timestamp("statement_date", { withTimezone: true }).notNull(),
    periodStart: timestamp("period_start", { withTimezone: true }).notNull(),
    periodEnd: timestamp("period_end", { withTimezone: true }).notNull(),

    // Balances
    openingBalance: numeric("opening_balance", { precision: 18, scale: 4 }).notNull(),
    closingBalance: numeric("closing_balance", { precision: 18, scale: 4 }).notNull(),

    // Import info
    importedAt: timestamp("imported_at", { withTimezone: true }).notNull(),
    importedBy: uuid("imported_by").notNull(),
    importSource: varchar("import_source", { length: 20 })
      .notNull()
      .default("manual")
      .$type<ImportSource>(),
    importFileName: varchar("import_file_name", { length: 255 }),

    // Reconciliation (same domain, FK allowed)
    reconciliationJobId: uuid("reconciliation_job_id").references(
      () => reconciliationJobs.id
    ),
    isReconciled: boolean("is_reconciled").notNull().default(false),
    reconciledAt: timestamp("reconciled_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("uq_recon_bank_stmt_number").on(
      table.tenantId,
      table.bankAccountId,
      table.statementNumber
    ),
    index("idx_recon_bank_stmt_tenant").on(table.tenantId),
    index("idx_recon_bank_stmt_account").on(table.tenantId, table.bankAccountId),
    index("idx_recon_bank_stmt_period").on(
      table.tenantId,
      table.bankAccountId,
      table.periodStart,
      table.periodEnd
    ),
    index("idx_recon_bank_stmt_reconciled").on(
      table.tenantId,
      table.isReconciled
    ),
  ]
);

export const bankStatementsRelations = relations(
  bankStatements,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [bankStatements.tenantId],
      references: [tenants.id],
    }),
    reconciliationJob: one(reconciliationJobs, {
      fields: [bankStatements.reconciliationJobId],
      references: [reconciliationJobs.id],
    }),
  })
);

export type BankStatementRow = typeof bankStatements.$inferSelect;
export type NewBankStatementRow = typeof bankStatements.$inferInsert;

// ============================================================================
// Bank Statement Lines Table
// ============================================================================

export const bankStatementLines = pgTable(
  "recon_bank_statement_lines",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    statementId: uuid("statement_id")
      .notNull()
      .references(() => bankStatements.id, { onDelete: "cascade" }),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Transaction details
    transactionDate: timestamp("transaction_date", { withTimezone: true }).notNull(),
    valueDate: timestamp("value_date", { withTimezone: true }),

    // Type
    transactionType: varchar("transaction_type", { length: 20 })
      .notNull()
      .$type<BankTransactionType>(),

    // Amounts
    debitAmount: numeric("debit_amount", { precision: 18, scale: 4 })
      .notNull()
      .default("0"),
    creditAmount: numeric("credit_amount", { precision: 18, scale: 4 })
      .notNull()
      .default("0"),
    runningBalance: numeric("running_balance", { precision: 18, scale: 4 }),

    // Reference
    reference: varchar("reference", { length: 100 }),
    description: text("description").notNull(),
    checkNumber: varchar("check_number", { length: 50 }),

    // Counterparty
    counterpartyName: varchar("counterparty_name", { length: 255 }),
    counterpartyAccount: varchar("counterparty_account", { length: 50 }),

    // Matching
    isReconciled: boolean("is_reconciled").notNull().default(false),
    matchedToType: varchar("matched_to_type", { length: 50 }),
    matchedToId: uuid("matched_to_id"),
    matchedAt: timestamp("matched_at", { withTimezone: true }),
    matchedBy: uuid("matched_by"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_recon_bank_line_stmt").on(table.statementId),
    index("idx_recon_bank_line_tenant").on(table.tenantId),
    index("idx_recon_bank_line_date").on(table.statementId, table.transactionDate),
    index("idx_recon_bank_line_type").on(table.statementId, table.transactionType),
    index("idx_recon_bank_line_reconciled").on(table.statementId, table.isReconciled),
    index("idx_recon_bank_line_ref").on(table.statementId, table.reference),
  ]
);

export const bankStatementLinesRelations = relations(
  bankStatementLines,
  ({ one }) => ({
    statement: one(bankStatements, {
      fields: [bankStatementLines.statementId],
      references: [bankStatements.id],
    }),
    tenant: one(tenants, {
      fields: [bankStatementLines.tenantId],
      references: [tenants.id],
    }),
  })
);

export type BankStatementLineRow = typeof bankStatementLines.$inferSelect;
export type NewBankStatementLineRow = typeof bankStatementLines.$inferInsert;
