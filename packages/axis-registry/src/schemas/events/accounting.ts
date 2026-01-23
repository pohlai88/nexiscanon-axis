/**
 * Accounting Domain Events
 *
 * Events published by the Accounting domain:
 * - Journal posting
 * - Period lifecycle
 */

import { z } from "zod";
import { createEventSchema, auditedEventEnvelopeSchema } from "./base";

// ============================================================================
// Journal Events
// ============================================================================

export const journalPostedPayloadSchema = z.object({
  journalId: z.uuid(),
  tenantId: z.uuid(),
  journalNumber: z.string().min(1),
  postingDate: z.string().datetime(),
  fiscalPeriod: z.string(),
  description: z.string(),
  sourceDocument: z.object({
    type: z.string(),
    id: z.uuid(),
    number: z.string(),
  }),
  entries: z.array(
    z.object({
      lineId: z.uuid(),
      accountId: z.uuid(),
      accountCode: z.string(),
      accountName: z.string(),
      debit: z.string(),
      credit: z.string(),
      description: z.string().optional(),
    })
  ),
  totalDebits: z.string(),
  totalCredits: z.string(),
  postedBy: z.uuid(),
});

export const journalPostedEventSchema = auditedEventEnvelopeSchema.extend({
  eventType: z.literal("journal.posted"),
  payload: journalPostedPayloadSchema,
});

export type JournalPostedEvent = z.infer<typeof journalPostedEventSchema>;

// ============================================================================
// Period Events
// ============================================================================

export const periodSoftClosedPayloadSchema = z.object({
  periodId: z.uuid(),
  tenantId: z.uuid(),
  fiscalPeriod: z.string(), // e.g., "2026-01"
  fiscalYear: z.number().int(),
  closedBy: z.uuid(),
  closedAt: z.string().datetime(),
  // Only approved adjustments allowed after soft close
});

export const periodSoftClosedEventSchema = createEventSchema(
  "period.soft_closed",
  periodSoftClosedPayloadSchema
);

export type PeriodSoftClosedEvent = z.infer<typeof periodSoftClosedEventSchema>;

export const periodHardClosedPayloadSchema = z.object({
  periodId: z.uuid(),
  tenantId: z.uuid(),
  fiscalPeriod: z.string(),
  fiscalYear: z.number().int(),
  closedBy: z.uuid(),
  closedAt: z.string().datetime(),
  // No posts allowed after hard close (audit override only)
  retainedEarningsEntry: z
    .object({
      journalId: z.uuid(),
      amount: z.string(),
    })
    .optional(),
});

export const periodHardClosedEventSchema = createEventSchema(
  "period.hard_closed",
  periodHardClosedPayloadSchema
);

export type PeriodHardClosedEvent = z.infer<typeof periodHardClosedEventSchema>;

// ============================================================================
// All Accounting Events Union
// ============================================================================

export const accountingEventSchema = z.discriminatedUnion("eventType", [
  journalPostedEventSchema,
  periodSoftClosedEventSchema,
  periodHardClosedEventSchema,
]);

export type AccountingEvent = z.infer<typeof accountingEventSchema>;
