/**
 * Reversal Tracking Service
 *
 * Provides UI-friendly queries for reversal chains and state tracking.
 * Helps answer questions like:
 * - Is this document reversed?
 * - What's the reversal chain?
 * - Which documents are reversals of other documents?
 *
 * @example
 * ```typescript
 * // Check if invoice is reversed
 * const reversed = await isDocumentReversed(db, invoiceId);
 * if (reversed) {
 *   console.log("⚠️ This invoice has been reversed");
 * }
 *
 * // Get full reversal chain
 * const chain = await getReversalChain(db, documentId);
 * console.log(`Chain: ${chain.length} documents`);
 * ```
 */

import { eq } from "drizzle-orm";
import type { Database } from "../../client";
import { documents, type Document } from "../../schema";
import { getEventsByDocument } from "./event-service";

/**
 * Reversal chain entry
 */
export interface ReversalChainEntry {
  document: Document;
  event: Awaited<ReturnType<typeof getEventsByDocument>>[0];
  isReversal: boolean;
  isReversed: boolean;
}

/**
 * Get reversal chain for document.
 *
 * Returns original document + all reversals in chronological order.
 *
 * @param db - Drizzle database instance
 * @param documentId - Document UUID (original or reversal)
 * @returns Reversal chain (original first, reversals follow)
 *
 * @example
 * ```typescript
 * // Original invoice created and posted
 * // User realizes error and creates reversal
 * // Chain: [original invoice, reversal invoice]
 * const chain = await getReversalChain(db, originalInvoiceId);
 * console.log(chain[0].isReversal); // false
 * console.log(chain[0].isReversed); // true
 * console.log(chain[1].isReversal); // true
 * console.log(chain[1].isReversed); // false
 * ```
 */
export async function getReversalChain(
  db: Database,
  documentId: string
): Promise<ReversalChainEntry[]> {
  const document = await db
    .select()
    .from(documents)
    .where(eq(documents.id, documentId))
    .limit(1)
    .then((rows) => rows[0]);

  if (!document) {
    throw new Error(`Document not found: ${documentId}`);
  }

  // If this is a reversal, find the original
  let originalId =
    document.reversedFromId ? document.reversedFromId : document.id;

  // Get original document
  const original = await db
    .select()
    .from(documents)
    .where(eq(documents.id, originalId))
    .limit(1)
    .then((rows) => rows[0]);

  if (!original) {
    throw new Error(`Original document not found: ${originalId}`);
  }

  // Get all reversals of the original
  const reversals = await db
    .select()
    .from(documents)
    .where(eq(documents.reversedFromId, originalId))
    .orderBy(documents.createdAt);

  // Build chain entries
  const chain: ReversalChainEntry[] = [];

  // Add original
  const originalEvents = await getEventsByDocument(db, original.id);
  chain.push({
    document: original,
    event: originalEvents[0]!,
    isReversal: false,
    isReversed: original.reversalId !== null,
  });

  // Add reversals
  for (const reversal of reversals) {
    const reversalEvents = await getEventsByDocument(db, reversal.id);
    chain.push({
      document: reversal,
      event: reversalEvents[0]!,
      isReversal: true,
      isReversed: reversal.reversalId !== null,
    });
  }

  return chain;
}

/**
 * Check if document is reversed.
 *
 * @param db - Drizzle database instance
 * @param documentId - Document UUID
 * @returns true if document is reversed, false otherwise
 */
export async function isDocumentReversed(
  db: Database,
  documentId: string
): Promise<boolean> {
  const [document] = await db
    .select({ reversalId: documents.reversalId })
    .from(documents)
    .where(eq(documents.id, documentId))
    .limit(1);

  return document?.reversalId !== null && document?.reversalId !== undefined;
}

/**
 * Check if document is a reversal.
 *
 * @param db - Drizzle database instance
 * @param documentId - Document UUID
 * @returns true if document is a reversal, false otherwise
 */
export async function isDocumentReversal(
  db: Database,
  documentId: string
): Promise<boolean> {
  const [document] = await db
    .select({ reversedFromId: documents.reversedFromId })
    .from(documents)
    .where(eq(documents.id, documentId))
    .limit(1);

  return (
    document?.reversedFromId !== null && document?.reversedFromId !== undefined
  );
}

/**
 * Find original document from reversal.
 *
 * If given a reversal document, returns the original document.
 * If given an original document, returns the same document.
 *
 * @param db - Drizzle database instance
 * @param documentId - Document UUID (original or reversal)
 * @returns Original document
 */
export async function findOriginalDocument(
  db: Database,
  documentId: string
): Promise<Document> {
  const [document] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, documentId))
    .limit(1);

  if (!document) {
    throw new Error(`Document not found: ${documentId}`);
  }

  // If this is a reversal, get the original
  if (document.reversedFromId) {
    const [original] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, document.reversedFromId))
      .limit(1);

    if (!original) {
      throw new Error(`Original document not found: ${document.reversedFromId}`);
    }

    return original;
  }

  // Otherwise, return the document itself (it's already the original)
  return document;
}

/**
 * Get all reversals for document.
 *
 * @param db - Drizzle database instance
 * @param documentId - Original document UUID
 * @returns Array of reversal documents
 */
export async function getReversalsForDocument(
  db: Database,
  documentId: string
): Promise<Document[]> {
  return await db
    .select()
    .from(documents)
    .where(eq(documents.reversedFromId, documentId))
    .orderBy(documents.createdAt);
}

/**
 * Get reversal count for document.
 *
 * @param db - Drizzle database instance
 * @param documentId - Original document UUID
 * @returns Number of times the document has been reversed
 */
export async function getReversalCount(
  db: Database,
  documentId: string
): Promise<number> {
  const reversals = await getReversalsForDocument(db, documentId);
  return reversals.length;
}

/**
 * Reversal status for UI display
 */
export interface ReversalStatus {
  isReversed: boolean;
  isReversal: boolean;
  reversalCount: number;
  originalDocumentId?: string;
  reversalDocumentIds: string[];
  displayStatus:
    | "active"
    | "reversed"
    | "reversal"
    | "reversed-multiple";
}

/**
 * Get reversal status for document (UI-friendly).
 *
 * Returns complete reversal state for easy UI display.
 *
 * @param db - Drizzle database instance
 * @param documentId - Document UUID
 * @returns Reversal status
 *
 * @example
 * ```typescript
 * const status = await getReversalStatus(db, invoiceId);
 *
 * if (status.displayStatus === "reversed") {
 *   return <Badge variant="destructive">REVERSED</Badge>;
 * }
 *
 * if (status.displayStatus === "reversal") {
 *   return <Badge variant="secondary">REVERSAL</Badge>;
 * }
 * ```
 */
export async function getReversalStatus(
  db: Database,
  documentId: string
): Promise<ReversalStatus> {
  const [document] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, documentId))
    .limit(1);

  if (!document) {
    throw new Error(`Document not found: ${documentId}`);
  }

  const isReversed = document.reversalId !== null;
  const isReversal = document.reversedFromId !== null;
  const reversals = await getReversalsForDocument(db, documentId);
  const reversalCount = reversals.length;

  let displayStatus: ReversalStatus["displayStatus"];
  if (isReversal) {
    displayStatus = "reversal";
  } else if (reversalCount > 1) {
    displayStatus = "reversed-multiple";
  } else if (isReversed) {
    displayStatus = "reversed";
  } else {
    displayStatus = "active";
  }

  return {
    isReversed,
    isReversal,
    reversalCount,
    originalDocumentId: document.reversedFromId || undefined,
    reversalDocumentIds: reversals.map((r) => r.id),
    displayStatus,
  };
}
