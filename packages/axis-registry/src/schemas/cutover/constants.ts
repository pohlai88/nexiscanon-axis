/**
 * Cutover Runbook Constants (C05)
 *
 * "Cutover is not a leap of faith. The Machine provides calculated proof."
 */

import { z } from "zod";

// ============================================================================
// Cutover Phases
// ============================================================================

export const CUTOVER_PHASE = [
  "preparation",
  "freeze",
  "switch",
  "validation",
  "completion",
  "rollback",
] as const;

export const cutoverPhaseSchema = z.enum(CUTOVER_PHASE);
export type CutoverPhase = z.infer<typeof cutoverPhaseSchema>;

// ============================================================================
// Cutover Status
// ============================================================================

export const CUTOVER_STATUS = [
  "not_started",
  "in_progress",
  "completed",
  "failed",
  "rolled_back",
] as const;

export const cutoverStatusSchema = z.enum(CUTOVER_STATUS);
export type CutoverStatus = z.infer<typeof cutoverStatusSchema>;

// ============================================================================
// Rollback Triggers
// ============================================================================

export const ROLLBACK_TRIGGER = [
  "validation_failed",
  "critical_error",
  "data_integrity_issue",
  "user_request",
] as const;

export const rollbackTriggerSchema = z.enum(ROLLBACK_TRIGGER);
export type RollbackTrigger = z.infer<typeof rollbackTriggerSchema>;

// ============================================================================
// Checklist Categories
// ============================================================================

export const CHECKLIST_CATEGORY = [
  "technical",
  "business",
  "operational",
] as const;

export const checklistCategorySchema = z.enum(CHECKLIST_CATEGORY);
export type ChecklistCategory = z.infer<typeof checklistCategorySchema>;

// ============================================================================
// Sign-off Types
// ============================================================================

export const SIGNOFF_TYPE = [
  "financial",
  "operational",
  "it",
  "final",
] as const;

export const signoffTypeSchema = z.enum(SIGNOFF_TYPE);
export type SignoffType = z.infer<typeof signoffTypeSchema>;

// ============================================================================
// Gate Color
// ============================================================================

export const GATE_COLOR = ["green", "red"] as const;

export const gateColorSchema = z.enum(GATE_COLOR);
export type GateColor = z.infer<typeof gateColorSchema>;
