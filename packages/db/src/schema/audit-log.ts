import {
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  inet,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenant";
import { users } from "./user";

/**
 * Audit Logs table.
 * Tracks all security-relevant actions.
 */
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),

  /** Tenant context (null for global actions) */
  tenantId: uuid("tenant_id")
    .references(() => tenants.id, { onDelete: "set null" }),

  /** User who performed action (null for system actions) */
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "set null" }),

  /** Action identifier (e.g., "auth.login", "team.invite") */
  action: varchar("action", { length: 100 }).notNull(),

  /** Resource type affected (e.g., "user", "tenant", "api_key") */
  resourceType: varchar("resource_type", { length: 100 }),

  /** Resource ID affected */
  resourceId: uuid("resource_id"),

  /** Additional metadata as JSON */
  metadata: text("metadata"),

  /** Client IP address */
  ipAddress: inet("ip_address"),

  /** Client user agent */
  userAgent: text("user_agent"),

  /** Timestamp */
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * TypeScript types.
 */
export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
