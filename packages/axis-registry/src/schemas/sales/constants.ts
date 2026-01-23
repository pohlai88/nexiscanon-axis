/**
 * Sales Domain Constants
 *
 * All enums and constants for the Sales domain (B04)
 */

// ============================================================================
// Quote Status
// ============================================================================

export const QUOTE_STATUS = [
  "draft",
  "sent",
  "accepted",
  "rejected",
  "expired",
  "converted",
] as const;

export type QuoteStatus = (typeof QUOTE_STATUS)[number];

// ============================================================================
// Order Status
// ============================================================================

export const ORDER_STATUS = [
  "draft",
  "confirmed",
  "partially_delivered",
  "fully_delivered",
  "invoiced",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUS)[number];

// ============================================================================
// Delivery Status
// ============================================================================

export const DELIVERY_STATUS = [
  "draft",
  "ready",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export type DeliveryStatus = (typeof DELIVERY_STATUS)[number];

// ============================================================================
// Invoice Status
// ============================================================================

export const INVOICE_STATUS = [
  "draft",
  "approved",
  "posted",
  "partially_paid",
  "paid",
  "overdue",
  "cancelled",
  "reversed",
] as const;

export type InvoiceStatus = (typeof INVOICE_STATUS)[number];

// ============================================================================
// Payment Status & Method
// ============================================================================

export const PAYMENT_STATUS = [
  "draft",
  "pending",
  "posted",
  "failed",
  "reversed",
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[number];

export const PAYMENT_METHOD = [
  "cash",
  "bank_transfer",
  "check",
  "credit_card",
  "debit_card",
  "e_wallet",
  "other",
] as const;

export type PaymentMethod = (typeof PAYMENT_METHOD)[number];

// ============================================================================
// Credit Note Reason
// ============================================================================

export const CREDIT_NOTE_REASON = [
  "return",
  "price_adjustment",
  "quantity_adjustment",
  "quality_issue",
  "billing_error",
  "goodwill",
  "other",
] as const;

export type CreditNoteReason = (typeof CREDIT_NOTE_REASON)[number];

// ============================================================================
// Reconciliation Status
// ============================================================================

export const INVOICE_RECONCILIATION_STATUS = [
  "open",
  "partial",
  "paid",
  "overpaid",
  "credited",
  "written_off",
] as const;

export type InvoiceReconciliationStatus =
  (typeof INVOICE_RECONCILIATION_STATUS)[number];

export const ORDER_FULFILLMENT_STATUS = [
  "unfulfilled",
  "partially_fulfilled",
  "fulfilled",
  "over_fulfilled",
] as const;

export type OrderFulfillmentStatus =
  (typeof ORDER_FULFILLMENT_STATUS)[number];
