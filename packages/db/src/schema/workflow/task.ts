/**
 * Approval Task Tables (B08-01)
 *
 * Individual approval tasks.
 */

import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  integer,
  jsonb,
  text,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";
import { wfInstances } from "./instance";
import { wfSteps } from "./definition";
import {
  type TaskStatus,
  type TaskPriority,
  type TaskHistoryAction,
} from "@axis/registry/schemas";

// ============================================================================
// Approval Tasks Table
// ============================================================================

export const wfTasks = pgTable(
  "wf_tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Workflow reference (same domain, FK allowed)
    workflowInstanceId: uuid("workflow_instance_id")
      .notNull()
      .references(() => wfInstances.id, { onDelete: "cascade" }),
    workflowStepId: uuid("workflow_step_id")
      .notNull()
      .references(() => wfSteps.id),
    stepNumber: integer("step_number").notNull(),

    // Assignment
    assignedToType: varchar("assigned_to_type", { length: 10 }).notNull(),
    assignedToId: uuid("assigned_to_id").notNull(),
    assignedToName: varchar("assigned_to_name", { length: 255 }).notNull(),

    // Original assignee (before delegation)
    originalAssigneeId: uuid("original_assignee_id"),
    delegatedFrom: uuid("delegated_from"),

    // Status
    status: varchar("status", { length: 20 })
      .notNull()
      .default("pending")
      .$type<TaskStatus>(),

    // Decision
    decision: varchar("decision", { length: 20 }),
    decidedBy: uuid("decided_by"),
    decidedAt: timestamp("decided_at", { withTimezone: true }),
    comments: text("comments"),

    // Timing
    dueAt: timestamp("due_at", { withTimezone: true }),
    reminderSentAt: timestamp("reminder_sent_at", { withTimezone: true }),
    escalatedAt: timestamp("escalated_at", { withTimezone: true }),

    // Priority
    priority: varchar("priority", { length: 20 })
      .notNull()
      .default("normal")
      .$type<TaskPriority>(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_wf_tasks_tenant").on(table.tenantId),
    index("idx_wf_tasks_instance").on(table.tenantId, table.workflowInstanceId),
    index("idx_wf_tasks_status").on(table.tenantId, table.status),
    index("idx_wf_tasks_assignee").on(
      table.tenantId,
      table.assignedToType,
      table.assignedToId
    ),
    index("idx_wf_tasks_due").on(table.tenantId, table.status, table.dueAt),
    index("idx_wf_tasks_priority").on(table.tenantId, table.status, table.priority),
  ]
);

export const wfTasksRelations = relations(wfTasks, ({ one }) => ({
  tenant: one(tenants, {
    fields: [wfTasks.tenantId],
    references: [tenants.id],
  }),
  instance: one(wfInstances, {
    fields: [wfTasks.workflowInstanceId],
    references: [wfInstances.id],
  }),
  step: one(wfSteps, {
    fields: [wfTasks.workflowStepId],
    references: [wfSteps.id],
  }),
}));

export type WfTaskRow = typeof wfTasks.$inferSelect;
export type NewWfTaskRow = typeof wfTasks.$inferInsert;

// ============================================================================
// Task History Table
// ============================================================================

export const wfTaskHistory = pgTable(
  "wf_task_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    taskId: uuid("task_id")
      .notNull()
      .references(() => wfTasks.id, { onDelete: "cascade" }),

    // Action
    action: varchar("action", { length: 30 })
      .notNull()
      .$type<TaskHistoryAction>(),

    // Actor
    performedBy: uuid("performed_by").notNull(),
    performedAt: timestamp("performed_at", { withTimezone: true }).notNull(),

    // Details
    comments: text("comments"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  },
  (table) => [
    index("idx_wf_task_history_task").on(table.taskId),
    index("idx_wf_task_history_action").on(table.taskId, table.action),
    index("idx_wf_task_history_performer").on(table.performedBy),
  ]
);

export const wfTaskHistoryRelations = relations(wfTaskHistory, ({ one }) => ({
  task: one(wfTasks, {
    fields: [wfTaskHistory.taskId],
    references: [wfTasks.id],
  }),
}));

export type WfTaskHistoryRow = typeof wfTaskHistory.$inferSelect;
export type NewWfTaskHistoryRow = typeof wfTaskHistory.$inferInsert;
