/**
 * Audit Log Table
 *
 * Implements F01 LAW F01-07 — Immutable Audit Trail (6W1H Context)
 * Template from F01 D3
 */

import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  jsonb,
  text,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "./tenant";
import { users } from "./user";

/**
 * 6W1H Context for Audit Trail
 */
export interface AuditContext {
  who: string; // User/actor performing action
  what: string; // Action type and resource
  when: string; // Timestamp (ISO 8601)
  where: string; // System/endpoint origin
  why?: string; // Business reason/context (optional)
  which: string; // Specific record affected
  how: string; // Method/process used
}

/**
 * Audit metadata stored as JSONB
 */
export interface AuditMetadata {
  changes?: Record<string, unknown>; // Before/after values
  context?: Record<string, unknown>; // Additional context
  [key: string]: unknown;
}

/**
 * Audit Logs Table
 *
 * Features:
 * - Append-only (no updates/deletes)
 * - FK with ON DELETE SET NULL to preserve records
 * - DESC index on created_at for recent queries
 * - JSONB metadata for flexible context
 */
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    // Tenant isolation (SET NULL preserves audit when tenant deleted)
    tenantId: uuid("tenant_id").references(() => tenants.id, {
      onDelete: "set null",
    }),

    // User who performed action (SET NULL preserves audit when user deleted)
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "set null",
    }),

    // Action details
    action: varchar("action", { length: 100 }).notNull(), // e.g., "invoice.created", "journal.posted"
    resourceType: varchar("resource_type", { length: 100 }), // e.g., "invoice", "journal_entry"
    resourceId: uuid("resource_id"), // UUID of affected resource

    // 6W1H Context (structured)
    who: varchar("who", { length: 255 }), // User identifier (email, name, etc.)
    what: text("what"), // Detailed action description
    where: varchar("where", { length: 255 }), // Origin (e.g., "api.acme.com", "web-app")
    why: text("why"), // Business reason/context
    how: varchar("how", { length: 100 }), // Method (e.g., "REST API", "GraphQL", "CLI")

    // Flexible metadata
    metadata: jsonb("metadata").$type<AuditMetadata>().default({}),

    // Request context
    ipAddress: varchar("ip_address", { length: 45 }), // IPv4 or IPv6
    userAgent: text("user_agent"),

    // Timestamp (when)
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    // Indexes for common queries
    index("idx_audit_logs_tenant_id").on(table.tenantId),
    index("idx_audit_logs_user_id").on(table.userId),
    index("idx_audit_logs_resource").on(table.resourceType, table.resourceId),
    index("idx_audit_logs_action").on(table.action),

    // DESC index for recent audit queries (F01 D3)
    index("idx_audit_logs_created_at").on(table.createdAt.desc()),
  ]
);

/**
 * Audit Log Relations
 */
export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  tenant: one(tenants, {
    fields: [auditLogs.tenantId],
    references: [tenants.id],
  }),
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

/**
 * TypeScript types inferred from schema
 */
export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
