/**
 * Audit Tables (A01-01)
 *
 * Lynx audit logs.
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
  numeric,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";
import { type LynxCapability } from "@axis/registry/schemas";

// ============================================================================
// Lynx Audit Logs Table
// ============================================================================

export const lynxAuditLogs = pgTable(
  "lynx_audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull(),

    // Request
    requestId: uuid("request_id").notNull(),
    capability: varchar("capability", { length: 30 })
      .notNull()
      .$type<LynxCapability>(),
    provider: varchar("provider", { length: 50 }).notNull(),
    model: varchar("model", { length: 100 }).notNull(),

    // Input
    inputHash: varchar("input_hash", { length: 64 }).notNull(),
    inputTokens: integer("input_tokens").notNull(),

    // Output
    outputHash: varchar("output_hash", { length: 64 }).notNull(),
    outputTokens: integer("output_tokens").notNull(),

    // Reasoning
    reasoningChain: text("reasoning_chain"),

    // Safety
    safetyFlags: jsonb("safety_flags").$type<string[]>().notNull().default([]),
    wasBlocked: boolean("was_blocked").notNull().default(false),
    blockReason: text("block_reason"),

    // Performance
    latencyMs: integer("latency_ms").notNull(),

    // Cost
    estimatedCost: numeric("estimated_cost", { precision: 10, scale: 6 }).notNull(),

    timestamp: timestamp("timestamp", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_lynx_audit_tenant").on(table.tenantId),
    index("idx_lynx_audit_user").on(table.tenantId, table.userId),
    index("idx_lynx_audit_request").on(table.requestId),
    index("idx_lynx_audit_capability").on(table.tenantId, table.capability),
    index("idx_lynx_audit_timestamp").on(table.tenantId, table.timestamp),
    index("idx_lynx_audit_blocked").on(table.tenantId, table.wasBlocked),
  ]
);

export const lynxAuditLogsRelations = relations(lynxAuditLogs, ({ one }) => ({
  tenant: one(tenants, {
    fields: [lynxAuditLogs.tenantId],
    references: [tenants.id],
  }),
}));

export type LynxAuditLogRow = typeof lynxAuditLogs.$inferSelect;
export type NewLynxAuditLogRow = typeof lynxAuditLogs.$inferInsert;
