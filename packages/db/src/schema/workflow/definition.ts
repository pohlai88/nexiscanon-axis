/**
 * Workflow Definition Tables (B08-01)
 *
 * Workflow templates and steps.
 */

import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  integer,
  jsonb,
  boolean,
  text,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";
import {
  type WorkflowType,
  type WorkflowStatus,
  type StepType,
  type ApproverType,
  type ApprovalMode,
  type TimeoutAction,
} from "@axis/registry/schemas";

// ============================================================================
// Workflow Definitions Table
// ============================================================================

export const wfDefinitions = pgTable(
  "wf_definitions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Identity
    code: varchar("code", { length: 50 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),

    // Type
    workflowType: varchar("workflow_type", { length: 20 })
      .notNull()
      .$type<WorkflowType>(),

    // Target
    targetDomain: varchar("target_domain", { length: 50 }).notNull(),
    targetDocumentType: varchar("target_document_type", {
      length: 50,
    }).notNull(),
    targetAction: varchar("target_action", { length: 50 }).notNull(),

    // Trigger conditions
    triggerCondition: jsonb("trigger_condition").$type<
      Record<string, unknown>
    >(),

    // Status
    status: varchar("status", { length: 20 })
      .notNull()
      .default("draft")
      .$type<WorkflowStatus>(),

    // Priority
    priority: integer("priority").notNull().default(0),

    // Version control
    version: integer("version").notNull().default(1),
    isLatest: boolean("is_latest").notNull().default(true),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdBy: uuid("created_by").notNull(),
  },
  (table) => [
    uniqueIndex("uq_wf_definitions_code_version").on(
      table.tenantId,
      table.code,
      table.version
    ),
    index("idx_wf_definitions_tenant").on(table.tenantId),
    index("idx_wf_definitions_status").on(table.tenantId, table.status),
    index("idx_wf_definitions_target").on(
      table.tenantId,
      table.targetDocumentType,
      table.targetAction
    ),
    index("idx_wf_definitions_latest").on(
      table.tenantId,
      table.code,
      table.isLatest
    ),
  ]
);

export const wfDefinitionsRelations = relations(wfDefinitions, ({ one }) => ({
  tenant: one(tenants, {
    fields: [wfDefinitions.tenantId],
    references: [tenants.id],
  }),
}));

export type WfDefinitionRow = typeof wfDefinitions.$inferSelect;
export type NewWfDefinitionRow = typeof wfDefinitions.$inferInsert;

// ============================================================================
// Workflow Steps Table
// ============================================================================

export const wfSteps = pgTable(
  "wf_steps",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workflowId: uuid("workflow_id")
      .notNull()
      .references(() => wfDefinitions.id, { onDelete: "cascade" }),

    // Ordering
    stepNumber: integer("step_number").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),

    // Type
    stepType: varchar("step_type", { length: 20 }).notNull().$type<StepType>(),

    // Approver assignment
    approverType: varchar("approver_type", { length: 20 })
      .notNull()
      .$type<ApproverType>(),
    approverValue: varchar("approver_value", { length: 255 }),

    // Multi-approver settings
    approvalMode: varchar("approval_mode", { length: 20 })
      .notNull()
      .default("any")
      .$type<ApprovalMode>(),
    requiredCount: integer("required_count"),

    // Conditions
    condition: jsonb("condition").$type<Record<string, unknown>>(),

    // Timeout
    timeoutHours: integer("timeout_hours"),
    timeoutAction: varchar("timeout_action", { length: 20 }).$type<TimeoutAction>(),

    // Reminder
    reminderHours: integer("reminder_hours"),
    reminderRepeat: boolean("reminder_repeat").notNull().default(false),

    // Branching
    onApproveNextStep: integer("on_approve_next_step"),
    onRejectNextStep: integer("on_reject_next_step"),

    // Parallel
    parallelGroupId: uuid("parallel_group_id"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("uq_wf_steps_number").on(table.workflowId, table.stepNumber),
    index("idx_wf_steps_workflow").on(table.workflowId),
    index("idx_wf_steps_parallel").on(table.workflowId, table.parallelGroupId),
  ]
);

export const wfStepsRelations = relations(wfSteps, ({ one }) => ({
  workflow: one(wfDefinitions, {
    fields: [wfSteps.workflowId],
    references: [wfDefinitions.id],
  }),
}));

export type WfStepRow = typeof wfSteps.$inferSelect;
export type NewWfStepRow = typeof wfSteps.$inferInsert;
