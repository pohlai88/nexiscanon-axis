/**
 * Cutover Gates Table (C01)
 *
 * All gates must be GREEN before cutover.
 */

import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  integer,
  boolean,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";
import { migrationStates } from "./state";
import { type SignOff } from "@axis/registry/schemas";

export const cutoverGates = pgTable(
  "cutover_gates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    migrationStateId: uuid("migration_state_id")
      .notNull()
      .references(() => migrationStates.id, { onDelete: "cascade" }),

    // Balance gates
    trialBalanceMatched: boolean("trial_balance_matched").notNull().default(false),
    trialBalanceVariance: varchar("trial_balance_variance", { length: 50 })
      .notNull()
      .default("0"),

    // Subledger gates
    arAgingMatched: boolean("ar_aging_matched").notNull().default(false),
    arVariance: varchar("ar_variance", { length: 50 }).notNull().default("0"),
    apAgingMatched: boolean("ap_aging_matched").notNull().default(false),
    apVariance: varchar("ap_variance", { length: 50 }).notNull().default("0"),

    // Inventory gates
    inventoryQtyMatched: boolean("inventory_qty_matched").notNull().default(false),
    inventoryQtyVariance: integer("inventory_qty_variance").notNull().default(0),
    inventoryValueMatched: boolean("inventory_value_matched")
      .notNull()
      .default(false),
    inventoryValueVariance: varchar("inventory_value_variance", { length: 50 })
      .notNull()
      .default("0"),

    // Master data gates
    partiesResolved: boolean("parties_resolved").notNull().default(false),
    unmappedParties: integer("unmapped_parties").notNull().default(0),
    itemsResolved: boolean("items_resolved").notNull().default(false),
    unmappedItems: integer("unmapped_items").notNull().default(0),
    accountsMapped: boolean("accounts_mapped").notNull().default(false),
    unmappedAccounts: integer("unmapped_accounts").notNull().default(0),

    // Operational gates
    openTransactionsMigrated: boolean("open_transactions_migrated")
      .notNull()
      .default(false),
    pendingApprovalsCleared: boolean("pending_approvals_cleared")
      .notNull()
      .default(false),

    // Sign-offs (JSONB)
    financialSignOff: jsonb("financial_sign_off").$type<SignOff>(),
    operationalSignOff: jsonb("operational_sign_off").$type<SignOff>(),
    itSignOff: jsonb("it_sign_off").$type<SignOff>(),

    // Overall status
    allGatesGreen: boolean("all_gates_green").notNull().default(false),
    cutoverApproved: boolean("cutover_approved").notNull().default(false),
    cutoverApprovedBy: uuid("cutover_approved_by"),
    cutoverApprovedAt: timestamp("cutover_approved_at", { withTimezone: true }),

    // Evaluation
    evaluatedAt: timestamp("evaluated_at", { withTimezone: true }).notNull(),
    evaluatedBy: uuid("evaluated_by"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_cutover_gates_tenant").on(table.tenantId),
    index("idx_cutover_gates_migration").on(table.migrationStateId),
  ]
);

export const cutoverGatesRelations = relations(cutoverGates, ({ one }) => ({
  tenant: one(tenants, {
    fields: [cutoverGates.tenantId],
    references: [tenants.id],
  }),
  migrationState: one(migrationStates, {
    fields: [cutoverGates.migrationStateId],
    references: [migrationStates.id],
  }),
}));

export type CutoverGatesRow = typeof cutoverGates.$inferSelect;
export type NewCutoverGatesRow = typeof cutoverGates.$inferInsert;
