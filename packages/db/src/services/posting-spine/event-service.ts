/**
 * Economic Event Persistence Service
 *
 * Implements B01 Layer 2 (Economic Events - Truth Layer).
 *
 * Key Principles (from B01 §2):
 * - IMMUTABLE once created
 * - Full 6W1H context (A01 §5)
 * - Records WHAT happened, not just the outcome
 * - Never updated, only reversed
 *
 * @example
 * ```typescript
 * const event = await createEconomicEvent(db, {
 *   tenantId: "...",
 *   documentId: "...",
 *   eventType: "invoice.posted",
 *   description: "Posted invoice INV-2026-001",
 *   eventDate: new Date(),
 *   amount: "1000.0000",
 *   currency: "USD",
 *   data: { invoiceNumber: "INV-2026-001" },
 *   context6w1h: {
 *     who: "user@example.com",
 *     what: "Posted sales invoice",
 *     when: new Date().toISOString(),
 *     where: "api.acme.com",
 *     why: "Customer order fulfillment",
 *     which: "INV-2026-001",
 *     how: "REST API",
 *   },
 *   createdBy: userId,
 * });
 * ```
 */

import { eq, and, desc } from "drizzle-orm";
import type { Database } from "../../client";
import {
  economicEvents,
  type NewEconomicEvent,
  type EconomicEvent,
} from "../../schema";
import type { EventType, SixW1HContext } from "@axis/registry/types";

/**
 * Create economic event input (simplified)
 */
export interface CreateEventInput
  extends Omit<NewEconomicEvent, "id" | "createdAt" | "isReversal"> {
  /** Auto-generates isReversal from reversedFromId */
  reversedFromId?: string;
}

/**
 * Create economic event.
 *
 * @param db - Drizzle database instance
 * @param input - Economic event input
 * @returns Created economic event
 *
 * @throws Error if event creation fails
 * @throws Error if document ID is invalid
 */
export async function createEconomicEvent(
  db: Database,
  input: CreateEventInput
): Promise<EconomicEvent> {
  const { reversedFromId, ...eventData } = input;

  const [event] = await db
    .insert(economicEvents)
    .values({
      ...eventData,
      reversedFromId,
      isReversal: reversedFromId ? "true" : "false",
    })
    .returning();

  if (!event) {
    throw new Error("Failed to create economic event");
  }

  return event;
}

/**
 * Get economic events by document.
 *
 * @param db - Drizzle database instance
 * @param documentId - Document UUID
 * @returns Economic events for document (ordered by created date DESC)
 */
export async function getEventsByDocument(
  db: Database,
  documentId: string
): Promise<EconomicEvent[]> {
  return await db
    .select()
    .from(economicEvents)
    .where(eq(economicEvents.documentId, documentId))
    .orderBy(desc(economicEvents.createdAt));
}

/**
 * Get economic events by tenant.
 *
 * @param db - Drizzle database instance
 * @param tenantId - Tenant UUID
 * @param options - Optional query options
 * @returns Economic events for tenant
 */
export async function getEventsByTenant(
  db: Database,
  tenantId: string,
  options?: {
    eventType?: EventType;
    limit?: number;
    offset?: number;
  }
): Promise<EconomicEvent[]> {
  const conditions = [eq(economicEvents.tenantId, tenantId)];

  if (options?.eventType) {
    conditions.push(eq(economicEvents.eventType, options.eventType as EconomicEvent["eventType"]));
  }

  const query = db
    .select()
    .from(economicEvents)
    .where(and(...conditions))
    .orderBy(desc(economicEvents.createdAt))
    .limit(options?.limit ?? 100)
    .offset(options?.offset ?? 0);

  return await query;
}

/**
 * Get economic event by ID.
 *
 * @param db - Drizzle database instance
 * @param eventId - Event UUID
 * @returns Economic event or null if not found
 */
export async function getEventById(
  db: Database,
  eventId: string
): Promise<EconomicEvent | null> {
  const [event] = await db
    .select()
    .from(economicEvents)
    .where(eq(economicEvents.id, eventId))
    .limit(1);

  return event || null;
}

/**
 * Check if economic event is reversed.
 *
 * @param db - Drizzle database instance
 * @param eventId - Event UUID
 * @returns true if event is reversed, false otherwise
 */
export async function isEventReversed(
  db: Database,
  eventId: string
): Promise<boolean> {
  const [result] = await db
    .select({ reversalId: economicEvents.reversalId })
    .from(economicEvents)
    .where(eq(economicEvents.id, eventId))
    .limit(1);

  return result?.reversalId !== null && result?.reversalId !== undefined;
}

/**
 * Get reversal chain for economic event.
 *
 * Returns original event + all reversals in chronological order.
 *
 * @param db - Drizzle database instance
 * @param eventId - Event UUID
 * @returns Reversal chain (original first, reversals follow)
 *
 * @example
 * ```typescript
 * // Original event created
 * // User posts reversal
 * // Chain: [original, reversal]
 * const chain = await getReversalChain(db, originalEventId);
 * console.log(chain[0].isReversal); // "false"
 * console.log(chain[1].isReversal); // "true"
 * ```
 */
export async function getReversalChain(
  db: Database,
  eventId: string
): Promise<EconomicEvent[]> {
  const event = await getEventById(db, eventId);

  if (!event) {
    throw new Error(`Economic event not found: ${eventId}`);
  }

  // If this is a reversal, find the original
  let originalId = event.isReversal === "true" ? event.reversedFromId : event.id;

  if (!originalId) {
    return [event];
  }

  // Get original event
  const original = await getEventById(db, originalId);

  if (!original) {
    throw new Error(`Original event not found: ${originalId}`);
  }

  // Get all reversals of the original
  const reversals = await db
    .select()
    .from(economicEvents)
    .where(
      and(
        eq(economicEvents.reversedFromId, originalId),
        eq(economicEvents.isReversal, "true")
      )
    )
    .orderBy(economicEvents.createdAt);

  return [original, ...reversals];
}

/**
 * Validate economic event immutability.
 *
 * Ensures event was not modified after creation.
 * In practice, Drizzle doesn't support UPDATE triggers yet,
 * so this is a placeholder for future DB-level enforcement.
 *
 * @param db - Drizzle database instance
 * @param eventId - Event UUID
 * @returns true if event is immutable (not modified)
 */
export async function validateEventImmutability(
  db: Database,
  eventId: string
): Promise<boolean> {
  // TODO: Implement DB-level trigger to prevent UPDATE on economic_events
  // For now, we rely on application-level enforcement (no UPDATE calls)

  const event = await getEventById(db, eventId);

  if (!event) {
    throw new Error(`Economic event not found: ${eventId}`);
  }

  // Placeholder: In production, check audit trail or DB trigger logs
  return true;
}

/**
 * Build 6W1H context for economic event.
 *
 * Helper function to construct complete context.
 *
 * @param params - Context parameters
 * @returns 6W1H context object
 */
export function build6W1HContext(params: {
  who: string; // User identifier (email, ID, etc.)
  what: string; // Action description
  where: string; // System/endpoint origin
  why?: string; // Business reason (optional)
  which: string; // Resource identifier
  how: string; // Method/process
}): SixW1HContext {
  const now = new Date();
  return {
    who: {
      userId: params.who,
      userName: params.who,
      role: "system",
    },
    what: {
      action: params.what,
      description: params.what,
      documentType: "journal_entry",
    },
    when: {
      timestamp: now.toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    where: {
      system: params.where,
    },
    why: {
      reason: params.why || "Business operation",
    },
    which: {
      tenantId: params.which,
      documentId: params.which,
    },
    how: {
      method: params.how,
      validation: "system",
    },
  };
}
