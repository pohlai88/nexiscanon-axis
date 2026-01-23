/**
 * Reconciliation Domain Constants (B09)
 *
 * Matching, Exception Handling & Truth Verification
 */

// ============================================================================
// Reconciliation Types
// ============================================================================

export const RECONCILIATION_TYPE = [
  "subledger_gl",
  "bank_gl",
  "intercompany",
  "three_way_match",
  "order_fulfillment",
  "inventory_physical",
  "invoice_payment",
  "custom",
] as const;

export type ReconciliationType = (typeof RECONCILIATION_TYPE)[number];

// ============================================================================
// Reconciliation Status
// ============================================================================

export const RECONCILIATION_STATUS = [
  "pending",
  "in_progress",
  "matched",
  "exception",
  "resolved",
  "cancelled",
] as const;

export type ReconciliationStatus = (typeof RECONCILIATION_STATUS)[number];

// ============================================================================
// Recon Match Status
// ============================================================================

export const RECON_MATCH_STATUS = [
  "auto_matched",
  "manual_matched",
  "partial_match",
  "no_match",
  "multiple_match",
] as const;

export type ReconMatchStatus = (typeof RECON_MATCH_STATUS)[number];

// ============================================================================
// Exception Status
// ============================================================================

export const EXCEPTION_STATUS = [
  "open",
  "investigating",
  "pending_approval",
  "resolved",
  "written_off",
  "escalated",
] as const;

export type ExceptionStatus = (typeof EXCEPTION_STATUS)[number];

// ============================================================================
// Exception Types
// ============================================================================

export const EXCEPTION_TYPE = [
  "missing_source",
  "missing_target",
  "amount_mismatch",
  "date_mismatch",
  "duplicate",
  "timing_difference",
  "fx_variance",
  "rounding",
  "other",
] as const;

export type ExceptionType = (typeof EXCEPTION_TYPE)[number];

// ============================================================================
// Exception Severity
// ============================================================================

export const EXCEPTION_SEVERITY = [
  "low",
  "medium",
  "high",
  "critical",
] as const;

export type ExceptionSeverity = (typeof EXCEPTION_SEVERITY)[number];

// ============================================================================
// Resolution Types
// ============================================================================

export const RESOLUTION_TYPE = [
  "matched_manually",
  "adjusted",
  "written_off",
  "timing_resolved",
  "duplicate_removed",
  "other",
] as const;

export type ResolutionType = (typeof RESOLUTION_TYPE)[number];

// ============================================================================
// Bank Transaction Types
// ============================================================================

export const BANK_TRANSACTION_TYPE = [
  "credit",
  "debit",
  "transfer",
  "fee",
  "interest",
  "reversal",
] as const;

export type BankTransactionType = (typeof BANK_TRANSACTION_TYPE)[number];

// ============================================================================
// Import Source
// ============================================================================

export const IMPORT_SOURCE = ["manual", "file", "api"] as const;

export type ImportSource = (typeof IMPORT_SOURCE)[number];
