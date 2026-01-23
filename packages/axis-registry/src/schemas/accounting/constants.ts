/**
 * Accounting Domain Constants
 *
 * All enums and constants for the Accounting domain (B07)
 */

// ============================================================================
// Account Types
// ============================================================================

export const GL_ACCOUNT_TYPE = [
  // Balance Sheet - Assets
  "asset",
  "asset_current",
  "asset_fixed",
  "asset_receivable",
  "asset_inventory",
  "asset_bank",
  "asset_cash",

  // Balance Sheet - Liabilities
  "liability",
  "liability_current",
  "liability_long_term",
  "liability_payable",

  // Balance Sheet - Equity
  "equity",
  "equity_retained_earnings",

  // Income Statement - Revenue
  "revenue",
  "revenue_other",

  // Income Statement - Expenses
  "expense",
  "expense_cogs",
  "expense_operating",
  "expense_other",
] as const;

export type GlAccountType = (typeof GL_ACCOUNT_TYPE)[number];

export const ACCOUNT_NORMAL_BALANCE = {
  asset: "debit",
  liability: "credit",
  equity: "credit",
  revenue: "credit",
  expense: "debit",
} as const;

export type NormalBalance = "debit" | "credit";

export const ACCOUNT_STATUS = ["active", "inactive", "blocked"] as const;

export type AccountStatus = (typeof ACCOUNT_STATUS)[number];

// ============================================================================
// Journal Types
// ============================================================================

export const JOURNAL_TYPE = [
  "general",
  "sales",
  "purchase",
  "cash_receipt",
  "cash_payment",
  "inventory",
  "adjustment",
  "closing",
  "opening",
  "reversal",
] as const;

export type JournalType = (typeof JOURNAL_TYPE)[number];

export const JOURNAL_STATUS = [
  "draft",
  "approved",
  "posted",
  "reversed",
] as const;

export type JournalStatus = (typeof JOURNAL_STATUS)[number];

// ============================================================================
// Fiscal Period Status
// ============================================================================

export const PERIOD_STATUS = [
  "future",
  "open",
  "soft_closed",
  "hard_closed",
] as const;

export type PeriodStatus = (typeof PERIOD_STATUS)[number];

// ============================================================================
// Subledger Types
// ============================================================================

export const SUBLEDGER_TYPE = ["ar", "ap", "inventory"] as const;

export type SubledgerType = (typeof SUBLEDGER_TYPE)[number];

// ============================================================================
// Exchange Rate Source
// ============================================================================

export const EXCHANGE_RATE_SOURCE = ["manual", "api", "import"] as const;

export type ExchangeRateSource = (typeof EXCHANGE_RATE_SOURCE)[number];
