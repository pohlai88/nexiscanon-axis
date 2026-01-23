/**
 * Tool Tables (A01-01)
 *
 * Tool definitions and execution logs.
 */

import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  boolean,
  jsonb,
  text,
  integer,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";
import { type ToolRiskLevel } from "@axis/registry/schemas";

// ============================================================================
// Tool Definitions Table
// ============================================================================

export const lynxTools = pgTable(
  "lynx_tools",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Identity
    name: varchar("name", { length: 100 }).notNull(),
    description: text("description").notNull(),

    // Schema (as JSON schema)
    inputSchema: jsonb("input_schema")
      .$type<Record<string, unknown>>()
      .notNull(),
    outputSchema: jsonb("output_schema")
      .$type<Record<string, unknown>>()
      .notNull(),

    // Domain
    domain: varchar("domain", { length: 50 }).notNull(),

    // Safety
    riskLevel: varchar("risk_level", { length: 20 })
      .notNull()
      .$type<ToolRiskLevel>(),
    requiresApproval: boolean("requires_approval").notNull().default(false),

    // Execution
    handlerType: varchar("handler_type", { length: 20 }).notNull(),
    handlerConfig: jsonb("handler_config").$type<Record<string, unknown>>().notNull(),

    // Status
    isActive: boolean("is_active").notNull().default(true),
    isSystem: boolean("is_system").notNull().default(false),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_lynx_tool_tenant").on(table.tenantId),
    index("idx_lynx_tool_domain").on(table.tenantId, table.domain),
    index("idx_lynx_tool_active").on(table.tenantId, table.isActive),
  ]
);

export const lynxToolsRelations = relations(lynxTools, ({ one }) => ({
  tenant: one(tenants, {
    fields: [lynxTools.tenantId],
    references: [tenants.id],
  }),
}));

export type LynxToolRow = typeof lynxTools.$inferSelect;
export type NewLynxToolRow = typeof lynxTools.$inferInsert;

// ============================================================================
// Tool Execution Logs Table
// ============================================================================

export const lynxToolExecutionLogs = pgTable(
  "lynx_tool_execution_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    toolId: uuid("tool_id")
      .notNull()
      .references(() => lynxTools.id, { onDelete: "cascade" }),
    executionId: uuid("execution_id").notNull(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull(),

    // Execution
    input: jsonb("input").$type<Record<string, unknown>>().notNull(),
    output: jsonb("output"),
    success: boolean("success").notNull(),
    error: text("error"),

    // Timing
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }).notNull(),
    durationMs: integer("duration_ms").notNull(),
  },
  (table) => [
    index("idx_lynx_tool_log_tenant").on(table.tenantId),
    index("idx_lynx_tool_log_tool").on(table.toolId),
    index("idx_lynx_tool_log_exec").on(table.executionId),
    index("idx_lynx_tool_log_started").on(table.tenantId, table.startedAt),
  ]
);

export const lynxToolExecutionLogsRelations = relations(
  lynxToolExecutionLogs,
  ({ one }) => ({
    tool: one(lynxTools, {
      fields: [lynxToolExecutionLogs.toolId],
      references: [lynxTools.id],
    }),
    tenant: one(tenants, {
      fields: [lynxToolExecutionLogs.tenantId],
      references: [tenants.id],
    }),
  })
);

export type LynxToolExecutionLogRow = typeof lynxToolExecutionLogs.$inferSelect;
export type NewLynxToolExecutionLogRow = typeof lynxToolExecutionLogs.$inferInsert;
