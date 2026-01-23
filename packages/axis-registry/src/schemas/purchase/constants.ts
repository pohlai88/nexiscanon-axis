/**
 * Purchase Domain Constants
 *
 * All enums and constants for the Purchase domain (B05)
 */

// ============================================================================
// Purchase Request Status
// ============================================================================

export const PR_STATUS = [
  "draft",
  "submitted",
  "approved",
  "rejected",
  "partially_ordered",
  "fully_ordered",
  "cancelled",
] as const;

export type PrStatus = (typeof PR_STATUS)[number];

export const PR_PRIORITY = ["low", "normal", "high", "urgent"] as const;

export type PrPriority = (typeof PR_PRIORITY)[number];

// ============================================================================
// Purchase Order Status
// ============================================================================

export const PO_STATUS = [
  "draft",
  "confirmed",
  "partially_received",
  "fully_received",
  "billed",
  "cancelled",
  "closed",
] as const;

export type PoStatus = (typeof PO_STATUS)[number];

// ============================================================================
// Receipt Status
// ============================================================================

export const RECEIPT_STATUS = [
  "draft",
  "pending_inspection",
  "accepted",
  "partially_accepted",
  "rejected",
  "cancelled",
] as const;

export type ReceiptStatus = (typeof RECEIPT_STATUS)[number];

// ============================================================================
// Bill Status
// ============================================================================

export const BILL_STATUS = [
  "draft",
  "pending_match",
  "matched",
  "approved",
  "posted",
  "partially_paid",
  "paid",
  "disputed",
  "cancelled",
  "reversed",
] as const;

export type BillStatus = (typeof BILL_STATUS)[number];

// ============================================================================
// Purchase Payment Status & Method
// ============================================================================

export const PURCHASE_PAYMENT_STATUS = [
  "draft",
  "pending_approval",
  "approved",
  "posted",
  "failed",
  "reversed",
] as const;

export type PurchasePaymentStatus = (typeof PURCHASE_PAYMENT_STATUS)[number];

export const PURCHASE_PAYMENT_METHOD = [
  "bank_transfer",
  "check",
  "cash",
  "credit_card",
  "e_wallet",
  "other",
] as const;

export type PurchasePaymentMethod = (typeof PURCHASE_PAYMENT_METHOD)[number];

// ============================================================================
// Debit Note Reason
// ============================================================================

export const DEBIT_NOTE_REASON = [
  "return",
  "price_adjustment",
  "quantity_adjustment",
  "quality_issue",
  "billing_error",
  "shortage",
  "other",
] as const;

export type DebitNoteReason = (typeof DEBIT_NOTE_REASON)[number];

// ============================================================================
// Matching Status
// ============================================================================

export const MATCH_STATUS = [
  "unmatched",
  "partial",
  "matched",
  "exception",
] as const;

export type MatchStatus = (typeof MATCH_STATUS)[number];

export const MATCH_EXCEPTION_TYPE = [
  "quantity_variance",
  "price_variance",
  "no_receipt",
  "no_po",
] as const;

export type MatchExceptionType = (typeof MATCH_EXCEPTION_TYPE)[number];
