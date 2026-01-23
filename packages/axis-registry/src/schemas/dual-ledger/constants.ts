/**
 * Dual Ledger Reconciliation Constants (C04)
 *
 * "We don't just migrate. The Machine PROVES balance."
 */

import { z } from "zod";

// ============================================================================
// Migration Reconciliation Types
// ============================================================================

export const MIGRATION_RECON_TYPE = [
  "trial_balance",
  "ar_aging",
  "ap_aging",
  "inventory_qty",
  "inventory_value",
  "open_orders",
  "open_pos",
  "open_invoices",
  "open_bills",
] as const;

export const migrationReconTypeSchema = z.enum(MIGRATION_RECON_TYPE);
export type MigrationReconType = z.infer<typeof migrationReconTypeSchema>;

// ============================================================================
// Reconciliation Status
// ============================================================================

export const DUAL_LEDGER_RECON_STATUS = [
  "matched", // Within tolerance
  "variance", // Outside tolerance
  "pending", // Not yet compared
  "exception", // Requires investigation
] as const;

export const dualLedgerReconStatusSchema = z.enum(DUAL_LEDGER_RECON_STATUS);
export type DualLedgerReconStatus = z.infer<typeof dualLedgerReconStatusSchema>;

// ============================================================================
// Exception Types
// ============================================================================

export const DUAL_LEDGER_EXCEPTION_TYPE = [
  "missing_in_axis", // Record exists in legacy but not in AXIS
  "missing_in_legacy", // Record exists in AXIS but not in legacy
  "value_mismatch", // Values don't match
  "mapping_error", // Incorrect mapping caused variance
  "timing_difference", // Transaction in different periods
  "rounding_difference", // Small rounding differences
  "duplicate_detected", // Duplicate in one system
] as const;

export const dualLedgerExceptionTypeSchema = z.enum(DUAL_LEDGER_EXCEPTION_TYPE);
export type DualLedgerExceptionType = z.infer<typeof dualLedgerExceptionTypeSchema>;

// ============================================================================
// Exception Status
// ============================================================================

export const DUAL_LEDGER_EXCEPTION_STATUS = [
  "open",
  "investigating",
  "resolved",
  "accepted",
] as const;

export const dualLedgerExceptionStatusSchema = z.enum(DUAL_LEDGER_EXCEPTION_STATUS);
export type DualLedgerExceptionStatus = z.infer<typeof dualLedgerExceptionStatusSchema>;

// ============================================================================
// Resolution Actions
// ============================================================================

export const RESOLUTION_ACTION = [
  "adjust_mapping",
  "adjust_data",
  "accept_variance",
  "exclude",
] as const;

export const resolutionActionSchema = z.enum(RESOLUTION_ACTION);
export type ResolutionAction = z.infer<typeof resolutionActionSchema>;

// ============================================================================
// Recon Priority
// ============================================================================

export const RECON_PRIORITY = [
  "critical",
  "high",
  "medium",
  "low",
] as const;

export const reconPrioritySchema = z.enum(RECON_PRIORITY);
export type ReconPriority = z.infer<typeof reconPrioritySchema>;
