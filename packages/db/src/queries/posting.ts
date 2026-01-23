/**
 * Posting Spine query functions using Drizzle ORM.
 *
 * Implements B1 — Posting Spine (Canonical truth layer).
 *
 * Key principles:
 * - State machine transitions (DRAFT → SUBMITTED → APPROVED → POSTED)
 * - Immutability after POSTED
 * - Journal balance enforcement (Debits = Credits)
 * - Idempotency (same operation twice = same result)
 * - 6W1H context recording
 * - Reversal creates new entries (never mutates)
 */

import { eq, and, sql, desc } from "drizzle-orm";
import type { Database } from "../client/neon";
import {
  documents,
  economicEvents,
  ledgerPostings,
  accounts,
  postingIdempotencyKeys,
  type Document,
  type NewDocument,
  type DocumentState,
  type EconomicEvent,
  type NewEconomicEvent,
  type LedgerPosting,
  type SixW1HContext,
  type DangerZoneMetadata,
  type Account,
} from "../schema";
import { writeToOutbox } from "../outbox";

// ============================================================================
// Document Queries
// ============================================================================

/**
 * Find document by ID.
 */
export async function findDocumentById(
  db: Database,
  { tenantId, documentId }: { tenantId: string; documentId: string }
): Promise<Document | null> {
  const result = await db.query.documents.findFirst({
    where: and(eq(documents.id, documentId), eq(documents.tenantId, tenantId)),
  });
  return result ?? null;
}

/**
 * Find document by document number.
 */
export async function findDocumentByNumber(
  db: Database,
  { tenantId, documentNumber }: { tenantId: string; documentNumber: string }
): Promise<Document | null> {
  const result = await db.query.documents.findFirst({
    where: and(
      eq(documents.documentNumber, documentNumber),
      eq(documents.tenantId, tenantId)
    ),
  });
  return result ?? null;
}

/**
 * List documents for a tenant with filters.
 */
export async function listDocuments(
  db: Database,
  params: {
    tenantId: string;
    state?: DocumentState;
    limit?: number;
    offset?: number;
  }
): Promise<Document[]> {
  const { tenantId, state, limit = 50, offset = 0 } = params;

  const conditions = [eq(documents.tenantId, tenantId)];
  if (state) {
    conditions.push(eq(documents.state, state));
  }

  return db.query.documents.findMany({
    where: and(...conditions),
    orderBy: [desc(documents.createdAt)],
    limit,
    offset,
  });
}

/**
 * Validate state transition.
 */
export function isValidStateTransition(
  currentState: DocumentState,
  newState: DocumentState
): boolean {
  const validTransitions: Record<DocumentState, DocumentState[]> = {
    draft: ["submitted", "voided"],
    submitted: ["approved", "draft", "voided"],
    approved: ["posted", "submitted", "voided"],
    posted: ["reversed"],
    reversed: [], // Terminal state
    voided: [], // Terminal state
  };

  return validTransitions[currentState]?.includes(newState) ?? false;
}

// ============================================================================
// Document State Transitions (B01 §3)
// ============================================================================

/**
 * Create a new document in DRAFT state.
 */
export async function createDocument(
  db: Database,
  params: {
    tenantId: string;
    userId: string;
    data: Omit<NewDocument, "tenantId" | "createdBy" | "modifiedBy" | "id">;
  }
): Promise<Document> {
  const { tenantId, userId, data } = params;

  const [newDoc] = await db
    .insert(documents)
    .values({
      ...data,
      tenantId,
      createdBy: userId,
      modifiedBy: userId,
    })
    .returning();

  if (!newDoc) {
    throw new Error("Failed to create document");
  }

  return newDoc;
}

/**
 * Update document (only allowed in DRAFT or SUBMITTED states).
 */
export async function updateDocument(
  db: Database,
  params: {
    tenantId: string;
    userId: string;
    documentId: string;
    data: Partial<NewDocument>;
  }
): Promise<Document | null> {
  const { tenantId, userId, documentId, data } = params;

  // Verify document exists and is editable
  const existing = await findDocumentById(db, { tenantId, documentId });
  if (!existing) return null;

  if (!["draft", "submitted"].includes(existing.state)) {
    throw new Error(
      `Cannot update document in ${existing.state} state. Only DRAFT and SUBMITTED documents can be edited.`
    );
  }

  const [updated] = await db
    .update(documents)
    .set({
      ...data,
      modifiedBy: userId,
      updatedAt: new Date(),
      version: sql`${documents.version} + 1`,
    })
    .where(
      and(eq(documents.id, documentId), eq(documents.tenantId, tenantId))
    )
    .returning();

  return updated ?? null;
}

/**
 * Transition document state.
 */
export async function transitionDocumentState(
  db: Database,
  params: {
    tenantId: string;
    userId: string;
    documentId: string;
    newState: DocumentState;
    context6w1h: SixW1HContext;
    dangerZone?: DangerZoneMetadata;
  }
): Promise<Document | null> {
  const { tenantId, userId, documentId, newState, context6w1h, dangerZone } =
    params;

  // Verify document exists
  const existing = await findDocumentById(db, { tenantId, documentId });
  if (!existing) return null;

  // Validate state transition
  if (!isValidStateTransition(existing.state, newState)) {
    throw new Error(
      `Invalid state transition: ${existing.state} → ${newState}`
    );
  }

  const [updated] = await db
    .update(documents)
    .set({
      state: newState,
      context6w1h,
      dangerZone,
      modifiedBy: userId,
      updatedAt: new Date(),
      version: sql`${documents.version} + 1`,
    })
    .where(
      and(eq(documents.id, documentId), eq(documents.tenantId, tenantId))
    )
    .returning();

  return updated ?? null;
}

// ============================================================================
// Posting Pipeline (B01 §4)
// ============================================================================

/**
 * Post document (APPROVED → POSTED).
 * Creates economic events and ledger postings atomically.
 *
 * This is the core posting engine that implements:
 * - Document state transition
 * - Economic event creation (immutable truth)
 * - Ledger posting generation (double-entry)
 * - Journal balance enforcement
 * - Idempotency (via idempotency key)
 */
export async function postDocument(
  db: Database,
  params: {
    tenantId: string;
    userId: string;
    documentId: string;
    postingDate: Date;
    context6w1h: SixW1HContext;
    idempotencyKey?: string;
    generatePostings: (
      document: Document
    ) => Promise<
      Array<{
        eventType: NewEconomicEvent["eventType"];
        description: string;
        amount: string;
        postings: Array<{
          accountId: string;
          direction: "debit" | "credit";
          amount: string;
          description: string;
        }>;
      }>
    >;
  }
): Promise<{
  document: Document;
  events: EconomicEvent[];
  postings: LedgerPosting[];
}> {
  const { tenantId, userId, documentId, postingDate, context6w1h, idempotencyKey, generatePostings } = params;

  return await db.transaction(async (tx) => {
    // 0. Check idempotency key (if provided)
    if (idempotencyKey) {
      const existingKey = await tx.query.postingIdempotencyKeys.findFirst({
        where: and(
          eq(postingIdempotencyKeys.tenantId, tenantId),
          eq(postingIdempotencyKeys.idempotencyKey, idempotencyKey)
        ),
      });

      if (existingKey) {
        // Return existing result
        const existingDoc = await tx.query.documents.findFirst({
          where: and(
            eq(documents.id, existingKey.documentId),
            eq(documents.tenantId, tenantId)
          ),
        });

        if (!existingDoc) {
          throw new Error("Idempotency key exists but document not found");
        }

        const existingEvents = await tx.query.economicEvents.findMany({
          where: and(
            eq(economicEvents.documentId, existingDoc.id),
            eq(economicEvents.tenantId, tenantId)
          ),
        });

        const allPostings: LedgerPosting[] = [];
        for (const event of existingEvents) {
          const eventPostings = await tx.query.ledgerPostings.findMany({
            where: and(
              eq(ledgerPostings.economicEventId, event.id),
              eq(ledgerPostings.tenantId, tenantId)
            ),
          });
          allPostings.push(...eventPostings);
        }

        return {
          document: existingDoc,
          events: existingEvents,
          postings: allPostings,
        };
      }
    }

    // 1. Get document and verify state
    const doc = await tx.query.documents.findFirst({
      where: and(eq(documents.id, documentId), eq(documents.tenantId, tenantId)),
    });

    if (!doc) {
      throw new Error(`Document ${documentId} not found`);
    }

    if (doc.state !== "approved") {
      throw new Error(
        `Cannot post document in ${doc.state} state. Must be APPROVED.`
      );
    }

    if (doc.postedAt) {
      // Already posted (fallback idempotency check)
      const existingEvents = await tx.query.economicEvents.findMany({
        where: and(
          eq(economicEvents.documentId, documentId),
          eq(economicEvents.tenantId, tenantId)
        ),
      });

      const eventId = existingEvents[0]?.id;
      if (!eventId) {
        throw new Error("Document posted but no events found");
      }

      const existingPostings = await tx.query.ledgerPostings.findMany({
        where: and(
          eq(ledgerPostings.economicEventId, eventId),
          eq(ledgerPostings.tenantId, tenantId)
        ),
      });

      return {
        document: doc,
        events: existingEvents,
        postings: existingPostings,
      };
    }

    // 2. Generate economic events and postings
    const eventsToCreate = await generatePostings(doc);

    if (eventsToCreate.length === 0) {
      throw new Error("No economic events generated for document");
    }

    // 3. Create economic events
    const createdEvents: EconomicEvent[] = [];
    const createdPostings: LedgerPosting[] = [];

    for (const eventData of eventsToCreate) {
      const [event] = await tx
        .insert(economicEvents)
        .values({
          tenantId,
          documentId,
          eventType: eventData.eventType,
          description: eventData.description,
          eventDate: postingDate,
          amount: eventData.amount,
          currency: "USD", // TODO: Get from document
          data: {},
          context6w1h,
          isReversal: "false",
          createdBy: userId,
        })
        .returning();

      if (!event) {
        throw new Error("Failed to create economic event");
      }

      createdEvents.push(event);

      // 4. Create ledger postings
      const batchId = crypto.randomUUID();

      // Validate journal balance before insert
      let totalDebits = 0;
      let totalCredits = 0;

      for (const posting of eventData.postings) {
        const amount = parseFloat(posting.amount);
        if (posting.direction === "debit") {
          totalDebits += amount;
        } else {
          totalCredits += amount;
        }
      }

      if (Math.abs(totalDebits - totalCredits) >= 0.0001) {
        throw new Error(
          `Journal balance violation: Debits (${totalDebits}) ≠ Credits (${totalCredits})`
        );
      }

      // Insert postings
      for (const posting of eventData.postings) {
        const [newPosting] = await tx
          .insert(ledgerPostings)
          .values({
            tenantId,
            economicEventId: event.id,
            batchId,
            accountId: posting.accountId,
            direction: posting.direction,
            amount: posting.amount,
            currency: "USD", // TODO: Get from event
            postingDate,
            description: posting.description,
            isReversal: "false",
            createdBy: userId,
          })
          .returning();

        if (!newPosting) {
          throw new Error("Failed to create ledger posting");
        }

        createdPostings.push(newPosting);
      }
    }

    // 5. Update document state to POSTED
    const [postedDoc] = await tx
      .update(documents)
      .set({
        state: "posted",
        postedAt: new Date(),
        postedBy: userId,
        context6w1h,
        modifiedBy: userId,
        updatedAt: new Date(),
        version: sql`${documents.version} + 1`,
      })
      .where(
        and(eq(documents.id, documentId), eq(documents.tenantId, tenantId))
      )
      .returning();

    if (!postedDoc) {
      throw new Error("Failed to update document to POSTED state");
    }

    // 6. Store idempotency key (if provided)
    if (idempotencyKey) {
      await tx.insert(postingIdempotencyKeys).values({
        tenantId,
        idempotencyKey,
        documentId: postedDoc.id,
      });
    }

    // 7. Write to outbox for cross-domain event publishing (B02)
    const correlationId = crypto.randomUUID();
    await writeToOutbox(tx, tenantId, {
      eventType: `${postedDoc.documentType}.posted`,
      eventId: crypto.randomUUID(),
      correlationId,
      sourceDomain: "posting",
      sourceAggregateType: "document",
      sourceAggregateId: postedDoc.id,
      payload: {
        documentId: postedDoc.id,
        documentNumber: postedDoc.documentNumber,
        documentType: postedDoc.documentType,
        postingDate: postingDate.toISOString(),
        postedBy: userId,
        eventsCreated: createdEvents.length,
        postingsCreated: createdPostings.length,
        context6w1h,
      },
    });

    return {
      document: postedDoc,
      events: createdEvents,
      postings: createdPostings,
    };
  });
}

// ============================================================================
// Reversal (B01 §3, §4)
// ============================================================================

/**
 * Reverse a posted document.
 * Creates a new document with reversed postings (immutable pattern).
 */
export async function reverseDocument(
  db: Database,
  params: {
    tenantId: string;
    userId: string;
    documentId: string;
    reversalDate: Date;
    context6w1h: SixW1HContext;
  }
): Promise<{
  originalDocument: Document;
  reversalDocument: Document;
  reversalEvents: EconomicEvent[];
  reversalPostings: LedgerPosting[];
}> {
  const { tenantId, userId, documentId, reversalDate, context6w1h } = params;

  return await db.transaction(async (tx) => {
    // 1. Get original document
    const originalDoc = await tx.query.documents.findFirst({
      where: and(eq(documents.id, documentId), eq(documents.tenantId, tenantId)),
    });

    if (!originalDoc) {
      throw new Error(`Document ${documentId} not found`);
    }

    if (originalDoc.state !== "posted") {
      throw new Error(
        `Cannot reverse document in ${originalDoc.state} state. Must be POSTED.`
      );
    }

    if (originalDoc.reversalId) {
      throw new Error(`Document ${documentId} already reversed`);
    }

    // 2. Create reversal document
    const reversalDocNumber = `${originalDoc.documentNumber}-REV`;
    const [reversalDoc] = await tx
      .insert(documents)
      .values({
        tenantId,
        documentType: originalDoc.documentType,
        state: "posted", // Reversals are auto-posted
        documentNumber: reversalDocNumber,
        documentDate: reversalDate,
        entityId: originalDoc.entityId,
        data: originalDoc.data,
        context6w1h,
        reversedFromId: originalDoc.id,
        createdBy: userId,
        modifiedBy: userId,
        postedAt: new Date(),
        postedBy: userId,
      })
      .returning();

    if (!reversalDoc) {
      throw new Error("Failed to create reversal document");
    }

    // 3. Get original events and postings
    const originalEvents = await tx.query.economicEvents.findMany({
      where: and(
        eq(economicEvents.documentId, documentId),
        eq(economicEvents.tenantId, tenantId)
      ),
    });

    const reversalEvents: EconomicEvent[] = [];
    const reversalPostings: LedgerPosting[] = [];

    // 4. Create reversal events and postings
    for (const originalEvent of originalEvents) {
      const originalPostings = await tx.query.ledgerPostings.findMany({
        where: and(
          eq(ledgerPostings.economicEventId, originalEvent.id),
          eq(ledgerPostings.tenantId, tenantId)
        ),
      });

      // Create reversal event
      const [reversalEvent] = await tx
        .insert(economicEvents)
        .values({
          tenantId,
          documentId: reversalDoc.id,
          eventType: originalEvent.eventType,
          description: `REVERSAL: ${originalEvent.description}`,
          eventDate: reversalDate,
          amount: originalEvent.amount,
          currency: originalEvent.currency,
          data: originalEvent.data,
          context6w1h,
          isReversal: "true",
          reversedFromId: originalEvent.id,
          createdBy: userId,
        })
        .returning();

      if (!reversalEvent) {
        throw new Error("Failed to create reversal event");
      }

      reversalEvents.push(reversalEvent);

      // Create reversal postings (flip debits/credits)
      const batchId = crypto.randomUUID();

      for (const originalPosting of originalPostings) {
        const [reversalPosting] = await tx
          .insert(ledgerPostings)
          .values({
            tenantId,
            economicEventId: reversalEvent.id,
            batchId,
            accountId: originalPosting.accountId,
            direction:
              originalPosting.direction === "debit" ? "credit" : "debit", // Flip direction
            amount: originalPosting.amount,
            currency: originalPosting.currency,
            postingDate: reversalDate,
            description: `REVERSAL: ${originalPosting.description}`,
            isReversal: "true",
            reversedFromId: originalPosting.id,
            createdBy: userId,
          })
          .returning();

        if (!reversalPosting) {
          throw new Error("Failed to create reversal posting");
        }

        reversalPostings.push(reversalPosting);
      }

      // Link original event to reversal
      await tx
        .update(economicEvents)
        .set({ reversalId: reversalEvent.id })
        .where(eq(economicEvents.id, originalEvent.id));

      // Link original postings to reversals
      for (let i = 0; i < originalPostings.length; i++) {
        const originalPosting = originalPostings[i];
        const reversalPosting = reversalPostings[i];
        if (originalPosting && reversalPosting) {
          await tx
            .update(ledgerPostings)
            .set({ reversalId: reversalPosting.id })
            .where(eq(ledgerPostings.id, originalPosting.id));
        }
      }
    }

    // 5. Update original document state
    const [updatedOriginal] = await tx
      .update(documents)
      .set({
        state: "reversed",
        reversalId: reversalDoc.id,
        modifiedBy: userId,
        updatedAt: new Date(),
        version: sql`${documents.version} + 1`,
      })
      .where(
        and(eq(documents.id, documentId), eq(documents.tenantId, tenantId))
      )
      .returning();

    if (!updatedOriginal) {
      throw new Error("Failed to update original document");
    }

    // 6. Write to outbox for cross-domain event publishing (B02)
    const correlationId = crypto.randomUUID();
    await writeToOutbox(tx, tenantId, {
      eventType: `${reversalDoc.documentType}.reversed`,
      eventId: crypto.randomUUID(),
      correlationId,
      sourceDomain: "posting",
      sourceAggregateType: "document",
      sourceAggregateId: reversalDoc.id,
      payload: {
        reversalDocumentId: reversalDoc.id,
        reversalDocumentNumber: reversalDoc.documentNumber,
        originalDocumentId: updatedOriginal.id,
        originalDocumentNumber: updatedOriginal.documentNumber,
        documentType: reversalDoc.documentType,
        reversalDate: reversalDate.toISOString(),
        reversedBy: userId,
        eventsCreated: reversalEvents.length,
        postingsCreated: reversalPostings.length,
        context6w1h,
      },
    });

    return {
      originalDocument: updatedOriginal,
      reversalDocument: reversalDoc,
      reversalEvents,
      reversalPostings,
    };
  });
}

// ============================================================================
// Account Queries
// ============================================================================

/**
 * Find account by code.
 */
export async function findAccountByCode(
  db: Database,
  { tenantId, code }: { tenantId: string; code: string }
): Promise<Account | null> {
  const result = await db.query.accounts.findFirst({
    where: and(eq(accounts.tenantId, tenantId), eq(accounts.code, code)),
  });
  return result ?? null;
}

/**
 * List accounts for a tenant.
 */
export async function listAccounts(
  db: Database,
  { tenantId }: { tenantId: string }
): Promise<Account[]> {
  return db.query.accounts.findMany({
    where: and(eq(accounts.tenantId, tenantId), eq(accounts.isActive, "true")),
    orderBy: [accounts.code],
  });
}

/**
 * Get account balance (sum of postings).
 */
export async function getAccountBalance(
  db: Database,
  params: {
    tenantId: string;
    accountId: string;
    asOfDate?: Date;
  }
): Promise<{ balance: number; debitTotal: number; creditTotal: number }> {
  const { tenantId, accountId, asOfDate } = params;

  const conditions = [
    eq(ledgerPostings.tenantId, tenantId),
    eq(ledgerPostings.accountId, accountId),
  ];

  if (asOfDate) {
    conditions.push(sql`${ledgerPostings.postingDate} <= ${asOfDate}`);
  }

  const result = await db
    .select({
      debitTotal: sql<string>`COALESCE(SUM(CASE WHEN ${ledgerPostings.direction} = 'debit' THEN ${ledgerPostings.amount}::numeric ELSE 0 END), 0)`,
      creditTotal: sql<string>`COALESCE(SUM(CASE WHEN ${ledgerPostings.direction} = 'credit' THEN ${ledgerPostings.amount}::numeric ELSE 0 END), 0)`,
    })
    .from(ledgerPostings)
    .where(and(...conditions));

  const debitTotal = parseFloat(result[0]?.debitTotal ?? "0");
  const creditTotal = parseFloat(result[0]?.creditTotal ?? "0");
  const balance = debitTotal - creditTotal;

  return { balance, debitTotal, creditTotal };
}
