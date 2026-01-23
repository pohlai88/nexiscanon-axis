/**
 * Cutover Prerequisites Tables (C05)
 *
 * "Only when all gates are GREEN and sign-offs are complete."
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
  type GateColor,
  type SignoffStatus,
  type OperationalReadiness,
} from "@axis/registry/schemas";

export const cutoverPrerequisites = pgTable(
  "cutover_prerequisites",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    migrationStateId: uuid("migration_state_id")
      .notNull()
      .references(() => migrationStates.id, { onDelete: "cascade" })
      .unique(),

    // Gate status (JSONB)
    gates: jsonb("gates")
      .$type<{
        trialBalance: GateColor;
        arAging: GateColor;
        apAging: GateColor;
        inventoryQty: GateColor;
        inventoryValue: GateColor;
      }>()
      .notNull(),

    // Duration requirements
    consecutiveGreenDays: integer("consecutive_green_days").notNull().default(0),
    minimumGreenDays: integer("minimum_green_days").notNull().default(3),
    meetsGreenDaysRequirement: boolean("meets_green_days_requirement")
      .notNull()
      .default(false),

    // Sign-off requirements (JSONB)
    signOffs: jsonb("sign_offs")
      .$type<{
        financial: SignoffStatus;
        operational: SignoffStatus;
        it: SignoffStatus;
      }>()
      .notNull(),

    // Operational readiness (JSONB)
    operational: jsonb("operational")
      .$type<OperationalReadiness>()
      .notNull(),

    // Technical readiness (JSONB)
    technical: jsonb("technical")
      .$type<{
        backupCompleted: boolean;
        backupVerified: boolean;
        axisHealthy: boolean;
        integrationsConfigured: boolean;
        rollbackPlanDocumented: boolean;
      }>()
      .notNull(),

    // Overall readiness
    allPrerequisitesMet: boolean("all_prerequisites_met").notNull().default(false),
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
    index("idx_prerequisites_tenant").on(table.tenantId),
    index("idx_prerequisites_ready").on(table.allPrerequisitesMet),
  ]
);

export const cutoverPrerequisitesRelations = relations(cutoverPrerequisites, ({ one }) => ({
  tenant: one(tenants, {
    fields: [cutoverPrerequisites.tenantId],
    references: [tenants.id],
  }),
  migrationState: one(migrationStates, {
    fields: [cutoverPrerequisites.migrationStateId],
    references: [migrationStates.id],
  }),
}));

export type CutoverPrerequisitesRow = typeof cutoverPrerequisites.$inferSelect;
export type NewCutoverPrerequisitesRow = typeof cutoverPrerequisites.$inferInsert;
