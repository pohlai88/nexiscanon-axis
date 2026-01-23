/**
 * Cutover Checklist Tables (C05)
 *
 * "Pre-cutover verification items."
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
import { cutoverExecutions } from "./execution";
import { type ChecklistItem } from "@axis/registry/schemas";

export const cutoverChecklists = pgTable(
  "cutover_checklists",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    migrationStateId: uuid("migration_state_id")
      .notNull()
      .references(() => migrationStates.id, { onDelete: "cascade" }),
    cutoverExecutionId: uuid("cutover_execution_id").references(
      () => cutoverExecutions.id,
      { onDelete: "set null" }
    ),

    // Items (JSONB)
    items: jsonb("items").$type<ChecklistItem[]>().notNull().default([]),

    // Summary
    totalItems: integer("total_items").notNull().default(0),
    completedItems: integer("completed_items").notNull().default(0),
    requiredItems: integer("required_items").notNull().default(0),
    requiredCompleted: integer("required_completed").notNull().default(0),

    // Status
    allRequiredComplete: boolean("all_required_complete").notNull().default(false),

    // By category (JSONB)
    byCategory: jsonb("by_category")
      .$type<{
        technical: { total: number; completed: number };
        business: { total: number; completed: number };
        operational: { total: number; completed: number };
      }>()
      .notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_checklists_tenant").on(table.tenantId),
    index("idx_checklists_migration").on(table.migrationStateId),
    index("idx_checklists_complete").on(table.allRequiredComplete),
  ]
);

export const cutoverChecklistsRelations = relations(cutoverChecklists, ({ one }) => ({
  tenant: one(tenants, {
    fields: [cutoverChecklists.tenantId],
    references: [tenants.id],
  }),
  migrationState: one(migrationStates, {
    fields: [cutoverChecklists.migrationStateId],
    references: [migrationStates.id],
  }),
  cutoverExecution: one(cutoverExecutions, {
    fields: [cutoverChecklists.cutoverExecutionId],
    references: [cutoverExecutions.id],
  }),
}));

export type CutoverChecklistRow = typeof cutoverChecklists.$inferSelect;
export type NewCutoverChecklistRow = typeof cutoverChecklists.$inferInsert;
