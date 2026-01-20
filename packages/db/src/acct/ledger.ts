// packages/db/src/acct/ledger.ts
// Accounting ledger tables: immutable, append-only posting journal

import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
  pgEnum,
} from "drizzle-orm/pg-core";

// ---- Enums ----

export const acctSourceTypeEnum = pgEnum("acct_source_type", [
  "SALES_INVOICE",
  "SALES_CREDIT_NOTE",
]);

export const acctDcEnum = pgEnum("acct_dc", ["DEBIT", "CREDIT"]);

// ---- Ledger Entries (Headers) ----

export const acctLedgerEntries = pgTable(
  "acct_ledger_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    tenantId: uuid("tenant_id").notNull(),

    // Human-readable entry number (sequence: acct.entry)
    entryNo: text("entry_no").notNull(),

    postedAt: timestamp("posted_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    // Source document
    sourceType: acctSourceTypeEnum("source_type").notNull(),
    sourceId: uuid("source_id").notNull(),

    // Event type: invoice.issued | invoice.cancelled | credit.issued | credit.cancelled
    eventType: text("event_type").notNull(),

    currency: text("currency").notNull(),

    memo: text("memo"),

    meta: jsonb("meta").notNull().default({}),
  },
  (t) => [
    // Prevent double-posting same event
    uniqueIndex("uq_acct_ledger_tenant_source_event").on(
      t.tenantId,
      t.sourceType,
      t.sourceId,
      t.eventType
    ),
    // Ensure unique entry numbers per tenant
    uniqueIndex("uq_acct_ledger_tenant_entry_no").on(t.tenantId, t.entryNo),

    // Query indexes
    index("idx_acct_ledger_tenant_posted_at").on(t.tenantId, t.postedAt),
    index("idx_acct_ledger_tenant_source").on(
      t.tenantId,
      t.sourceType,
      t.sourceId
    ),
  ]
);

// ---- Ledger Lines (Double-Entry Details) ----

export const acctLedgerLines = pgTable(
  "acct_ledger_lines",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    tenantId: uuid("tenant_id").notNull(),

    entryId: uuid("entry_id")
      .notNull()
      .references(() => acctLedgerEntries.id, { onDelete: "cascade" }),

    // v1 hardcoded account codes: AR, SALES_REVENUE, SALES_RETURNS
    accountCode: text("account_code").notNull(),

    dc: acctDcEnum("dc").notNull(),

    // Always positive integer (sign determined by dc)
    amountCents: integer("amount_cents").notNull(),

    description: text("description"),
  },
  (t) => [
    index("idx_acct_ledger_lines_tenant_entry").on(t.tenantId, t.entryId),
    index("idx_acct_ledger_lines_tenant_account").on(t.tenantId, t.accountCode),
  ]
);

// ---- TypeScript Types ----

export type AcctLedgerEntry = typeof acctLedgerEntries.$inferSelect;
export type NewAcctLedgerEntry = typeof acctLedgerEntries.$inferInsert;

export type AcctLedgerLine = typeof acctLedgerLines.$inferSelect;
export type NewAcctLedgerLine = typeof acctLedgerLines.$inferInsert;
