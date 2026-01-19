// packages/db/src/erp/audit/events.ts
// ERP Audit Events table - durable business compliance record
//
// IMPORTANT: This table uses partitioning. Create partitions via manual migration.
// See: help013-erp-audit-table-spec.md for partition management

import { pgTable, uuid, text, timestamp, jsonb, index } from "drizzle-orm/pg-core";

/**
 * ERP Audit Events - captures all business-critical events
 *
 * Every lifecycle change in ERP entities MUST emit an audit event.
 * Events are emitted in the SAME transaction as data changes.
 *
 * @see help013-erp-audit-table-spec.md for full specification
 */
export const erpAuditEvents = pgTable(
  "erp_audit_events",
  {
    // Identity
    id: uuid("id").notNull().defaultRandom(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),

    // Tenant + Actor (who did this)
    tenantId: uuid("tenant_id").notNull(),
    actorUserId: uuid("actor_user_id"), // NULL if system-initiated
    actorType: text("actor_type").notNull().default("USER"), // USER | SYSTEM | SERVICE

    // Entity reference (what was affected)
    entityType: text("entity_type").notNull(), // e.g., 'erp.sales.order'
    entityId: uuid("entity_id").notNull(),

    // Event details
    eventType: text("event_type").notNull(), // e.g., 'erp.sales.order.created'
    commandId: uuid("command_id"), // idempotency key

    // Observability link
    traceId: text("trace_id"), // correlate with OTel traces

    // Payload (what changed)
    payload: jsonb("payload").notNull().default({}),
  },
  (table) => ({
    // Indexes for common query patterns
    tenantEntityIdx: index("idx_erp_audit_tenant_entity").on(
      table.tenantId,
      table.entityType,
      table.entityId
    ),
    tenantTimeIdx: index("idx_erp_audit_tenant_time").on(table.tenantId, table.occurredAt),
    entityIdIdx: index("idx_erp_audit_entity_id").on(table.entityId, table.occurredAt),
  })
);

// ---- Type exports ----

export type ErpAuditEvent = typeof erpAuditEvents.$inferSelect;
export type NewErpAuditEvent = typeof erpAuditEvents.$inferInsert;

// ---- Actor Types ----

export const ACTOR_TYPES = {
  USER: "USER",
  SYSTEM: "SYSTEM",
  SERVICE: "SERVICE",
} as const;

export type ActorType = (typeof ACTOR_TYPES)[keyof typeof ACTOR_TYPES];
