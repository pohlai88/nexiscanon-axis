/**
 * Inventory Domain Constants
 *
 * All enums and constants for the Inventory domain (B06)
 */

// ============================================================================
// Stock Move Types
// ============================================================================

export const MOVE_TYPE = [
  "receipt",
  "delivery",
  "transfer",
  "adjustment_in",
  "adjustment_out",
  "return_in",
  "return_out",
  "scrap",
  "production_in",
  "production_out",
] as const;

export type MoveType = (typeof MOVE_TYPE)[number];

export const MOVE_STATUS = [
  "draft",
  "confirmed",
  "in_transit",
  "posted",
  "cancelled",
] as const;

export type MoveStatus = (typeof MOVE_STATUS)[number];

// ============================================================================
// Costing Methods
// ============================================================================

export const COSTING_METHOD = [
  "weighted_average",
  "fifo",
  "standard",
] as const;

export type CostingMethod = (typeof COSTING_METHOD)[number];

// ============================================================================
// Reservation Status
// ============================================================================

export const RESERVATION_STATUS = [
  "active",
  "partially_fulfilled",
  "fulfilled",
  "cancelled",
  "expired",
] as const;

export type ReservationStatus = (typeof RESERVATION_STATUS)[number];

// ============================================================================
// Adjustment Reasons
// ============================================================================

export const ADJUSTMENT_REASON = [
  "physical_count",
  "damage",
  "obsolescence",
  "theft",
  "found",
  "data_entry_error",
  "unit_conversion",
  "other",
] as const;

export type AdjustmentReason = (typeof ADJUSTMENT_REASON)[number];

// ============================================================================
// Transfer Status
// ============================================================================

export const TRANSFER_STATUS = [
  "draft",
  "confirmed",
  "in_transit",
  "received",
  "cancelled",
] as const;

export type TransferStatus = (typeof TRANSFER_STATUS)[number];

// ============================================================================
// Physical Count Types & Status
// ============================================================================

export const COUNT_STATUS = [
  "draft",
  "in_progress",
  "pending_review",
  "approved",
  "posted",
  "cancelled",
] as const;

export type CountStatus = (typeof COUNT_STATUS)[number];

export const COUNT_TYPE = [
  "full",
  "cycle",
  "spot",
  "perpetual",
] as const;

export type CountType = (typeof COUNT_TYPE)[number];
