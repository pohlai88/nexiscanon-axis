/**
 * Posting Spine Query Helpers
 *
 * Efficient read operations for posting spine data.
 * Optimized for common UI/reporting queries.
 *
 * @example
 * ```typescript
 * // Get all postings for an invoice
 * const postings = await getPostingsByDocument(db, invoiceId);
 *
 * // Get complete event history
 * const history = await getEventHistory(db, {
 *   tenantId,
 *   startDate: new Date("2026-01-01"),
 *   endDate: new Date("2026-01-31"),
 * });
 * ```
 */

import { eq, and, gte, lte, desc } from "drizzle-orm";
import type { Database } from "../client";
import {
  economicEvents,
  ledgerPostings,
  documents,
  type EconomicEvent,
  type LedgerPosting,
  type Document,
  type EventType,
} from "../schema";

/**
 * Posting with document context
 */
export interface PostingWithContext {
  posting: LedgerPosting;
  event: EconomicEvent;
  document: Document;
}

/**
 * Get postings by document ID.
 *
 * Returns all GL postings for a document with full context.
 *
 * @param db - Drizzle database instance
 * @param documentId - Document UUID
 * @returns Postings with context
 */
export async function getPostingsByDocument(
  db: Database,
  documentId: string
): Promise<PostingWithContext[]> {
  // Get events for document
  const events = await db
    .select()
    .from(economicEvents)
    .where(eq(economicEvents.documentId, documentId))
    .orderBy(desc(economicEvents.createdAt));

  if (events.length === 0) {
    return [];
  }

  // Get document
  const [document] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, documentId))
    .limit(1);

  if (!document) {
    return [];
  }

  // Get all postings for these events
  const results: PostingWithContext[] = [];

  for (const event of events) {
    const postings = await db
      .select()
      .from(ledgerPostings)
      .where(eq(ledgerPostings.economicEventId, event.id))
      .orderBy(ledgerPostings.createdAt);

    for (const posting of postings) {
      results.push({
        posting,
        event,
        document,
      });
    }
  }

  return results;
}

/**
 * Event history query options
 */
export interface EventHistoryOptions {
  tenantId: string;
  startDate?: Date;
  endDate?: Date;
  eventType?: EventType;
  documentId?: string;
  limit?: number;
  offset?: number;
}

/**
 * Event history entry
 */
export interface EventHistoryEntry {
  event: EconomicEvent;
  postingsCount: number;
  totalDebit: string;
  totalCredit: string;
  isBalanced: boolean;
  document?: Document;
}

/**
 * Get event history.
 *
 * Returns economic events with posting summaries for reporting.
 *
 * @param db - Drizzle database instance
 * @param options - Query options
 * @returns Event history
 */
export async function getEventHistory(
  db: Database,
  options: EventHistoryOptions
): Promise<EventHistoryEntry[]> {
  const { tenantId, startDate, endDate, eventType, documentId, limit, offset } =
    options;

  // Build query conditions
  const conditions = [eq(economicEvents.tenantId, tenantId)];

  if (startDate) {
    conditions.push(gte(economicEvents.eventDate, startDate));
  }

  if (endDate) {
    conditions.push(lte(economicEvents.eventDate, endDate));
  }

  if (eventType) {
    conditions.push(eq(economicEvents.eventType, eventType));
  }

  if (documentId) {
    conditions.push(eq(economicEvents.documentId, documentId));
  }

  // Get events
  let query = db
    .select()
    .from(economicEvents)
    .where(and(...conditions))
    .orderBy(desc(economicEvents.eventDate));

  if (limit) {
    query = query.limit(limit) as typeof query;
  }

  if (offset) {
    query = query.offset(offset) as typeof query;
  }

  const events = await query;

  // Build history entries
  const history: EventHistoryEntry[] = [];

  for (const event of events) {
    // Get postings for event
    const postings = await db
      .select()
      .from(ledgerPostings)
      .where(eq(ledgerPostings.economicEventId, event.id));

    // Calculate totals
    let totalDebit = "0.0000";
    let totalCredit = "0.0000";

    for (const posting of postings) {
      if (posting.direction === "debit") {
        totalDebit = addDecimal(totalDebit, posting.amount);
      } else if (posting.direction === "credit") {
        totalCredit = addDecimal(totalCredit, posting.amount);
      }
    }

    // Get document if not already queried
    let document: Document | undefined;
    if (event.documentId) {
      const [doc] = await db
        .select()
        .from(documents)
        .where(eq(documents.id, event.documentId))
        .limit(1);
      document = doc;
    }

    history.push({
      event,
      postingsCount: postings.length,
      totalDebit,
      totalCredit,
      isBalanced: totalDebit === totalCredit,
      document,
    });
  }

  return history;
}

/**
 * Reversal chain query result
 */
export interface ReversalChainResult {
  original: {
    event: EconomicEvent;
    postings: LedgerPosting[];
  };
  reversals: Array<{
    event: EconomicEvent;
    postings: LedgerPosting[];
  }>;
}

/**
 * Get reversal chain.
 *
 * Returns original event + all reversals with their postings.
 *
 * @param db - Drizzle database instance
 * @param eventId - Event UUID (original or reversal)
 * @returns Reversal chain
 */
export async function getReversalChain(
  db: Database,
  eventId: string
): Promise<ReversalChainResult> {
  // Get event
  const [event] = await db
    .select()
    .from(economicEvents)
    .where(eq(economicEvents.id, eventId))
    .limit(1);

  if (!event) {
    throw new Error(`Event not found: ${eventId}`);
  }

  // Find original
  let originalId =
    event.isReversal === "true" && event.reversedFromId
      ? event.reversedFromId
      : event.id;

  const [original] = await db
    .select()
    .from(economicEvents)
    .where(eq(economicEvents.id, originalId))
    .limit(1);

  if (!original) {
    throw new Error(`Original event not found: ${originalId}`);
  }

  // Get original postings
  const originalPostings = await db
    .select()
    .from(ledgerPostings)
    .where(eq(ledgerPostings.economicEventId, original.id));

  // Get all reversals
  const reversalEvents = await db
    .select()
    .from(economicEvents)
    .where(
      and(
        eq(economicEvents.reversedFromId, originalId),
        eq(economicEvents.isReversal, "true")
      )
    )
    .orderBy(economicEvents.createdAt);

  // Get postings for each reversal
  const reversals = [];
  for (const reversalEvent of reversalEvents) {
    const reversalPostings = await db
      .select()
      .from(ledgerPostings)
      .where(eq(ledgerPostings.economicEventId, reversalEvent.id));

    reversals.push({
      event: reversalEvent,
      postings: reversalPostings,
    });
  }

  return {
    original: {
      event: original,
      postings: originalPostings,
    },
    reversals,
  };
}

/**
 * Add two decimal strings.
 */
function addDecimal(a: string, b: string): string {
  const scale = 4;
  const multiplier = Math.pow(10, scale);
  const aInt = Math.round(parseFloat(a) * multiplier);
  const bInt = Math.round(parseFloat(b) * multiplier);
  const sumInt = aInt + bInt;
  return (sumInt / multiplier).toFixed(scale);
}
