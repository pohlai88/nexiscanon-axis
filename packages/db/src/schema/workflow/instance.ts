/**
 * Workflow Instance Table (B08-01)
 *
 * Runtime execution of workflow.
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
import { wfDefinitions } from "./definition";
import { type InstanceStatus } from "@axis/registry/schemas";

export const wfInstances = pgTable(
  "wf_instances",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Definition reference (same domain, FK allowed)
    workflowDefinitionId: uuid("workflow_definition_id")
      .notNull()
      .references(() => wfDefinitions.id),
    workflowCode: varchar("workflow_code", { length: 50 }).notNull(),
    workflowVersion: integer("workflow_version").notNull(),

    // Target document (cross-domain reference by UUID, not FK per B02)
    documentType: varchar("document_type", { length: 50 }).notNull(),
    documentId: uuid("document_id").notNull(),
    documentNumber: varchar("document_number", { length: 50 }),

    // Requester
    requestedBy: uuid("requested_by").notNull(),
    requestedAt: timestamp("requested_at", { withTimezone: true }).notNull(),

    // Current state
    status: varchar("status", { length: 20 })
      .notNull()
      .default("pending")
      .$type<InstanceStatus>(),
    currentStepNumber: integer("current_step_number").notNull().default(1),

    // Context data
    contextData: jsonb("context_data").$type<Record<string, unknown>>(),

    // Completion
    completedAt: timestamp("completed_at", { withTimezone: true }),
    completedBy: uuid("completed_by"),

    // Result
    finalDecision: varchar("final_decision", { length: 20 }),
    finalComments: text("final_comments"),

    // Expiry
    expiresAt: timestamp("expires_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_wf_instances_tenant").on(table.tenantId),
    index("idx_wf_instances_definition").on(
      table.tenantId,
      table.workflowDefinitionId
    ),
    index("idx_wf_instances_status").on(table.tenantId, table.status),
    index("idx_wf_instances_document").on(
      table.tenantId,
      table.documentType,
      table.documentId
    ),
    index("idx_wf_instances_requester").on(table.tenantId, table.requestedBy),
    index("idx_wf_instances_expires").on(table.tenantId, table.expiresAt),
  ]
);

export const wfInstancesRelations = relations(wfInstances, ({ one }) => ({
  tenant: one(tenants, {
    fields: [wfInstances.tenantId],
    references: [tenants.id],
  }),
  definition: one(wfDefinitions, {
    fields: [wfInstances.workflowDefinitionId],
    references: [wfDefinitions.id],
  }),
}));

export type WfInstanceRow = typeof wfInstances.$inferSelect;
export type NewWfInstanceRow = typeof wfInstances.$inferInsert;
