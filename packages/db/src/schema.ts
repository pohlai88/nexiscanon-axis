// packages/db/src/schema.ts
// Drizzle schema definitions
//
// TENANT DISCIPLINE (MANDATORY):
// - All multi-tenant tables MUST include tenant_id column
// - All queries MUST be tenant-scoped (no route-level queries)
// - Use getTenantDb() helper to ensure tenant scoping

import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// ---- Common columns ----

/**
 * Standard timestamp columns for all tables.
 */
export const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
};

// ---- Example: Tenants table ----

export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  ...timestamps,
});

// ---- Example: Users table (multi-tenant) ----

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id),
  email: text("email").notNull(),
  name: text("name"),
  ...timestamps,
});

// ---- Example: Audit log table ----

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  actorId: uuid("actor_id"),
  traceId: text("trace_id"),
  eventName: text("event_name").notNull(),
  eventData: text("event_data"), // JSON string
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ---- Type exports ----

export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;

// ---- Requests table (multi-tenant) ----

export const requests = pgTable("requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id),
  requesterId: uuid("requester_id").notNull(),
  status: text("status").notNull(), // DRAFT, SUBMITTED, APPROVED, REJECTED
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  approvedBy: uuid("approved_by"),
  ...timestamps,
});

export type Request = typeof requests.$inferSelect;
export type NewRequest = typeof requests.$inferInsert;

// ---- ERP Tables ----
// Import ERP schemas so they're included in migrations
export * from "./erp";
