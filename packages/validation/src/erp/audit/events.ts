// packages/validation/src/erp/audit/events.ts
// Zod schemas for ERP audit events (API contracts)

import { z } from "zod";

// ---- Actor Type ----

export const ActorTypeSchema = z.enum(["USER", "SYSTEM", "SERVICE"]);
export type ActorType = z.infer<typeof ActorTypeSchema>;

// ---- Audit Event Output ----

/**
 * Single audit event output schema (for API responses)
 */
export const AuditEventOutput = z.object({
  id: z.string().uuid(),
  occurredAt: z.string().datetime(),
  tenantId: z.string().uuid(),
  actorUserId: z.string().uuid().nullable(),
  actorType: ActorTypeSchema,
  entityType: z.string(),
  entityId: z.string().uuid(),
  eventType: z.string(),
  commandId: z.string().uuid().nullable(),
  traceId: z.string().nullable(),
  payload: z.record(z.unknown()),
});

export type AuditEventOutput = z.infer<typeof AuditEventOutput>;

// ---- Audit Events List Output ----

/**
 * List of audit events with pagination info
 */
export const AuditEventsListOutput = z.object({
  events: z.array(AuditEventOutput),
  hasMore: z.boolean(),
});

export type AuditEventsListOutput = z.infer<typeof AuditEventsListOutput>;

// ---- Query Inputs ----

/**
 * Query params for fetching entity audit history
 */
export const AuditHistoryQuery = z.object({
  entityType: z.string(),
  entityId: z.string().uuid(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  before: z.string().datetime().optional(),
});

export type AuditHistoryQuery = z.infer<typeof AuditHistoryQuery>;

/**
 * Query params for fetching recent audit activity
 */
export const RecentAuditQuery = z.object({
  days: z.coerce.number().int().min(1).max(30).default(7),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export type RecentAuditQuery = z.infer<typeof RecentAuditQuery>;
