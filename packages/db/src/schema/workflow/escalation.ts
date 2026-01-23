/**
 * Escalation Table (B08-01)
 *
 * Timeout and escalation configs.
 */

import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  integer,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";
import { wfDefinitions } from "./definition";
import { type EscalationAction } from "@axis/registry/schemas";

export const wfEscalationRules = pgTable(
  "wf_escalation_rules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Scope (same domain, FK allowed for workflow)
    workflowDefinitionId: uuid("workflow_definition_id").references(
      () => wfDefinitions.id,
      { onDelete: "cascade" }
    ),
    documentType: varchar("document_type", { length: 50 }),

    // Trigger
    triggerAfterHours: integer("trigger_after_hours").notNull(),

    // Action
    escalationAction: varchar("escalation_action", { length: 20 })
      .notNull()
      .$type<EscalationAction>(),

    // For reassign action
    reassignToType: varchar("reassign_to_type", { length: 20 }),
    reassignToId: uuid("reassign_to_id"),

    // Notification settings
    notifyOriginalApprover: boolean("notify_original_approver")
      .notNull()
      .default(true),
    notifyRequester: boolean("notify_requester").notNull().default(true),
    notifyEscalateTo: boolean("notify_escalate_to").notNull().default(true),

    // Repeat
    repeatAfterHours: integer("repeat_after_hours"),
    maxRepeatCount: integer("max_repeat_count").notNull().default(0),

    // Status
    isActive: boolean("is_active").notNull().default(true),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_wf_escalation_tenant").on(table.tenantId),
    index("idx_wf_escalation_workflow").on(
      table.tenantId,
      table.workflowDefinitionId
    ),
    index("idx_wf_escalation_doctype").on(table.tenantId, table.documentType),
    index("idx_wf_escalation_active").on(table.tenantId, table.isActive),
  ]
);

export const wfEscalationRulesRelations = relations(
  wfEscalationRules,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [wfEscalationRules.tenantId],
      references: [tenants.id],
    }),
    workflow: one(wfDefinitions, {
      fields: [wfEscalationRules.workflowDefinitionId],
      references: [wfDefinitions.id],
    }),
  })
);

export type WfEscalationRuleRow = typeof wfEscalationRules.$inferSelect;
export type NewWfEscalationRuleRow = typeof wfEscalationRules.$inferInsert;
