/**
 * Migration Gates Tables (C04)
 *
 * "When ALL match → GREEN GATES → Safe to cutover"
 */

import {
  pgTable,
  timestamp,
  uuid,
  jsonb,
  integer,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";
import { migrationStates } from "../migration/state";
import {
  type GateStatus,
  type DualLedgerReconStatus,
} from "@axis/registry/schemas";

// ============================================================================
// Migration Gates
// ============================================================================

export const migrationGates = pgTable(
  "dual_ledger_gates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    migrationStateId: uuid("migration_state_id")
      .notNull()
      .references(() => migrationStates.id, { onDelete: "cascade" })
      .unique(),

    // Individual gates (JSONB)
    gates: jsonb("gates")
      .$type<{
        trialBalance: GateStatus;
        arAging: GateStatus;
        apAging: GateStatus;
        inventoryQty: GateStatus;
        inventoryValue: GateStatus;
        openOrders?: GateStatus;
        openPOs?: GateStatus;
        openInvoices?: GateStatus;
        openBills?: GateStatus;
      }>()
      .notNull(),

    // Overall status
    allGatesGreen: boolean("all_gates_green").notNull().default(false),
    greenGateCount: integer("green_gate_count").notNull().default(0),
    totalGateCount: integer("total_gate_count").notNull().default(5),
    readyForCutover: boolean("ready_for_cutover").notNull().default(false),

    // Requirements
    requiredConsecutiveDays: integer("required_consecutive_days").notNull().default(5),
    meetsConsecutiveRequirement: boolean("meets_consecutive_requirement").notNull().default(false),

    // Blockers (JSONB)
    blockers: jsonb("blockers").$type<string[]>().notNull().default([]),

    evaluatedAt: timestamp("evaluated_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_gates_tenant").on(table.tenantId),
    index("idx_gates_all_green").on(table.allGatesGreen),
    index("idx_gates_ready").on(table.readyForCutover),
  ]
);

export const migrationGatesRelations = relations(migrationGates, ({ one }) => ({
  tenant: one(tenants, {
    fields: [migrationGates.tenantId],
    references: [tenants.id],
  }),
  migrationState: one(migrationStates, {
    fields: [migrationGates.migrationStateId],
    references: [migrationStates.id],
  }),
}));

export type MigrationGatesRow = typeof migrationGates.$inferSelect;
export type NewMigrationGatesRow = typeof migrationGates.$inferInsert;

// ============================================================================
// Gate History
// ============================================================================

export const gateHistory = pgTable(
  "dual_ledger_gate_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    migrationStateId: uuid("migration_state_id")
      .notNull()
      .references(() => migrationStates.id, { onDelete: "cascade" }),

    // Snapshot
    evaluatedAt: timestamp("evaluated_at", { withTimezone: true }).notNull(),
    allGatesGreen: boolean("all_gates_green").notNull(),
    greenGateCount: integer("green_gate_count").notNull(),
    totalGateCount: integer("total_gate_count").notNull(),

    // Individual statuses (JSONB)
    gateStatuses: jsonb("gate_statuses")
      .$type<Record<string, DualLedgerReconStatus>>()
      .notNull(),

    // Triggered by
    triggeredByReconRunId: uuid("triggered_by_recon_run_id"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_gate_history_tenant").on(table.tenantId),
    index("idx_gate_history_migration").on(table.migrationStateId),
    index("idx_gate_history_date").on(table.evaluatedAt),
  ]
);

export const gateHistoryRelations = relations(gateHistory, ({ one }) => ({
  tenant: one(tenants, {
    fields: [gateHistory.tenantId],
    references: [tenants.id],
  }),
  migrationState: one(migrationStates, {
    fields: [gateHistory.migrationStateId],
    references: [migrationStates.id],
  }),
}));

export type GateHistoryRow = typeof gateHistory.$inferSelect;
export type NewGateHistoryRow = typeof gateHistory.$inferInsert;
