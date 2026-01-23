/**
 * Posting Persistence Service
 *
 * Implements B01 Layer 3 (Postings - Math Layer).
 *
 * Key Principles (from B01 §2):
 * - IMMUTABLE once created
 * - Debits = Credits (always)
 * - Ledger lines + stock valuation lines
 * - Batch ID groups related postings
 *
 * @example
 * ```typescript
 * // Create balanced GL postings for invoice
 * const result = await createGLPostings(db, {
 *   tenantId,
 *   economicEventId,
 *   postings: [
 *     {
 *       accountId: arAccountId,
 *       direction: "debit",
 *       amount: "1000.0000",
 *       description: "AR - Customer X",
 *     },
 *     {
 *       accountId: revenueAccountId,
 *       direction: "credit",
 *       amount: "1000.0000",
 *       description: "Revenue - Product Y",
 *     },
 *   ],
 *   postingDate: new Date(),
 *   createdBy: userId,
 * });
 *
 * console.log(result.isBalanced); // true
 * console.log(result.totalDebit); // "1000.0000"
 * console.log(result.totalCredit); // "1000.0000"
 * ```
 */

import { eq, and, desc } from "drizzle-orm";
import type { Database } from "../../client";
import {
  ledgerPostings,
  type NewLedgerPosting,
  type LedgerPosting,
} from "../../schema";
import type { PostingDirection } from "@axis/registry/types";
import {
  validatePostingBalance,
  subtractDecimal,
} from "../../client/posting-transaction";

/**
 * GL Posting input (simplified)
 */
export interface GLPostingInput {
  accountId: string;
  direction: PostingDirection;
  amount: string; // Decimal string (e.g., "1000.0000")
  description: string;
  metadata?: Record<string, unknown>;
}

/**
 * Create GL postings input
 */
export interface CreateGLPostingsInput {
  tenantId: string;
  economicEventId: string;
  postings: GLPostingInput[];
  postingDate: Date;
  currency?: string;
  createdBy: string;
}

/**
 * GL Postings result
 */
export interface GLPostingsResult {
  postings: LedgerPosting[];
  batchId: string;
  totalDebit: string;
  totalCredit: string;
  isBalanced: boolean;
}

/**
 * Create GL postings.
 *
 * Creates balanced ledger postings for an economic event.
 * Validates double-entry balance (Debits = Credits).
 *
 * @param db - Drizzle database instance
 * @param input - GL postings input
 * @returns GL postings result
 *
 * @throws Error if postings are not balanced
 * @throws Error if posting creation fails
 */
export async function createGLPostings(
  db: Database,
  input: CreateGLPostingsInput
): Promise<GLPostingsResult> {
  const {
    tenantId,
    economicEventId,
    postings: postingsInput,
    postingDate,
    currency = "USD",
    createdBy,
  } = input;

  // Generate batch ID (groups related postings)
  const batchId = crypto.randomUUID();

  // Validate balance BEFORE inserting
  const validation = validatePostingBalance(postingsInput);

  if (!validation.isBalanced) {
    throw new Error(
      `GL postings are not balanced: Debits (${validation.totalDebit}) ≠ Credits (${validation.totalCredit})`
    );
  }

  // Create posting records
  const postingRecords: NewLedgerPosting[] = postingsInput.map((posting) => ({
    tenantId,
    economicEventId,
    batchId,
    accountId: posting.accountId,
    direction: posting.direction,
    amount: posting.amount,
    currency,
    postingDate,
    description: posting.description,
    metadata: posting.metadata,
    isReversal: "false",
    createdBy,
  }));

  // Insert postings
  const postings = await db
    .insert(ledgerPostings)
    .values(postingRecords)
    .returning();

  if (postings.length === 0) {
    throw new Error("Failed to create GL postings");
  }

  return {
    postings,
    batchId,
    totalDebit: validation.totalDebit,
    totalCredit: validation.totalCredit,
    isBalanced: validation.isBalanced,
  };
}

/**
 * Get GL postings by economic event.
 *
 * @param db - Drizzle database instance
 * @param economicEventId - Economic event UUID
 * @returns GL postings for event
 */
export async function getPostingsByEvent(
  db: Database,
  economicEventId: string
): Promise<LedgerPosting[]> {
  return await db
    .select()
    .from(ledgerPostings)
    .where(eq(ledgerPostings.economicEventId, economicEventId))
    .orderBy(ledgerPostings.createdAt);
}

/**
 * Get GL postings by batch ID.
 *
 * @param db - Drizzle database instance
 * @param batchId - Batch UUID
 * @returns GL postings in batch
 */
export async function getPostingsByBatch(
  db: Database,
  batchId: string
): Promise<LedgerPosting[]> {
  return await db
    .select()
    .from(ledgerPostings)
    .where(eq(ledgerPostings.batchId, batchId))
    .orderBy(ledgerPostings.createdAt);
}

/**
 * Get GL postings by account.
 *
 * @param db - Drizzle database instance
 * @param accountId - Account UUID
 * @param options - Optional query options
 * @returns GL postings for account
 */
export async function getPostingsByAccount(
  db: Database,
  accountId: string,
  options?: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }
): Promise<LedgerPosting[]> {
  let query = db
    .select()
    .from(ledgerPostings)
    .where(eq(ledgerPostings.accountId, accountId))
    .orderBy(desc(ledgerPostings.postingDate));

  // TODO: Add date range filtering when Drizzle supports complex where clauses

  if (options?.limit) {
    query = query.limit(options.limit) as typeof query;
  }

  if (options?.offset) {
    query = query.offset(options.offset) as typeof query;
  }

  return await query;
}

/**
 * Validate double-entry balance for batch.
 *
 * Verifies that Debits = Credits for a batch of postings.
 *
 * @param db - Drizzle database instance
 * @param batchId - Batch UUID
 * @returns Balance validation result
 *
 * @throws Error if batch not found
 */
export async function validateBatchBalance(
  db: Database,
  batchId: string
): Promise<{
  isBalanced: boolean;
  totalDebit: string;
  totalCredit: string;
  difference: string;
}> {
  const postings = await getPostingsByBatch(db, batchId);

  if (postings.length === 0) {
    throw new Error(`Batch not found: ${batchId}`);
  }

  let totalDebit = "0.0000";
  let totalCredit = "0.0000";

  for (const posting of postings) {
    if (posting.direction === "debit") {
      totalDebit = addDecimal(totalDebit, posting.amount);
    } else if (posting.direction === "credit") {
      totalCredit = addDecimal(totalCredit, posting.amount);
    }
  }

  const difference = subtractDecimal(totalDebit, totalCredit);
  const isBalanced = difference === "0.0000";

  return {
    isBalanced,
    totalDebit,
    totalCredit,
    difference,
  };
}

/**
 * Check if posting is reversed.
 *
 * @param db - Drizzle database instance
 * @param postingId - Posting UUID
 * @returns true if posting is reversed, false otherwise
 */
export async function isPostingReversed(
  db: Database,
  postingId: string
): Promise<boolean> {
  const [result] = await db
    .select({ reversalId: ledgerPostings.reversalId })
    .from(ledgerPostings)
    .where(eq(ledgerPostings.id, postingId))
    .limit(1);

  return result?.reversalId !== null && result?.reversalId !== undefined;
}

/**
 * Get reversal chain for posting.
 *
 * Returns original posting + all reversals in chronological order.
 *
 * @param db - Drizzle database instance
 * @param postingId - Posting UUID
 * @returns Reversal chain (original first, reversals follow)
 */
export async function getPostingReversalChain(
  db: Database,
  postingId: string
): Promise<LedgerPosting[]> {
  const [posting] = await db
    .select()
    .from(ledgerPostings)
    .where(eq(ledgerPostings.id, postingId))
    .limit(1);

  if (!posting) {
    throw new Error(`Posting not found: ${postingId}`);
  }

  // If this is a reversal, find the original
  let originalId =
    posting.isReversal === "true" ? posting.reversedFromId : posting.id;

  if (!originalId) {
    return [posting];
  }

  // Get original posting
  const [original] = await db
    .select()
    .from(ledgerPostings)
    .where(eq(ledgerPostings.id, originalId))
    .limit(1);

  if (!original) {
    throw new Error(`Original posting not found: ${originalId}`);
  }

  // Get all reversals of the original
  const reversals = await db
    .select()
    .from(ledgerPostings)
    .where(
      and(
        eq(ledgerPostings.reversedFromId, originalId),
        eq(ledgerPostings.isReversal, "true")
      )
    )
    .orderBy(ledgerPostings.createdAt);

  return [original, ...reversals];
}

/**
 * Add two decimal strings (for monetary calculations).
 *
 * IMPORTANT: Use string-based arithmetic to avoid floating-point errors.
 *
 * @param a - First decimal string
 * @param b - Second decimal string
 * @returns Sum as decimal string
 */
function addDecimal(a: string, b: string): string {
  const scale = 4; // Match precision: 19, scale: 4
  const multiplier = Math.pow(10, scale);

  const aInt = Math.round(parseFloat(a) * multiplier);
  const bInt = Math.round(parseFloat(b) * multiplier);

  const sumInt = aInt + bInt;
  const sum = sumInt / multiplier;

  return sum.toFixed(scale);
}
