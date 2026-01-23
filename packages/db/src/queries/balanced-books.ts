/**
 * Balanced Books Verification Queries
 *
 * Implements B01 §1 (The 500-Year Principle): DEBITS = CREDITS.
 *
 * These queries verify accounting integrity and detect imbalances.
 *
 * @example
 * ```typescript
 * // Verify balanced books for tenant
 * const result = await verifyBalancedBooks(db, {
 *   tenantId: "...",
 *   fiscalPeriodId: "...",
 * });
 *
 * if (!result.isBalanced) {
 *   console.error("❌ Books are NOT balanced!");
 *   console.error(`Difference: ${result.difference}`);
 * }
 * ```
 */

import { eq, and, gte, lte } from "drizzle-orm";
import type { Database } from "../client";
import { ledgerPostings } from "../schema";

/**
 * Balanced books verification result
 */
export interface BalancedBooksResult {
  isBalanced: boolean;
  totalDebits: string;
  totalCredits: string;
  difference: string;
  postingCount: number;
  batchCount: number;
  unbalancedBatches: UnbalancedBatch[];
}

/**
 * Unbalanced batch details
 */
export interface UnbalancedBatch {
  batchId: string;
  totalDebits: string;
  totalCredits: string;
  difference: string;
  postingCount: number;
  eventId: string;
}

/**
 * Verification options
 */
export interface VerificationOptions {
  tenantId: string;
  fiscalPeriodId?: string;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Verify balanced books for tenant.
 *
 * Validates that total debits = total credits across all postings.
 * This is the fundamental accounting equation (B01 §1).
 *
 * @param db - Drizzle database instance
 * @param options - Verification options
 * @returns Balanced books result
 */
export async function verifyBalancedBooks(
  db: Database,
  options: VerificationOptions
): Promise<BalancedBooksResult> {
  const { tenantId, startDate, endDate } = options;

  // Build query conditions
  const conditions = [eq(ledgerPostings.tenantId, tenantId)];

  if (startDate) {
    conditions.push(gte(ledgerPostings.postingDate, startDate));
  }

  if (endDate) {
    conditions.push(lte(ledgerPostings.postingDate, endDate));
  }

  // Get all postings
  const postings = await db
    .select()
    .from(ledgerPostings)
    .where(and(...conditions));

  // Calculate totals
  let totalDebits = "0.0000";
  let totalCredits = "0.0000";
  const batches = new Set<string>();

  for (const posting of postings) {
    batches.add(posting.batchId);

    if (posting.direction === "debit") {
      totalDebits = addDecimal(totalDebits, posting.amount);
    } else if (posting.direction === "credit") {
      totalCredits = addDecimal(totalCredits, posting.amount);
    }
  }

  const difference = subtractDecimal(totalDebits, totalCredits);
  const isBalanced = difference === "0.0000";

  // Find unbalanced batches
  const unbalancedBatches = await findUnbalancedBatches(db, {
    tenantId,
    startDate,
    endDate,
  });

  return {
    isBalanced,
    totalDebits,
    totalCredits,
    difference,
    postingCount: postings.length,
    batchCount: batches.size,
    unbalancedBatches,
  };
}

/**
 * Find unbalanced batches.
 *
 * Returns batches where debits ≠ credits (should never happen in production).
 *
 * @param db - Drizzle database instance
 * @param options - Verification options
 * @returns Unbalanced batches
 */
export async function findUnbalancedBatches(
  db: Database,
  options: VerificationOptions
): Promise<UnbalancedBatch[]> {
  const { tenantId, startDate, endDate } = options;

  // Build query conditions
  const conditions = [eq(ledgerPostings.tenantId, tenantId)];

  if (startDate) {
    conditions.push(gte(ledgerPostings.postingDate, startDate));
  }

  if (endDate) {
    conditions.push(lte(ledgerPostings.postingDate, endDate));
  }

  // Get all postings
  const postings = await db
    .select()
    .from(ledgerPostings)
    .where(and(...conditions));

  // Group by batch
  const batchMap = new Map<
    string,
    { debits: string; credits: string; count: number; eventId: string }
  >();

  for (const posting of postings) {
    const batch = batchMap.get(posting.batchId) || {
      debits: "0.0000",
      credits: "0.0000",
      count: 0,
      eventId: posting.economicEventId,
    };

    if (posting.direction === "debit") {
      batch.debits = addDecimal(batch.debits, posting.amount);
    } else if (posting.direction === "credit") {
      batch.credits = addDecimal(batch.credits, posting.amount);
    }

    batch.count++;
    batchMap.set(posting.batchId, batch);
  }

  // Find unbalanced batches
  const unbalanced: UnbalancedBatch[] = [];

  for (const [batchId, batch] of batchMap.entries()) {
    const diff = subtractDecimal(batch.debits, batch.credits);

    if (diff !== "0.0000") {
      unbalanced.push({
        batchId,
        totalDebits: batch.debits,
        totalCredits: batch.credits,
        difference: diff,
        postingCount: batch.count,
        eventId: batch.eventId,
      });
    }
  }

  return unbalanced;
}

/**
 * Get total debits and credits for tenant.
 *
 * @param db - Drizzle database instance
 * @param tenantId - Tenant UUID
 * @returns Totals
 */
export async function getTotalDebitsCredits(
  db: Database,
  tenantId: string
): Promise<{
  totalDebits: string;
  totalCredits: string;
}> {
  const postings = await db
    .select()
    .from(ledgerPostings)
    .where(eq(ledgerPostings.tenantId, tenantId));

  let totalDebits = "0.0000";
  let totalCredits = "0.0000";

  for (const posting of postings) {
    if (posting.direction === "debit") {
      totalDebits = addDecimal(totalDebits, posting.amount);
    } else if (posting.direction === "credit") {
      totalCredits = addDecimal(totalCredits, posting.amount);
    }
  }

  return {
    totalDebits,
    totalCredits,
  };
}

/**
 * Account balance summary
 */
export interface AccountBalanceSummary {
  accountId: string;
  totalDebits: string;
  totalCredits: string;
  balance: string;
  postingCount: number;
}

/**
 * Get account balances for tenant.
 *
 * Returns summary of all account balances.
 *
 * @param db - Drizzle database instance
 * @param tenantId - Tenant UUID
 * @param options - Optional date range
 * @returns Account balances
 */
export async function getAccountBalances(
  db: Database,
  tenantId: string,
  options?: {
    startDate?: Date;
    endDate?: Date;
  }
): Promise<AccountBalanceSummary[]> {
  // Build query conditions
  const conditions = [eq(ledgerPostings.tenantId, tenantId)];

  if (options?.startDate) {
    conditions.push(gte(ledgerPostings.postingDate, options.startDate));
  }

  if (options?.endDate) {
    conditions.push(lte(ledgerPostings.postingDate, options.endDate));
  }

  // Get postings
  const postings = await db
    .select()
    .from(ledgerPostings)
    .where(and(...conditions));

  // Group by account
  const accountMap = new Map<
    string,
    { debits: string; credits: string; count: number }
  >();

  for (const posting of postings) {
    const account = accountMap.get(posting.accountId) || {
      debits: "0.0000",
      credits: "0.0000",
      count: 0,
    };

    if (posting.direction === "debit") {
      account.debits = addDecimal(account.debits, posting.amount);
    } else if (posting.direction === "credit") {
      account.credits = addDecimal(account.credits, posting.amount);
    }

    account.count++;
    accountMap.set(posting.accountId, account);
  }

  // Build summary
  const balances: AccountBalanceSummary[] = [];

  for (const [accountId, account] of accountMap.entries()) {
    balances.push({
      accountId,
      totalDebits: account.debits,
      totalCredits: account.credits,
      balance: subtractDecimal(account.debits, account.credits),
      postingCount: account.count,
    });
  }

  return balances;
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

/**
 * Subtract two decimal strings.
 */
function subtractDecimal(a: string, b: string): string {
  const scale = 4;
  const multiplier = Math.pow(10, scale);
  const aInt = Math.round(parseFloat(a) * multiplier);
  const bInt = Math.round(parseFloat(b) * multiplier);
  const diffInt = aInt - bInt;
  return (diffInt / multiplier).toFixed(scale);
}
