/**
 * Reversal Service
 *
 * Implements B01 Immutable Correction Pattern (The 500-Year Principle).
 *
 * Key Principles (from B01 §1):
 * - POSTED IS IMMUTABLE
 * - CORRECTIONS ARE REVERSALS
 * - Never UPDATE posted records
 * - Create offsetting entries
 * - Maintain bidirectional references
 *
 * @example
 * ```typescript
 * // Reverse an invoice that was posted in error
 * const reversal = await createReversalEntry(db, {
 *   originalEventId: "...",
 *   tenantId: "...",
 *   userId: "...",
 *   reason: "Posted to wrong customer",
 *   reversalDate: new Date(),
 * });
 *
 * console.log(reversal.event.isReversal); // "true"
 * console.log(reversal.event.reversedFromId); // Original event ID
 * console.log(reversal.isBalanced); // true (offsetting entries)
 * ```
 */

import { eq } from "drizzle-orm";
import type { Database } from "../../client";
import { executePostingSpineTransaction } from "../../client";
import { economicEvents, ledgerPostings, documents } from "../../schema";
import {
  getEventById,
  build6W1HContext,
} from "./event-service";
import { getPostingsByEvent, type GLPostingInput } from "./posting-service";

/**
 * Create reversal entry input
 */
export interface CreateReversalInput {
  originalEventId: string;
  tenantId: string;
  userId: string;
  reason: string;
  reversalDate: Date;
  context?: {
    where?: string;
    how?: string;
  };
}

/**
 * Reversal entry result
 */
export interface ReversalEntryResult {
  event: Awaited<ReturnType<typeof executePostingSpineTransaction>>["event"];
  postings: Awaited<
    ReturnType<typeof executePostingSpineTransaction>
  >["postings"];
  originalEvent: Awaited<ReturnType<typeof getEventById>>;
  originalPostings: Awaited<ReturnType<typeof getPostingsByEvent>>;
  isBalanced: boolean;
}

/**
 * Create reversal entry.
 *
 * Creates offsetting economic event + GL postings to reverse an original entry.
 * The original records remain immutable; the reversal creates new records with
 * opposite signs and bidirectional references.
 *
 * @param db - Drizzle database instance
 * @param input - Reversal input
 * @returns Reversal entry result
 *
 * @throws Error if original event not found
 * @throws Error if original event is already reversed
 * @throws Error if reversal creation fails
 */
export async function createReversalEntry(
  db: Database,
  input: CreateReversalInput
): Promise<ReversalEntryResult> {
  const {
    originalEventId,
    tenantId,
    userId,
    reason,
    reversalDate,
    context,
  } = input;

  // Step 1: Get original event
  const originalEvent = await getEventById(db, originalEventId);

  if (!originalEvent) {
    throw new Error(`Original event not found: ${originalEventId}`);
  }

  // Step 2: Validate event is not already reversed
  if (originalEvent.reversalId) {
    throw new Error(
      `Event ${originalEventId} is already reversed by ${originalEvent.reversalId}`
    );
  }

  // Step 3: Get original postings
  const originalPostings = await getPostingsByEvent(db, originalEventId);

  if (originalPostings.length === 0) {
    throw new Error(`No postings found for event ${originalEventId}`);
  }

  // Step 4: Build 6W1H context for reversal
  const context6w1h = build6W1HContext({
    who: userId,
    what: `Reversal of ${originalEvent.eventType}`,
    where: context?.where || "reversal-service",
    why: reason,
    which: originalEvent.documentId,
    how: context?.how || "Reversal entry creation",
  });

  // Step 5: Create offsetting postings (flip Dr/Cr)
  const reversalPostings: GLPostingInput[] = originalPostings.map((p) => ({
    accountId: p.accountId,
    direction: p.direction === "debit" ? "credit" : "debit", // Flip direction
    amount: p.amount,
    description: `REVERSAL: ${p.description}`,
    metadata: {
      ...p.metadata,
      reversalOf: p.id,
      reversalReason: reason,
    },
  }));

  // Step 6: Create reversal event + postings (atomic transaction)
  const result = await executePostingSpineTransaction(db, {
    event: {
      tenantId,
      documentId: originalEvent.documentId,
      eventType: originalEvent.eventType,
      description: `REVERSAL: ${originalEvent.description}`,
      eventDate: reversalDate,
      amount: originalEvent.amount,
      currency: originalEvent.currency,
      entityId: originalEvent.entityId,
      data: {
        ...originalEvent.data,
        reversalReason: reason,
        originalEventId,
      },
      context6w1h,
      reversedFromId: originalEventId,
      createdBy: userId,
    },
    postings: reversalPostings.map((p) => ({
      tenantId,
      economicEventId: "", // Will be filled by transaction
      batchId: "", // Will be filled by transaction
      ...p,
      postingDate: reversalDate,
      currency: originalEvent.currency,
      createdBy: userId,
      isReversal: "true",
      reversedFromId: undefined, // Will be set later
    })),
    validateBalance: true,
  });

  // Step 7: Update original event to link to reversal
  await db
    .update(economicEvents)
    .set({ reversalId: result.event.id })
    .where(eq(economicEvents.id, originalEventId));

  // Step 8: Link reversal postings to original postings
  for (let i = 0; i < result.postings.length; i++) {
    const reversalPosting = result.postings[i];
    const originalPosting = originalPostings[i];

    if (reversalPosting && originalPosting) {
      // Update reversal posting to reference original
      await db
        .update(ledgerPostings)
        .set({ reversedFromId: originalPosting.id })
        .where(eq(ledgerPostings.id, reversalPosting.id));

      // Update original posting to reference reversal
      await db
        .update(ledgerPostings)
        .set({ reversalId: reversalPosting.id })
        .where(eq(ledgerPostings.id, originalPosting.id));
    }
  }

  return {
    event: result.event,
    postings: result.postings,
    originalEvent,
    originalPostings,
    isBalanced: result.isBalanced,
  };
}

/**
 * Validate reversal eligibility.
 *
 * Checks if an event can be reversed.
 *
 * @param db - Drizzle database instance
 * @param eventId - Event UUID
 * @returns Eligibility result
 */
export async function validateReversalEligibility(
  db: Database,
  eventId: string
): Promise<{
  isEligible: boolean;
  reason?: string;
}> {
  const event = await getEventById(db, eventId);

  if (!event) {
    return {
      isEligible: false,
      reason: "Event not found",
    };
  }

  if (event.isReversal === "true") {
    return {
      isEligible: false,
      reason: "Cannot reverse a reversal entry",
    };
  }

  if (event.reversalId) {
    return {
      isEligible: false,
      reason: "Event is already reversed",
    };
  }

  // TODO: Add additional business rules:
  // - Check if fiscal period is closed
  // - Check if document is in correct state
  // - Check user permissions

  return {
    isEligible: true,
  };
}

/**
 * Create document reversal.
 *
 * Reverses a posted document by creating a reversal event + postings
 * and updating the document state.
 *
 * @param db - Drizzle database instance
 * @param input - Document reversal input
 * @returns Reversal entry result
 */
export async function createDocumentReversal(
  db: Database,
  input: {
    documentId: string;
    tenantId: string;
    userId: string;
    reason: string;
    reversalDate: Date;
    context?: {
      where?: string;
      how?: string;
    };
  }
): Promise<ReversalEntryResult> {
  const { documentId, tenantId, userId, reason, reversalDate, context } = input;

  // Step 1: Get document
  const [document] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, documentId))
    .limit(1);

  if (!document) {
    throw new Error(`Document not found: ${documentId}`);
  }

  // Step 2: Validate document state
  if (document.state !== "posted") {
    throw new Error(
      `Cannot reverse document in state "${document.state}". Document must be in "posted" state.`
    );
  }

  if (document.reversalId) {
    throw new Error(`Document ${documentId} is already reversed`);
  }

  // Step 3: Get original event for this document
  const [originalEvent] = await db
    .select()
    .from(economicEvents)
    .where(eq(economicEvents.documentId, documentId))
    .limit(1);

  if (!originalEvent) {
    throw new Error(`No event found for document ${documentId}`);
  }

  // Step 4: Create reversal entry
  const reversalResult = await createReversalEntry(db, {
    originalEventId: originalEvent.id,
    tenantId,
    userId,
    reason,
    reversalDate,
    context,
  });

  // Step 5: Update document state to reversed
  await db
    .update(documents)
    .set({
      state: "reversed",
      reversalId: reversalResult.event.id,
      updatedAt: new Date(),
    })
    .where(eq(documents.id, documentId));

  return reversalResult;
}

/**
 * Check if event is reversed.
 *
 * @param db - Drizzle database instance
 * @param eventId - Event UUID
 * @returns true if event is reversed, false otherwise
 */
export async function isEventReversed(
  db: Database,
  eventId: string
): Promise<boolean> {
  const event = await getEventById(db, eventId);
  return event?.reversalId !== null && event?.reversalId !== undefined;
}

/**
 * Find original event from reversal.
 *
 * If given a reversal event, returns the original event.
 * If given an original event, returns the same event.
 *
 * @param db - Drizzle database instance
 * @param eventId - Event UUID (original or reversal)
 * @returns Original event
 */
export async function findOriginalEvent(
  db: Database,
  eventId: string
): Promise<Awaited<ReturnType<typeof getEventById>>> {
  const event = await getEventById(db, eventId);

  if (!event) {
    throw new Error(`Event not found: ${eventId}`);
  }

  // If this is a reversal, get the original
  if (event.isReversal === "true" && event.reversedFromId) {
    return await getEventById(db, event.reversedFromId);
  }

  // Otherwise, return the event itself (it's already the original)
  return event;
}
