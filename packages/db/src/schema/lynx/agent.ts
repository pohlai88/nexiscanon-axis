/**
 * Agent Tables (A01-01)
 *
 * Agent definitions and executions.
 */

import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  integer,
  boolean,
  jsonb,
  text,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";
import {
  type AgentMemoryType,
  type AgentStep,
  type ToolCall,
  type AgentApprovalRequest,
} from "@axis/registry/schemas";

// ============================================================================
// Agent Definitions Table
// ============================================================================

export const lynxAgents = pgTable(
  "lynx_agents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Identity
    name: varchar("name", { length: 100 }).notNull(),
    description: text("description").notNull(),

    // Behavior
    systemPrompt: text("system_prompt").notNull(),
    maxIterations: integer("max_iterations").notNull().default(10),

    // Capabilities
    toolIds: jsonb("tool_ids").$type<string[]>().notNull().default([]),

    // Safety
    allowedDomains: jsonb("allowed_domains").$type<string[]>().notNull().default([]),
    requiresApproval: jsonb("requires_approval").$type<string[]>().notNull().default([]),

    // Memory
    memoryType: varchar("memory_type", { length: 20 })
      .notNull()
      .default("session")
      .$type<AgentMemoryType>(),

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
    index("idx_lynx_agent_tenant").on(table.tenantId),
    index("idx_lynx_agent_active").on(table.tenantId, table.isActive),
  ]
);

export const lynxAgentsRelations = relations(lynxAgents, ({ one }) => ({
  tenant: one(tenants, {
    fields: [lynxAgents.tenantId],
    references: [tenants.id],
  }),
}));

export type LynxAgentRow = typeof lynxAgents.$inferSelect;
export type NewLynxAgentRow = typeof lynxAgents.$inferInsert;

// ============================================================================
// Agent Executions Table
// ============================================================================

export const lynxAgentExecutions = pgTable(
  "lynx_agent_executions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    agentId: uuid("agent_id")
      .notNull()
      .references(() => lynxAgents.id, { onDelete: "cascade" }),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull(),

    // Input
    input: text("input").notNull(),
    context: jsonb("context").$type<Record<string, unknown>>(),

    // Execution trace
    steps: jsonb("steps").$type<AgentStep[]>().notNull().default([]),
    toolCalls: jsonb("tool_calls").$type<ToolCall[]>().notNull().default([]),

    // Result
    output: text("output"),
    status: varchar("status", { length: 30 }).notNull().default("running"),
    error: text("error"),

    // Approval requests
    pendingApprovals: jsonb("pending_approvals")
      .$type<AgentApprovalRequest[]>()
      .notNull()
      .default([]),

    // Timing
    startedAt: timestamp("started_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    totalDurationMs: integer("total_duration_ms"),

    // Tokens
    totalTokens: integer("total_tokens"),
  },
  (table) => [
    index("idx_lynx_exec_tenant").on(table.tenantId),
    index("idx_lynx_exec_agent").on(table.agentId),
    index("idx_lynx_exec_user").on(table.tenantId, table.userId),
    index("idx_lynx_exec_status").on(table.tenantId, table.status),
    index("idx_lynx_exec_started").on(table.tenantId, table.startedAt),
  ]
);

export const lynxAgentExecutionsRelations = relations(
  lynxAgentExecutions,
  ({ one }) => ({
    agent: one(lynxAgents, {
      fields: [lynxAgentExecutions.agentId],
      references: [lynxAgents.id],
    }),
    tenant: one(tenants, {
      fields: [lynxAgentExecutions.tenantId],
      references: [tenants.id],
    }),
  })
);

export type LynxAgentExecutionRow = typeof lynxAgentExecutions.$inferSelect;
export type NewLynxAgentExecutionRow = typeof lynxAgentExecutions.$inferInsert;
