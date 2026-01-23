/**
 * Outbox Writer - Write events to outbox within transaction
 *
 * Usage:
 * ```typescript
 * await db.transaction(async (tx) => {
 *   // Domain write
 *   const doc = await tx.insert(documents).values({...}).returning();
 *
 *   // Write to outbox in same transaction
 *   await writeToOutbox(tx, tenantId, {
 *     eventType: "invoice.posted",
 *     eventId: crypto.randomUUID(),
 *     correlationId: requestId,
 *     sourceDomain: "sales",
 *     sourceAggregateType: "invoice",
 *     sourceAggregateId: doc.id,
 *     payload: { ... },
 *   });
 * });
 * ```
 */

import type { Database } from "../client/neon";
import { domainOutbox } from "../schema";

export interface OutboxEvent {
  eventType: string;
  eventId: string;
  correlationId: string;
  causationId?: string;
  sourceDomain: string;
  sourceAggregateId: string;
  sourceAggregateType: string;
  payload: Record<string, unknown>;
}

/** Transaction type - same interface as Database for insert operations */
type TransactionLike = Pick<Database, "insert">;

/**
 * Write event to outbox (within same transaction as domain write).
 *
 * This ensures at-least-once delivery: if the transaction commits,
 * the event will eventually be processed.
 */
export async function writeToOutbox(
  tx: TransactionLike,
  tenantId: string,
  event: OutboxEvent
): Promise<void> {
  await tx.insert(domainOutbox).values({
    tenantId,
    eventType: event.eventType,
    eventId: event.eventId,
    correlationId: event.correlationId,
    causationId: event.causationId,
    sourceDomain: event.sourceDomain,
    sourceAggregateId: event.sourceAggregateId,
    sourceAggregateType: event.sourceAggregateType,
    payload: event.payload,
    status: "pending",
    attempts: 0,
  });
}

/**
 * Write multiple events to outbox atomically.
 */
export async function writeMultipleToOutbox(
  tx: TransactionLike,
  tenantId: string,
  events: OutboxEvent[]
): Promise<void> {
  if (events.length === 0) return;

  await tx.insert(domainOutbox).values(
    events.map((event) => ({
      tenantId,
      eventType: event.eventType,
      eventId: event.eventId,
      correlationId: event.correlationId,
      causationId: event.causationId,
      sourceDomain: event.sourceDomain,
      sourceAggregateId: event.sourceAggregateId,
      sourceAggregateType: event.sourceAggregateType,
      payload: event.payload,
      status: "pending" as const,
      attempts: 0,
    }))
  );
}
