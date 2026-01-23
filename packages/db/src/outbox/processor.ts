/**
 * Outbox Processor - Process pending events from outbox
 *
 * This should be run as a background job (e.g., via pg_cron,
 * a separate worker process, or scheduled function).
 *
 * Pattern: Poll → Process → Mark Complete/Failed
 */

import { eq, and, sql, asc } from "drizzle-orm";
import type { Database } from "../client/neon";
import { domainOutbox, type DomainOutboxEntry } from "../schema";

export type EventHandler = (event: DomainOutboxEntry) => Promise<void>;

export interface ProcessorConfig {
  /** Maximum events to process in one batch */
  batchSize?: number;
  /** Maximum retry attempts before marking as failed */
  maxAttempts?: number;
  /** Handlers by event type */
  handlers: Map<string, EventHandler>;
}

export interface ProcessorResult {
  processed: number;
  succeeded: number;
  failed: number;
  skipped: number;
}

/**
 * Process pending outbox events.
 *
 * @param db - Database connection
 * @param tenantId - Tenant to process (for RLS)
 * @param config - Processor configuration
 */
export async function processOutbox(
  db: Database,
  tenantId: string,
  config: ProcessorConfig
): Promise<ProcessorResult> {
  const { batchSize = 100, maxAttempts = 3, handlers } = config;

  const result: ProcessorResult = {
    processed: 0,
    succeeded: 0,
    failed: 0,
    skipped: 0,
  };

  // Fetch pending events
  const events = await db.query.domainOutbox.findMany({
    where: and(
      eq(domainOutbox.tenantId, tenantId),
      eq(domainOutbox.status, "pending")
    ),
    orderBy: [asc(domainOutbox.sequenceNumber)],
    limit: batchSize,
  });

  for (const event of events) {
    result.processed++;

    const handler = handlers.get(event.eventType);

    if (!handler) {
      // No handler registered, skip
      result.skipped++;
      continue;
    }

    try {
      // Mark as processing
      await db
        .update(domainOutbox)
        .set({ status: "processing" })
        .where(eq(domainOutbox.id, event.id));

      // Execute handler
      await handler(event);

      // Mark as delivered
      await db
        .update(domainOutbox)
        .set({
          status: "delivered",
          processedAt: new Date(),
        })
        .where(eq(domainOutbox.id, event.id));

      result.succeeded++;
    } catch (error) {
      const newAttempts = event.attempts + 1;
      const shouldFail = newAttempts >= maxAttempts;

      await db
        .update(domainOutbox)
        .set({
          status: shouldFail ? "failed" : "pending",
          attempts: newAttempts,
          lastError: error instanceof Error ? error.message : String(error),
        })
        .where(eq(domainOutbox.id, event.id));

      if (shouldFail) {
        result.failed++;
      }
    }
  }

  return result;
}

/**
 * Retry failed events (manual intervention).
 */
export async function retryFailedEvents(
  db: Database,
  tenantId: string,
  eventIds?: string[]
): Promise<number> {
  const conditions = [
    eq(domainOutbox.tenantId, tenantId),
    eq(domainOutbox.status, "failed"),
  ];

  if (eventIds && eventIds.length > 0) {
    // Only retry specific events
    const result = await db
      .update(domainOutbox)
      .set({
        status: "pending",
        attempts: 0,
        lastError: null,
      })
      .where(
        and(
          ...conditions,
          sql`${domainOutbox.id} = ANY(${eventIds})`
        )
      )
      .returning();

    return result.length;
  }

  // Retry all failed events for tenant
  const result = await db
    .update(domainOutbox)
    .set({
      status: "pending",
      attempts: 0,
      lastError: null,
    })
    .where(and(...conditions))
    .returning();

  return result.length;
}

/**
 * Get outbox statistics for monitoring.
 */
export async function getOutboxStats(
  db: Database,
  tenantId: string
): Promise<{
  pending: number;
  processing: number;
  delivered: number;
  failed: number;
}> {
  const result = await db
    .select({
      status: domainOutbox.status,
      count: sql<number>`count(*)::int`,
    })
    .from(domainOutbox)
    .where(eq(domainOutbox.tenantId, tenantId))
    .groupBy(domainOutbox.status);

  const stats = {
    pending: 0,
    processing: 0,
    delivered: 0,
    failed: 0,
  };

  for (const row of result) {
    if (row.status in stats) {
      stats[row.status as keyof typeof stats] = row.count;
    }
  }

  return stats;
}
