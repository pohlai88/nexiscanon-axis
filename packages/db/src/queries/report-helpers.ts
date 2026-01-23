/**
 * Financial Report Helper Functions
 * 
 * Utility functions for calculating balances and formatting reports.
 */

import type { Account } from "../schema";
import type { LedgerPosting } from "../schema/ledger-posting";

/**
 * Calculate account balance from postings.
 * 
 * For asset & expense accounts: debits increase, credits decrease
 * For liability, equity & revenue accounts: credits increase, debits decrease
 */
export function calculateAccountBalance(
  postings: LedgerPosting[],
  accountType: string
): string {
  let balance = 0;

  for (const posting of postings) {
    const amount = parseFloat(posting.amount);

    if (accountType === "asset" || accountType === "expense") {
      // Normal debit balance accounts
      balance += posting.direction === "debit" ? amount : -amount;
    } else {
      // Normal credit balance accounts (liability, equity, revenue)
      balance += posting.direction === "credit" ? amount : -amount;
    }
  }

  return balance.toFixed(4);
}

/**
 * Calculate debit and credit totals separately.
 */
export function calculateDebitCreditTotals(postings: LedgerPosting[]): {
  debits: string;
  credits: string;
} {
  let debits = 0;
  let credits = 0;

  for (const posting of postings) {
    const amount = parseFloat(posting.amount);
    if (posting.direction === "debit") {
      debits += amount;
    } else {
      credits += amount;
    }
  }

  return {
    debits: debits.toFixed(4),
    credits: credits.toFixed(4),
  };
}

/**
 * Add two monetary amounts (string-based arithmetic).
 */
export function addAmounts(a: string, b: string): string {
  return (parseFloat(a) + parseFloat(b)).toFixed(4);
}

/**
 * Subtract two monetary amounts (string-based arithmetic).
 */
export function subtractAmounts(a: string, b: string): string {
  return (parseFloat(a) - parseFloat(b)).toFixed(4);
}

/**
 * Sum array of amounts.
 */
export function sumAmounts(amounts: string[]): string {
  return amounts.reduce((sum, amt) => addAmounts(sum, amt), "0.0000");
}

/**
 * Group accounts by type.
 */
export function groupAccountsByType(accounts: Account[]): {
  assets: Account[];
  liabilities: Account[];
  equity: Account[];
  revenue: Account[];
  expenses: Account[];
} {
  return {
    assets: accounts.filter((a) => a.accountType === "asset"),
    liabilities: accounts.filter((a) => a.accountType === "liability"),
    equity: accounts.filter((a) => a.accountType === "equity"),
    revenue: accounts.filter((a) => a.accountType === "revenue"),
    expenses: accounts.filter((a) => a.accountType === "expense"),
  };
}

/**
 * Verify balance sheet equation: Assets = Liabilities + Equity
 */
export function verifyBalanceSheet(
  assetsTotal: string,
  liabilitiesTotal: string,
  equityTotal: string
): { verified: boolean; difference: string } {
  const assets = parseFloat(assetsTotal);
  const liabilitiesAndEquity =
    parseFloat(liabilitiesTotal) + parseFloat(equityTotal);
  const difference = assets - liabilitiesAndEquity;

  return {
    verified: Math.abs(difference) < 0.01, // Allow for rounding
    difference: difference.toFixed(4),
  };
}

/**
 * Verify trial balance: Total Debits = Total Credits
 */
export function verifyTrialBalance(
  totalDebits: string,
  totalCredits: string
): { balanced: boolean; difference: string } {
  const debits = parseFloat(totalDebits);
  const credits = parseFloat(totalCredits);
  const difference = debits - credits;

  return {
    balanced: Math.abs(difference) < 0.01, // Allow for rounding
    difference: difference.toFixed(4),
  };
}

/**
 * Format currency for display (optional, for future UI use).
 */
export function formatCurrency(amount: string, currency = "USD"): string {
  const num = parseFloat(amount);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(num);
}

/**
 * Check if amount is negative.
 */
export function isNegative(amount: string): boolean {
  return parseFloat(amount) < 0;
}

/**
 * Get absolute value of amount.
 */
export function absoluteAmount(amount: string): string {
  return Math.abs(parseFloat(amount)).toFixed(4);
}
