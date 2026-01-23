/**
 * Cutover Events (C05)
 *
 * Events published by the Cutover Runbook domain.
 */

import { z } from "zod";
import { createEventSchema } from "./base";
import {
  CUTOVER_PHASE,
  ROLLBACK_TRIGGER,
} from "../cutover/constants";

// ============================================================================
// Prerequisites Events
// ============================================================================

export const cutoverPrerequisitesEvaluatedEventSchema = createEventSchema(
  "cutover.prerequisites.evaluated",
  z.object({
    migrationStateId: z.string().uuid(),
    allPrerequisitesMet: z.boolean(),
    blockerCount: z.number().int(),
    consecutiveGreenDays: z.number().int(),
  })
);

export const cutoverSignoffReceivedEventSchema = createEventSchema(
  "cutover.signoff.received",
  z.object({
    migrationStateId: z.string().uuid(),
    signoffType: z.enum(["financial", "operational", "it", "final"]),
    signedBy: z.string().uuid(),
  })
);

// ============================================================================
// Execution Events
// ============================================================================

export const cutoverScheduledEventSchema = createEventSchema(
  "cutover.scheduled",
  z.object({
    cutoverExecutionId: z.string().uuid(),
    migrationStateId: z.string().uuid(),
    scheduledAt: z.string().datetime(),
    freezeWindowHours: z.number().int(),
    cutoverLead: z.string().uuid(),
  })
);

export const cutoverStartedEventSchema = createEventSchema(
  "cutover.started",
  z.object({
    cutoverExecutionId: z.string().uuid(),
    migrationStateId: z.string().uuid(),
    phase: z.enum(CUTOVER_PHASE),
  })
);

export const cutoverPhaseCompletedEventSchema = createEventSchema(
  "cutover.phase.completed",
  z.object({
    cutoverExecutionId: z.string().uuid(),
    phase: z.enum(CUTOVER_PHASE),
    durationMs: z.number().int().optional(),
  })
);

export const cutoverPhaseFailedEventSchema = createEventSchema(
  "cutover.phase.failed",
  z.object({
    cutoverExecutionId: z.string().uuid(),
    phase: z.enum(CUTOVER_PHASE),
    error: z.string(),
  })
);

// ============================================================================
// Freeze Phase Events
// ============================================================================

export const cutoverLegacyFrozenEventSchema = createEventSchema(
  "cutover.legacy.frozen",
  z.object({
    cutoverExecutionId: z.string().uuid(),
    tenantId: z.string().uuid(),
  })
);

export const cutoverDeltaImportedEventSchema = createEventSchema(
  "cutover.delta.imported",
  z.object({
    cutoverExecutionId: z.string().uuid(),
    recordCount: z.number().int(),
    durationMs: z.number().int(),
  })
);

export const cutoverFinalReconCompletedEventSchema = createEventSchema(
  "cutover.final_recon.completed",
  z.object({
    cutoverExecutionId: z.string().uuid(),
    allGatesGreen: z.boolean(),
  })
);

// ============================================================================
// Switch Phase Events
// ============================================================================

export const cutoverSwitchExecutedEventSchema = createEventSchema(
  "cutover.switch.executed",
  z.object({
    cutoverExecutionId: z.string().uuid(),
    legacyDisabledAt: z.string().datetime(),
    axisEnabledAt: z.string().datetime(),
  })
);

export const cutoverIntegrationsRedirectedEventSchema = createEventSchema(
  "cutover.integrations.redirected",
  z.object({
    cutoverExecutionId: z.string().uuid(),
    integrationCount: z.number().int(),
  })
);

// ============================================================================
// Validation Phase Events
// ============================================================================

export const cutoverValidationStartedEventSchema = createEventSchema(
  "cutover.validation.started",
  z.object({
    cutoverExecutionId: z.string().uuid(),
    testCount: z.number().int(),
  })
);

export const cutoverValidationCompletedEventSchema = createEventSchema(
  "cutover.validation.completed",
  z.object({
    cutoverExecutionId: z.string().uuid(),
    testsRun: z.number().int(),
    testsPassed: z.number().int(),
    testsFailed: z.number().int(),
    allPassed: z.boolean(),
  })
);

// ============================================================================
// Completion Events
// ============================================================================

export const cutoverCompletedEventSchema = createEventSchema(
  "cutover.completed",
  z.object({
    cutoverExecutionId: z.string().uuid(),
    migrationStateId: z.string().uuid(),
    signedBy: z.string().uuid(),
    totalDurationMs: z.number().int(),
  })
);

export const cutoverLegacyArchivedEventSchema = createEventSchema(
  "cutover.legacy.archived",
  z.object({
    cutoverExecutionId: z.string().uuid(),
    tenantId: z.string().uuid(),
  })
);

// ============================================================================
// Rollback Events
// ============================================================================

export const cutoverRollbackInitiatedEventSchema = createEventSchema(
  "cutover.rollback.initiated",
  z.object({
    rollbackExecutionId: z.string().uuid(),
    cutoverExecutionId: z.string().uuid(),
    trigger: z.enum(ROLLBACK_TRIGGER),
    authorizedBy: z.string().uuid(),
  })
);

export const cutoverRollbackCompletedEventSchema = createEventSchema(
  "cutover.rollback.completed",
  z.object({
    rollbackExecutionId: z.string().uuid(),
    success: z.boolean(),
    deltaApplied: z.boolean(),
    deltaCount: z.number().int(),
  })
);

// ============================================================================
// Checklist Events
// ============================================================================

export const cutoverChecklistItemCompletedEventSchema = createEventSchema(
  "cutover.checklist.item_completed",
  z.object({
    checklistId: z.string().uuid(),
    itemId: z.string(),
    completedBy: z.string().uuid(),
  })
);

export const cutoverChecklistCompleteEventSchema = createEventSchema(
  "cutover.checklist.complete",
  z.object({
    checklistId: z.string().uuid(),
    migrationStateId: z.string().uuid(),
    itemsCompleted: z.number().int(),
  })
);

// ============================================================================
// Union Type
// ============================================================================

export const cutoverEventSchema = z.discriminatedUnion("type", [
  cutoverPrerequisitesEvaluatedEventSchema,
  cutoverSignoffReceivedEventSchema,
  cutoverScheduledEventSchema,
  cutoverStartedEventSchema,
  cutoverPhaseCompletedEventSchema,
  cutoverPhaseFailedEventSchema,
  cutoverLegacyFrozenEventSchema,
  cutoverDeltaImportedEventSchema,
  cutoverFinalReconCompletedEventSchema,
  cutoverSwitchExecutedEventSchema,
  cutoverIntegrationsRedirectedEventSchema,
  cutoverValidationStartedEventSchema,
  cutoverValidationCompletedEventSchema,
  cutoverCompletedEventSchema,
  cutoverLegacyArchivedEventSchema,
  cutoverRollbackInitiatedEventSchema,
  cutoverRollbackCompletedEventSchema,
  cutoverChecklistItemCompletedEventSchema,
  cutoverChecklistCompleteEventSchema,
]);

export type CutoverEvent = z.infer<typeof cutoverEventSchema>;
