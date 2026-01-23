/**
 * Shared Types for AXIS Canonical Blocks
 *
 * These types are used across multiple blocks and are consolidated here
 * to avoid duplicate export conflicts.
 */

// ============================================================================
// Trend & Analytics Types
// ============================================================================

export type TrendDirection = "up" | "down" | "stable"

// Note: TrendDataPoint is defined in trend-analysis-widget with different fields

// ============================================================================
// Aging & Financial Types
// ============================================================================

/** Aging bucket names for display */
export type AgingBucketName = "current" | "1-30" | "31-60" | "61-90" | "90+"

/** Aging bucket data structure (shared by AR and AP aging tables) */
export interface AgingBucket {
  current: number
  days30: number
  days60: number
  days90: number
  days90Plus: number
}

export interface AgingItem {
  id: string
  name: string
  current: number
  days1to30: number
  days31to60: number
  days61to90: number
  over90: number
  total: number
}

// ============================================================================
// Compliance & Override Types
// ============================================================================

/** Override reason category names */
export type OverrideReasonType =
  | "business_justification"
  | "executive_approval"
  | "emergency"
  | "one_time_exception"
  | "policy_review"
  | "system_limitation"
  | "custom"

/** Override reason structure (shared by danger-zone-indicator and policy-override-record) */
export interface OverrideReason {
  id: string
  label: string
  description?: string
  requiresApproval?: boolean
  requiresEvidence?: boolean
  requiresJustification?: boolean
}

export interface OverrideRecord {
  id: string
  reason: OverrideReason
  justification: string
  approvedBy: string
  approvedAt: Date
  expiresAt?: Date
}

// ============================================================================
// Priority Types (Generic - blocks may define their own specific versions)
// ============================================================================

export type Priority = "low" | "medium" | "high" | "critical"
export type Severity = "info" | "warning" | "error" | "critical"

// Note: Status types (ApprovalStatus, ViewStatus, ReconciliationStatus, etc.)
// are defined in individual blocks as they may have block-specific values.
// Actor and EntityRef are also defined in specific blocks (six-w1h-manifest).
