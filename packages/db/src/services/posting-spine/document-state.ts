/**
 * Document State Machine Service
 *
 * Implements B01 Layer 1 (Documents - Workflow Layer).
 *
 * Key Principles (from B01 §2):
 * - Editable until POSTED
 * - State machine governs transitions
 * - Human-facing (forms, approvals)
 * - POST action triggers event → posting creation
 *
 * State Flow:
 * ```
 * draft → submitted → approved → posted → [completed]
 *                                    ↓
 *                                 reversed
 * ```
 *
 * @example
 * ```typescript
 * // Transition document to posted state
 * const result = await postDocument(db, {
 *   documentId: "...",
 *   tenantId: "...",
 *   userId: "...",
 *   postingDate: new Date(),
 *   eventData: { ... },
 *   postings: [ ... ],
 * });
 *
 * console.log(result.document.state); // "posted"
 * console.log(result.event.id); // Economic event UUID
 * console.log(result.postings.length); // 2 (DR + CR)
 * ```
 */

import { eq } from "drizzle-orm";
import type { Database } from "../../client";
import { executePostingSpineTransaction } from "../../client";
import { documents, type Document } from "../../schema";
import {
  createEconomicEvent,
  build6W1HContext,
} from "./event-service";
import { createGLPostings, type GLPostingInput } from "./posting-service";
import type { DocumentState, EventType } from "@axis/registry/types";

/**
 * Valid document state transitions
 * Based on DOCUMENT_STATE_MACHINE from @axis/registry
 */
const STATE_TRANSITIONS: Record<DocumentState, DocumentState[]> = {
  draft: ["submitted", "voided"],
  submitted: ["approved", "draft", "voided"],
  approved: ["posted", "submitted", "voided"],
  posted: ["reversed"],
  reversed: [],
  voided: [],
};

/**
 * Post document input
 * 
 * The context field accepts either:
 * - A simplified version with just where/why/how strings
 * - A full SixW1HContext object (the full context will be extracted)
 */
export interface PostDocumentInput {
  documentId: string;
  tenantId: string;
  userId: string;
  postingDate: Date;
  eventType: EventType;
  eventDescription: string;
  eventAmount?: string;
  eventCurrency?: string;
  eventData: Record<string, unknown>;
  postings: GLPostingInput[];
  context?: {
    where?: string | { system: string; ipAddress?: string; geolocation?: string };
    why?: string | { reason: string; approvalRef?: string; policyRef?: string };
    how?: string | { method: string; validation: string; dataSource?: string };
  };
}

/**
 * Post document result
 */
export interface PostDocumentResult {
  document: Document;
  event: Awaited<ReturnType<typeof createEconomicEvent>>;
  postings: Awaited<ReturnType<typeof createGLPostings>>["postings"];
  isBalanced: boolean;
}

/**
 * Post document (transition to POSTED state + create event + postings).
 *
 * This is the core integration point between Layer 1 (Documents) and
 * Layer 2/3 (Events/Postings).
 *
 * @param db - Drizzle database instance
 * @param input - Post document input
 * @returns Post document result
 *
 * @throws Error if document is not in approved state
 * @throws Error if postings are not balanced
 * @throws Error if posting fails
 */
export async function postDocument(
  db: Database,
  input: PostDocumentInput
): Promise<PostDocumentResult> {
  const {
    documentId,
    tenantId,
    userId,
    postingDate,
    eventType,
    eventDescription,
    eventAmount,
    eventCurrency = "USD",
    eventData,
    postings,
    context,
  } = input;

  // Step 1: Get current document state
  const [document] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, documentId))
    .limit(1);

  if (!document) {
    throw new Error(`Document not found: ${documentId}`);
  }

  // Step 2: Validate state transition (approved → posted)
  if (document.state !== "approved") {
    throw new Error(
      `Cannot post document in state "${document.state}". Document must be in "approved" state.`
    );
  }

  if (!canTransitionTo(document.state, "posted")) {
    throw new Error(
      `Invalid state transition: ${document.state} → posted`
    );
  }

  // Step 3: Build 6W1H context
  // Handle both simplified string context and full object context
  const whereValue = typeof context?.where === 'object' 
    ? context.where.system 
    : (context?.where || "posting-service");
  const whyValue = typeof context?.why === 'object'
    ? context.why.reason
    : context?.why;
  const howValue = typeof context?.how === 'object'
    ? context.how.method
    : (context?.how || "Document POST action");

  const context6w1h = build6W1HContext({
    who: userId,
    what: eventDescription,
    where: whereValue,
    why: whyValue,
    which: documentId,
    how: howValue,
  });

  // Step 4: Execute posting spine transaction (atomic)
  const result = await executePostingSpineTransaction(db, {
    event: {
      tenantId,
      documentId,
      eventType,
      description: eventDescription,
      eventDate: postingDate,
      amount: eventAmount,
      currency: eventCurrency,
      data: eventData,
      context6w1h,
      createdBy: userId,
    },
    postings: postings.map((p) => ({
      tenantId,
      economicEventId: "", // Will be filled by transaction
      batchId: "", // Will be filled by transaction
      ...p,
      postingDate,
      currency: eventCurrency,
      createdBy: userId,
    })),
    validateBalance: true,
  });

  // Step 5: Update document state to POSTED
  const [updatedDocument] = await db
    .update(documents)
    .set({
      state: "posted",
      updatedAt: new Date(),
    })
    .where(eq(documents.id, documentId))
    .returning();

  if (!updatedDocument) {
    throw new Error("Failed to update document state");
  }

  return {
    document: updatedDocument,
    event: result.event,
    postings: result.postings,
    isBalanced: result.isBalanced,
  };
}

/**
 * Transition document state.
 *
 * @param db - Drizzle database instance
 * @param documentId - Document UUID
 * @param newState - Target state
 * @returns Updated document
 *
 * @throws Error if transition is invalid
 */
export async function transitionDocumentState(
  db: Database,
  documentId: string,
  newState: DocumentState
): Promise<Document> {
  // Get current document
  const [document] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, documentId))
    .limit(1);

  if (!document) {
    throw new Error(`Document not found: ${documentId}`);
  }

  // Validate transition
  if (!canTransitionTo(document.state, newState)) {
    throw new Error(
      `Invalid state transition: ${document.state} → ${newState}`
    );
  }

  // Update state
  const [updated] = await db
    .update(documents)
    .set({
      state: newState,
      updatedAt: new Date(),
    })
    .where(eq(documents.id, documentId))
    .returning();

  if (!updated) {
    throw new Error("Failed to transition document state");
  }

  return updated;
}

/**
 * Check if state transition is valid.
 *
 * @param currentState - Current document state
 * @param targetState - Target document state
 * @returns true if transition is valid, false otherwise
 */
export function canTransitionTo(
  currentState: DocumentState,
  targetState: DocumentState
): boolean {
  const allowedTransitions = STATE_TRANSITIONS[currentState];
  return allowedTransitions?.includes(targetState) || false;
}

/**
 * Get allowed transitions for document state.
 *
 * @param currentState - Current document state
 * @returns Array of allowed target states
 */
export function getAllowedTransitions(
  currentState: DocumentState
): DocumentState[] {
  return STATE_TRANSITIONS[currentState] || [];
}

/**
 * Check if document can be posted.
 *
 * @param document - Document to check
 * @returns true if document can be posted, false otherwise
 */
export function canPostDocument(document: Document): boolean {
  return document.state === "approved";
}

/**
 * Check if document is posted.
 *
 * @param document - Document to check
 * @returns true if document is posted, false otherwise
 */
export function isDocumentPosted(document: Document): boolean {
  return document.state === "posted";
}

/**
 * Check if document is editable.
 *
 * @param document - Document to check
 * @returns true if document is editable, false otherwise
 */
export function isDocumentEditable(document: Document): boolean {
  return document.state === "draft";
}
