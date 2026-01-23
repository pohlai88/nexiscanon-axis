/**
 * Posting Spine Transaction Wrapper
 *
 * Implements B01 §2 (Three-Layer Model):
 * - Layer 1: DOCUMENTS (Workflow Layer) - Editable until POSTED
 * - Layer 2: ECONOMIC EVENTS (Truth Layer) - IMMUTABLE
 * - Layer 3: POSTINGS (Math Layer) - IMMUTABLE, Debits = Credits
 *
 * Key Principles:
 * - Atomic transaction (all or nothing)
 * - Validates double-entry balance
 * - Creates immutable records
 * - Tracks 6W1H context
 */

import { type Database } from "./neon";
import type {
  NewEconomicEvent,
  EconomicEvent,
  NewLedgerPosting,
  LedgerPosting,
} from "../schema";

/**
 * Posting spine transaction result
 */
export interface PostingSpineResult {
  event: EconomicEvent;
  postings: LedgerPosting[];
  totalDebit: string;
  totalCredit: string;
  isBalanced: boolean;
}

/**
 * Posting spine transaction input
 */
export interface PostingSpineInput {
  /** Economic event to create */
  event: NewEconomicEvent;
  /** Ledger postings to create (must be balanced) */
  postings: NewLedgerPosting[];
  /** Optional: Validate balance before commit */
  validateBalance?: boolean;
}

/**
 * Execute posting spine transaction.
 *
 * Creates economic event + balanced ledger postings atomically.
 * Validates double-entry balance (Debits = Credits).
 *
 * @param db - Drizzle database instance
 * @param input - Posting spine input
 * @returns Posting spine result
 * @throws Error if transaction fails or balance is invalid
 *
 * @example
 * ```typescript
 * const result = await executePostingSpineTransaction(db, {
 *   event: {
 *     tenantId,
 *     documentId,
 *     eventType: "invoice.posted",
 *     // ... other event fields
 *   },
 *   postings: [
 *     { accountId: arAccount, direction: "debit", amount: "1000" },
 *     { accountId: revenueAccount, direction: "credit", amount: "1000" },
 *   ],
 *   validateBalance: true,
 * });
 *
 * if (!result.isBalanced) {
 *   throw new Error("Postings are not balanced");
 * }
 * ```
 */
export async function executePostingSpineTransaction(
  db: Database,
  input: PostingSpineInput
): Promise<PostingSpineResult> {
  const { event: eventInput, postings: postingsInput, validateBalance = true } = input;

  return await db.transaction(async (tx) => {
    // Import schema within transaction scope
    const { economicEvents, ledgerPostings } = await import("../schema");

    // Step 1: Create economic event (IMMUTABLE)
    const [event] = await tx
      .insert(economicEvents)
      .values(eventInput)
      .returning();

    if (!event) {
      throw new Error("Failed to create economic event");
    }

    // Step 2: Link postings to event
    const postingsWithEvent = postingsInput.map((posting) => ({
      ...posting,
      economicEventId: event.id,
    }));

    // Step 3: Create ledger postings (IMMUTABLE)
    const postings = await tx
      .insert(ledgerPostings)
      .values(postingsWithEvent)
      .returning();

    if (postings.length === 0) {
      throw new Error("Failed to create ledger postings");
    }

    // Step 4: Calculate totals
    let totalDebit = "0";
    let totalCredit = "0";

    for (const posting of postings) {
      const amount = posting.amount;
      if (posting.direction === "debit") {
        totalDebit = addDecimal(totalDebit, amount);
      } else if (posting.direction === "credit") {
        totalCredit = addDecimal(totalCredit, amount);
      }
    }

    // Step 5: Validate double-entry balance
    const isBalanced = totalDebit === totalCredit;

    if (validateBalance && !isBalanced) {
      throw new Error(
        `Posting spine transaction is not balanced: Debits (${totalDebit}) ≠ Credits (${totalCredit})`
      );
    }

    return {
      event,
      postings,
      totalDebit,
      totalCredit,
      isBalanced,
    };
  });
}

/**
 * Validate posting spine balance WITHOUT creating records.
 *
 * @param postings - Ledger postings to validate
 * @returns Balance validation result
 */
export function validatePostingBalance(
  postings: Array<Pick<NewLedgerPosting, "direction" | "amount">>
): { isBalanced: boolean; totalDebit: string; totalCredit: string } {
  let totalDebit = "0";
  let totalCredit = "0";

  for (const posting of postings) {
    const amount = posting.amount;
    if (posting.direction === "debit") {
      totalDebit = addDecimal(totalDebit, amount);
    } else if (posting.direction === "credit") {
      totalCredit = addDecimal(totalCredit, amount);
    }
  }

  return {
    isBalanced: totalDebit === totalCredit,
    totalDebit,
    totalCredit,
  };
}

/**
 * Add two decimal strings (for monetary calculations).
 *
 * IMPORTANT: Use string-based arithmetic to avoid floating-point errors.
 *
 * @param a - First decimal string
 * @param b - Second decimal string
 * @returns Sum as decimal string
 *
 * @example
 * ```typescript
 * addDecimal("100.50", "50.25") // "150.75"
 * addDecimal("0", "100") // "100"
 * ```
 */
function addDecimal(a: string, b: string): string {
  // Convert to integers by removing decimal point
  const scale = 4; // Match precision: 19, scale: 4
  const multiplier = Math.pow(10, scale);

  const aInt = Math.round(parseFloat(a) * multiplier);
  const bInt = Math.round(parseFloat(b) * multiplier);

  const sumInt = aInt + bInt;
  const sum = sumInt / multiplier;

  return sum.toFixed(scale);
}

/**
 * Subtract two decimal strings (for monetary calculations).
 *
 * @param a - First decimal string
 * @param b - Second decimal string
 * @returns Difference as decimal string
 */
export function subtractDecimal(a: string, b: string): string {
  const scale = 4;
  const multiplier = Math.pow(10, scale);

  const aInt = Math.round(parseFloat(a) * multiplier);
  const bInt = Math.round(parseFloat(b) * multiplier);

  const diffInt = aInt - bInt;
  const diff = diffInt / multiplier;

  return diff.toFixed(scale);
}

/**
 * Compare two decimal strings.
 *
 * @param a - First decimal string
 * @param b - Second decimal string
 * @returns -1 if a < b, 0 if a === b, 1 if a > b
 */
export function compareDecimal(a: string, b: string): -1 | 0 | 1 {
  const aNum = parseFloat(a);
  const bNum = parseFloat(b);

  if (aNum < bNum) return -1;
  if (aNum > bNum) return 1;
  return 0;
}
