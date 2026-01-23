/**
 * Base Event Schemas - Foundation for all domain events
 *
 * All domain events extend from the base envelope.
 * Pattern: Event-Carried State Transfer
 */

import { z } from "zod";
import { sixW1HContextSchema } from "../common";

// ============================================================================
// Event Envelope (All events extend this)
// ============================================================================

/**
 * Base event envelope - standard fields for all events
 */
export const eventEnvelopeSchema = z.object({
  // Event identity
  eventId: z.uuid(),
  eventType: z.string().min(1),

  // Correlation (for distributed tracing)
  correlationId: z.uuid(),
  causationId: z.uuid().optional(),

  // Source identification
  sourceDomain: z.string().min(1),
  sourceAggregateType: z.string().min(1),
  sourceAggregateId: z.uuid(),

  // Temporal
  timestamp: z.string().datetime(),

  // Tenant isolation
  tenantId: z.uuid(),

  // Schema version for evolution
  schemaVersion: z.number().int().positive().default(1),
});

export type EventEnvelope = z.infer<typeof eventEnvelopeSchema>;

// ============================================================================
// Event with Payload (Generic wrapper)
// ============================================================================

/**
 * Create an event schema with typed payload
 */
export function createEventSchema<T extends z.ZodTypeAny>(
  eventType: string,
  payloadSchema: T
) {
  return eventEnvelopeSchema.extend({
    eventType: z.literal(eventType),
    payload: payloadSchema,
  });
}

// ============================================================================
// Event with 6W1H Context (For audited events)
// ============================================================================

/**
 * Audited event envelope - includes full 6W1H context
 */
export const auditedEventEnvelopeSchema = eventEnvelopeSchema.extend({
  context6w1h: sixW1HContextSchema,
});

export type AuditedEventEnvelope = z.infer<typeof auditedEventEnvelopeSchema>;

// ============================================================================
// Domain Event Types
// ============================================================================

export const DOMAIN_NAMES = [
  "core",
  "mdm",
  "sales",
  "purchase",
  "inventory",
  "accounting",
  "controls",
  "reporting",
] as const;

export type DomainName = (typeof DOMAIN_NAMES)[number];

// ============================================================================
// Event Status (for outbox)
// ============================================================================

export const EVENT_STATUS = [
  "pending",
  "processing",
  "delivered",
  "failed",
] as const;

export type EventStatus = (typeof EVENT_STATUS)[number];
