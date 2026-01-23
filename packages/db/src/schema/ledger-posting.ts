import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  jsonb,
  numeric,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "./tenant";
import { users } from "./user";
import { economicEvents } from "./economic-event";

// ============================================================================
// Import from @axis/registry (Single Source of Truth)
// ============================================================================

import {
  type AccountType,
  type PostingDirection,
} from "@axis/registry/types";

// Re-export for consumers
export {
  ACCOUNT_TYPE,
  POSTING_DIRECTION,
  type AccountType,
  type PostingDirection,
} from "@axis/registry/types";

/**
 * Accounts table (chart of accounts).
 * Simplified for B1 - will expand in B2 (Chart of Accounts phase).
 */
export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    /** Tenant isolation (RLS enforced) */
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    /** Account code (user-defined, e.g., "1000", "4000") */
    code: varchar("code", { length: 20 }).notNull(),

    /** Account name */
    name: varchar("name", { length: 255 }).notNull(),

    /** Account type classification */
    accountType: varchar("account_type", { length: 20 })
      .notNull()
      .$type<AccountType>(),

    /** Currency code (ISO 4217) */
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),

    /** Account metadata */
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),

    /** Is account active? */
    isActive: varchar("is_active", { length: 10 })
      .notNull()
      .default("true")
      .$type<"true" | "false">(),

    /** Timestamps */
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    // Unique constraint: one code per tenant
    uniqueIndex("accounts_tenant_code_idx").on(table.tenantId, table.code),
  ]
);

/**
 * Ledger postings table (double-entry bookkeeping - A01 §4.2, B01 §2).
 * IMMUTABLE after insert.
 *
 * Key principles:
 * - Every economic event generates balanced postings (Debits = Credits)
 * - Never updated, only reversed
 * - Batch ID groups related postings
 * - Enforced by database constraint (B01 §6)
 *
 * Example:
 * - Event: Sold goods for $1,000
 * - Postings:
 *   1. DR Accounts Receivable $1,000 (batchId: X)
 *   2. CR Revenue $1,000 (batchId: X)
 */
export const ledgerPostings = pgTable(
  "ledger_postings",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    /** Tenant isolation (RLS enforced) */
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    /** Source economic event */
    economicEventId: uuid("economic_event_id")
      .notNull()
      .references(() => economicEvents.id, { onDelete: "restrict" }),

    /** Batch ID (groups balanced postings) */
    batchId: uuid("batch_id").notNull(),

    /** Account being posted to */
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "restrict" }),

    /** Posting direction */
    direction: varchar("direction", { length: 10 })
      .notNull()
      .$type<PostingDirection>(),

    /** Posting amount (always positive, direction determines sign) */
    amount: numeric("amount", { precision: 19, scale: 4 }).notNull(),

    /** Currency code (ISO 4217) */
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),

    /** Posting date (business date) */
    postingDate: timestamp("posting_date", { withTimezone: true }).notNull(),

    /** Posting description */
    description: varchar("description", { length: 500 }).notNull(),

    /** Posting metadata (dimensions, tags, etc.) */
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),

    /** If reversed, reference to reversal posting */
    reversalId: uuid("reversal_id"),

    /** If this is a reversal, reference to original */
    reversedFromId: uuid("reversed_from_id"),

    /** Is this posting a reversal? */
    isReversal: varchar("is_reversal", { length: 10 })
      .notNull()
      .default("false")
      .$type<"true" | "false">(),

    /** Created by user (immutable) */
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),

    /** Created timestamp (immutable) */
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    // Performance indexes
    index("ledger_postings_tenant_id_idx").on(table.tenantId),
    index("ledger_postings_economic_event_id_idx").on(table.economicEventId),
    index("ledger_postings_batch_id_idx").on(table.batchId),
    index("ledger_postings_account_id_idx").on(table.accountId),
    index("ledger_postings_posting_date_idx").on(table.postingDate),
  ]
);

/**
 * Account relations.
 */
export const accountsRelations = relations(accounts, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [accounts.tenantId],
    references: [tenants.id],
  }),
  postings: many(ledgerPostings),
}));

/**
 * Ledger posting relations.
 */
export const ledgerPostingsRelations = relations(ledgerPostings, ({ one }) => ({
  tenant: one(tenants, {
    fields: [ledgerPostings.tenantId],
    references: [tenants.id],
  }),
  economicEvent: one(economicEvents, {
    fields: [ledgerPostings.economicEventId],
    references: [economicEvents.id],
  }),
  account: one(accounts, {
    fields: [ledgerPostings.accountId],
    references: [accounts.id],
  }),
  creator: one(users, {
    fields: [ledgerPostings.createdBy],
    references: [users.id],
  }),
  // Self-referential: original ↔ reversal
  reversal: one(ledgerPostings, {
    fields: [ledgerPostings.reversalId],
    references: [ledgerPostings.id],
    relationName: "posting_reversal",
  }),
  reversedFrom: one(ledgerPostings, {
    fields: [ledgerPostings.reversedFromId],
    references: [ledgerPostings.id],
    relationName: "posting_reversed_from",
  }),
}));

/**
 * TypeScript types inferred from schema.
 */
export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
export type LedgerPosting = typeof ledgerPostings.$inferSelect;
export type NewLedgerPosting = typeof ledgerPostings.$inferInsert;
