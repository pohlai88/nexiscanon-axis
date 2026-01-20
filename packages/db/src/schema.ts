// packages/db/src/schema.ts
// Drizzle schema definitions
//
// TENANT DISCIPLINE (MANDATORY):
// - All multi-tenant tables MUST include tenant_id column
// - All queries MUST be tenant-scoped (no route-level queries)
// - Use getTenantDb() helper to ensure tenant scoping

import { pgTable, text, timestamp, uuid, bigint, integer, boolean } from "drizzle-orm/pg-core";

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
  
  // Evidence policy (EVI010)
  evidenceRequiredForApproval: boolean("evidence_required_for_approval")
    .notNull()
    .default(false),
  evidenceTtlSeconds: integer("evidence_ttl_seconds"), // NULL = no TTL check
  
  ...timestamps,
});

export type Request = typeof requests.$inferSelect;
export type NewRequest = typeof requests.$inferInsert;

// ---- Request Templates table (multi-tenant, EVI013) ----

export const requestTemplates = pgTable("request_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id),
  name: text("name").notNull(),
  description: text("description"),
  
  // Evidence policy defaults (EVI013)
  evidenceRequiredForApproval: boolean("evidence_required_for_approval")
    .notNull()
    .default(false),
  evidenceTtlSeconds: integer("evidence_ttl_seconds"), // NULL = no TTL check
  
  ...timestamps,
});

export type RequestTemplate = typeof requestTemplates.$inferSelect;
export type NewRequestTemplate = typeof requestTemplates.$inferInsert;

// ---- Evidence Files table (multi-tenant) ----

export const evidenceFiles = pgTable("evidence_files", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id),
  uploadedBy: uuid("uploaded_by").notNull(),
  
  // Original file metadata (always present)
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),
  sha256: text("sha256"),
  
  // Phase 1 (direct viewable): r2Key = viewR2Key, sourceR2Key = null
  // Phase 2 (conversion): sourceR2Key = original office file, viewR2Key = generated PDF
  r2Key: text("r2_key").notNull().unique(), // DEPRECATED: use sourceR2Key or viewR2Key
  sourceR2Key: text("source_r2_key"), // Original file (for office docs)
  viewR2Key: text("view_r2_key"), // Viewable artifact (PDF for office, same as original for images/pdf)
  
  // Status: READY | CONVERT_PENDING | CONVERT_FAILED | REJECTED_UNSUPPORTED
  status: text("status").notNull(),
  
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type EvidenceFile = typeof evidenceFiles.$inferSelect;
export type NewEvidenceFile = typeof evidenceFiles.$inferInsert;

// ---- Request Evidence Links (multi-tenant) ----

export const requestEvidenceLinks = pgTable("request_evidence_links", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id),
  requestId: uuid("request_id")
    .notNull()
    .references(() => requests.id),
  evidenceFileId: uuid("evidence_file_id")
    .notNull()
    .references(() => evidenceFiles.id),
  linkedBy: uuid("linked_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type RequestEvidenceLink = typeof requestEvidenceLinks.$inferSelect;
export type NewRequestEvidenceLink = typeof requestEvidenceLinks.$inferInsert;
