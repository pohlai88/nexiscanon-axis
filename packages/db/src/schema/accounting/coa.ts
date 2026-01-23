/**
 * Chart of Accounts Table (B07)
 *
 * Hierarchical structure of all accounts.
 */

import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  integer,
  numeric,
  boolean,
  text,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";
import {
  type GlAccountType,
  type AccountStatus,
  type SubledgerType,
  type NormalBalance,
} from "@axis/registry/schemas";

export const glAccounts = pgTable(
  "gl_accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Identity
    code: varchar("code", { length: 20 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),

    // Classification
    accountType: varchar("account_type", { length: 30 })
      .notNull()
      .$type<GlAccountType>(),
    normalBalance: varchar("normal_balance", { length: 10 })
      .notNull()
      .$type<NormalBalance>(),

    // Hierarchy (same domain, FK allowed)
    parentAccountId: uuid("parent_account_id"),
    level: integer("level").notNull().default(0),
    path: varchar("path", { length: 500 }),

    // Control account flags
    isControlAccount: boolean("is_control_account").notNull().default(false),
    subledgerType: varchar("subledger_type", { length: 20 }).$type<SubledgerType>(),

    // Behavior
    isPostable: boolean("is_postable").notNull().default(true),
    isReconcilable: boolean("is_reconcilable").notNull().default(false),
    requiresCostCenter: boolean("requires_cost_center").notNull().default(false),
    requiresProject: boolean("requires_project").notNull().default(false),

    // Currency
    currencyCode: varchar("currency_code", { length: 3 }),

    // Tax (reference by UUID, not FK per B02)
    defaultTaxCodeId: uuid("default_tax_code_id"),

    // Status
    status: varchar("status", { length: 20 })
      .notNull()
      .default("active")
      .$type<AccountStatus>(),

    // Opening balance
    openingBalance: numeric("opening_balance", { precision: 18, scale: 4 })
      .notNull()
      .default("0"),
    openingBalanceDate: timestamp("opening_balance_date", { withTimezone: true }),

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
    uniqueIndex("uq_gl_accounts_code").on(table.tenantId, table.code),
    index("idx_gl_accounts_tenant").on(table.tenantId),
    index("idx_gl_accounts_type").on(table.tenantId, table.accountType),
    index("idx_gl_accounts_parent").on(table.tenantId, table.parentAccountId),
    index("idx_gl_accounts_path").on(table.tenantId, table.path),
  ]
);

export const glAccountsRelations = relations(glAccounts, ({ one }) => ({
  tenant: one(tenants, {
    fields: [glAccounts.tenantId],
    references: [tenants.id],
  }),
  parentAccount: one(glAccounts, {
    fields: [glAccounts.parentAccountId],
    references: [glAccounts.id],
  }),
}));

export type GlAccountRow = typeof glAccounts.$inferSelect;
export type NewGlAccountRow = typeof glAccounts.$inferInsert;
