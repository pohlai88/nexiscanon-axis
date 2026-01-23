/**
 * COA Mapping Tables (C03)
 *
 * "The Machine notices account patterns and balance types."
 */

import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  boolean,
  jsonb,
  numeric,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";
import { migrationStates } from "../migration/state";
import {
  type StudioMappingStatus,
  type COAAccountType,
  type COANormalBalance,
  type ControlAccountType,
  type BalanceValidation,
} from "@axis/registry/schemas";

export const coaMappings = pgTable(
  "mapping_coa",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    migrationStateId: uuid("migration_state_id")
      .notNull()
      .references(() => migrationStates.id, { onDelete: "cascade" }),

    // Source account
    sourceCode: varchar("source_code", { length: 100 }).notNull(),
    sourceName: varchar("source_name", { length: 255 }).notNull(),
    sourceBalance: varchar("source_balance", { length: 50 }),
    sourceParent: varchar("source_parent", { length: 100 }),

    // Machine analysis
    suggestedAccountType: varchar("suggested_account_type", { length: 50 })
      .notNull()
      .$type<COAAccountType>(),
    suggestedNormalBalance: varchar("suggested_normal_balance", { length: 20 })
      .notNull()
      .$type<COANormalBalance>(),
    suggestedIsControl: boolean("suggested_is_control").notNull().default(false),
    suggestedControlType: varchar("suggested_control_type", { length: 20 })
      .$type<ControlAccountType>(),
    confidence: numeric("confidence", { precision: 5, scale: 4 }).notNull(),
    reasoning: varchar("reasoning", { length: 2000 }),

    // Alternatives (JSONB)
    alternatives: jsonb("alternatives")
      .$type<{ accountType: COAAccountType; confidence: number }[]>()
      .notNull()
      .default([]),

    // Confirmed mapping
    confirmedAccountType: varchar("confirmed_account_type", { length: 50 })
      .$type<COAAccountType>(),
    confirmedNormalBalance: varchar("confirmed_normal_balance", { length: 20 })
      .$type<COANormalBalance>(),
    confirmedIsControl: boolean("confirmed_is_control"),
    confirmedControlType: varchar("confirmed_control_type", { length: 20 })
      .$type<ControlAccountType>(),

    // Target AXIS account
    targetAccountId: uuid("target_account_id"),
    targetAccountCode: varchar("target_account_code", { length: 100 }),

    // Status
    status: varchar("status", { length: 30 })
      .notNull()
      .default("pending_review")
      .$type<StudioMappingStatus>(),

    // Validation (JSONB)
    balanceValidation: jsonb("balance_validation").$type<BalanceValidation>(),

    // Review trail
    reviewedBy: uuid("reviewed_by"),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    reviewNote: varchar("review_note", { length: 500 }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_coa_mappings_tenant").on(table.tenantId),
    index("idx_coa_mappings_migration").on(table.migrationStateId),
    index("idx_coa_mappings_status").on(table.status),
    index("idx_coa_mappings_code").on(table.migrationStateId, table.sourceCode),
  ]
);

export const coaMappingsRelations = relations(coaMappings, ({ one }) => ({
  tenant: one(tenants, {
    fields: [coaMappings.tenantId],
    references: [tenants.id],
  }),
  migrationState: one(migrationStates, {
    fields: [coaMappings.migrationStateId],
    references: [migrationStates.id],
  }),
}));

export type COAMappingRow = typeof coaMappings.$inferSelect;
export type NewCOAMappingRow = typeof coaMappings.$inferInsert;
