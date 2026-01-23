/**
 * Registry Constants - Canonical enums and literals
 *
 * These are the ONLY place where enum values are defined.
 * All other code imports from here.
 */

// ============================================================================
// Schema Versioning
// ============================================================================

export const SCHEMA_VERSION = 1 as const;

export const SCHEMA_URIS = {
  document: "axis://document/v1",
  economicEvent: "axis://economic-event/v1",
  ledgerPosting: "axis://ledger-posting/v1",
  account: "axis://account/v1",
  context6w1h: "axis://6w1h/v1",
} as const;

// ============================================================================
// Entity Types (Discriminator)
// ============================================================================

export const ENTITY_TYPE = [
  "document",
  "economic_event",
  "ledger_posting",
  "account",
  "tenant",
  "user",
] as const;

// ============================================================================
// Document Domain
// ============================================================================

export const DOCUMENT_TYPE = [
  "sales_invoice",
  "purchase_invoice",
  "payment",
  "receipt",
  "journal_entry",
  "inventory_transfer",
] as const;

export const DOCUMENT_STATE = [
  "draft",
  "submitted",
  "approved",
  "posted",
  "reversed",
  "voided",
] as const;

// Valid state transitions (from → to[])
export const DOCUMENT_STATE_MACHINE = {
  draft: ["submitted", "voided"],
  submitted: ["approved", "draft", "voided"],
  approved: ["posted", "submitted", "voided"],
  posted: ["reversed"],
  reversed: [], // Terminal state
  voided: [], // Terminal state
} as const;

// ============================================================================
// Economic Event Domain
// ============================================================================

/**
 * Economic event classification (A01 §4.2).
 * "Everything important is an event affecting money, stock, obligation, or commitment."
 */
export const EVENT_TYPE = [
  "revenue",
  "expense",
  "asset_acquisition",
  "asset_disposal",
  "liability_incurred",
  "liability_settled",
  "equity_contribution",
  "equity_distribution",
  "inventory_received",
  "inventory_issued",
  "commitment",
  "obligation",
] as const;

// ============================================================================
// Ledger Domain
// ============================================================================

export const POSTING_DIRECTION = ["debit", "credit"] as const;

export const ACCOUNT_TYPE = [
  "asset",
  "liability",
  "equity",
  "revenue",
  "expense",
] as const;

// ============================================================================
// Danger Zone Levels
// ============================================================================

export const DANGER_LEVEL = [
  "info",
  "warning",
  "critical",
] as const;
