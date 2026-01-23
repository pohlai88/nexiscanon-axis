/**
 * Accounting Services (B07)
 *
 * AXIS Canonical Implementation:
 * - GL Posting Engine: Double-entry validation + immutable postings
 * - Trial Balance: Debits = Credits validation
 * - Subledgers: AR/AP with reconciliation
 * - Period Close: Lock with Danger Zone override
 *
 * @see .cursor/ERP/A01-CANONICAL.md (AXIS Philosophy)
 * @see .cursor/ERP/B07-ACCOUNTING.md (Accounting Core)
 */

// GL Posting Engine
export { GLPostingEngine } from "./gl-posting-engine";
export type {
  PostingResult,
  DangerZoneWarning,
  PostingError,
} from "./gl-posting-engine";

// Trial Balance
export { TrialBalanceService } from "./trial-balance";
export type {
  TrialBalanceLine,
  TrialBalanceReport,
  TrialBalanceFilters,
} from "./trial-balance";

// Subledgers (AR/AP)
export { SubledgerService } from "./subledger-service";

// Period Close
export { PeriodCloseService } from "./period-close";
export type {
  PeriodCloseValidation,
  PeriodCloseRequest,
  PeriodCloseResult,
} from "./period-close";
