// packages/validation/src/erp/audit/payloads.ts
// Zod schemas for ERP audit event payloads

import { z } from "zod";

// ---- Base Payload ----

/**
 * Generic payload (unstructured)
 */
export const AuditPayload = z.record(z.unknown());
export type AuditPayload = z.infer<typeof AuditPayload>;

// ---- Created Payload ----

/**
 * Payload for entity creation events
 * Contains full snapshot of the created entity
 */
export const CreatedPayload = z.object({
  entity: z.record(z.unknown()),
});

export type CreatedPayload = z.infer<typeof CreatedPayload>;

// ---- Updated Payload ----

/**
 * Payload for entity update events
 * Contains only the changed fields (before and after)
 */
export const UpdatedPayload = z.object({
  before: z.record(z.unknown()),
  after: z.record(z.unknown()),
});

export type UpdatedPayload = z.infer<typeof UpdatedPayload>;

// ---- Transition Payload ----

/**
 * Payload for workflow transition events
 * Contains status transition info and optional notes
 */
export const TransitionPayload = z.object({
  fromStatus: z.string(),
  toStatus: z.string(),
  reason: z.string().optional(),
  note: z.string().optional(),
});

export type TransitionPayload = z.infer<typeof TransitionPayload>;
