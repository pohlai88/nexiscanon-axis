/**
 * Audit Extension Table (B08)
 *
 * Extended audit metadata.
 */

import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { type AuditSeverity } from "@axis/registry/schemas";

export const ctrlAuditExtensions = pgTable(
  "ctrl_audit_extensions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    auditLogId: uuid("audit_log_id").notNull(),

    // Classification
    severity: varchar("severity", { length: 20 })
      .notNull()
      .default("info")
      .$type<AuditSeverity>(),
    category: varchar("category", { length: 50 }).notNull(),

    // Context
    sessionId: uuid("session_id"),
    requestId: uuid("request_id"),

    // Client info
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: varchar("user_agent", { length: 500 }),
    geoLocation: varchar("geo_location", { length: 100 }),

    // Data snapshot
    beforeState: jsonb("before_state").$type<Record<string, unknown>>(),
    afterState: jsonb("after_state").$type<Record<string, unknown>>(),
    changedFields: jsonb("changed_fields").$type<string[]>(),

    // Policy context
    matchedPolicies: jsonb("matched_policies").$type<string[]>(),
    dangerZoneRequestId: uuid("danger_zone_request_id"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_ctrl_audit_ext_log").on(table.auditLogId),
    index("idx_ctrl_audit_ext_severity").on(table.severity),
    index("idx_ctrl_audit_ext_category").on(table.category),
    index("idx_ctrl_audit_ext_session").on(table.sessionId),
    index("idx_ctrl_audit_ext_danger").on(table.dangerZoneRequestId),
    index("idx_ctrl_audit_ext_created").on(table.createdAt),
  ]
);

export type CtrlAuditExtensionRow = typeof ctrlAuditExtensions.$inferSelect;
export type NewCtrlAuditExtensionRow = typeof ctrlAuditExtensions.$inferInsert;
