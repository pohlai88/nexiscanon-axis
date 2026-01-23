/**
 * Cutover Execution Schema (C05)
 *
 * "A state machine transition, not a leap of faith."
 */

import { z } from "zod";
import { cutoverPhaseSchema, cutoverStatusSchema } from "./constants";

// ============================================================================
// Phase Status
// ============================================================================

export const phaseStatusSchema = z.object({
  status: cutoverStatusSchema,
  startedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  notes: z.string().max(2000).optional(),
});

export type PhaseStatus = z.infer<typeof phaseStatusSchema>;

// ============================================================================
// Freeze Phase Details
// ============================================================================

export const freezePhaseSchema = phaseStatusSchema.extend({
  legacyFrozenAt: z.string().datetime().optional(),
  deltaImportedAt: z.string().datetime().optional(),
  deltaRecordCount: z.number().int().optional(),
  finalReconAt: z.string().datetime().optional(),
  allGatesGreen: z.boolean().optional(),
});

export type FreezePhase = z.infer<typeof freezePhaseSchema>;

// ============================================================================
// Switch Phase Details
// ============================================================================

export const switchPhaseSchema = phaseStatusSchema.extend({
  legacyDisabledAt: z.string().datetime().optional(),
  axisEnabledAt: z.string().datetime().optional(),
  integrationsRedirectedAt: z.string().datetime().optional(),
});

export type SwitchPhase = z.infer<typeof switchPhaseSchema>;

// ============================================================================
// Validation Phase Details
// ============================================================================

export const validationPhaseSchema = phaseStatusSchema.extend({
  testsRun: z.number().int().optional(),
  testsPassed: z.number().int().optional(),
  testsFailed: z.number().int().optional(),
  testResults: z
    .array(
      z.object({
        name: z.string(),
        passed: z.boolean(),
        error: z.string().optional(),
        durationMs: z.number().int().optional(),
      })
    )
    .optional(),
});

export type ValidationPhase = z.infer<typeof validationPhaseSchema>;

// ============================================================================
// Cutover Participant
// ============================================================================

export const cutoverParticipantSchema = z.object({
  userId: z.string().uuid(),
  role: z.string(),
  confirmedAt: z.string().datetime().optional(),
  presentAtCutover: z.boolean().default(false),
});

export type CutoverParticipant = z.infer<typeof cutoverParticipantSchema>;

// ============================================================================
// Final Sign-off
// ============================================================================

export const finalSignoffSchema = z.object({
  signedBy: z.string().uuid(),
  signedAt: z.string().datetime(),
  notes: z.string().max(2000).optional(),
});

export type FinalSignoff = z.infer<typeof finalSignoffSchema>;

// ============================================================================
// Cutover Execution
// ============================================================================

export const cutoverExecutionSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  migrationStateId: z.string().uuid(),

  // Scheduling
  scheduledAt: z.string().datetime(),
  freezeWindowStart: z.string().datetime(),
  freezeWindowEnd: z.string().datetime(),
  freezeWindowHours: z.number().int().default(4),

  // Current phase
  currentPhase: cutoverPhaseSchema,

  // Phase status
  phases: z.object({
    preparation: phaseStatusSchema,
    freeze: freezePhaseSchema,
    switch: switchPhaseSchema,
    validation: validationPhaseSchema,
    completion: phaseStatusSchema,
  }),

  // Overall status
  overallStatus: cutoverStatusSchema,

  // Participants
  cutoverLead: z.string().uuid(),
  participants: z.array(cutoverParticipantSchema).default([]),

  // Final sign-off
  finalSignOff: finalSignoffSchema.optional(),

  // Timing
  actualStartedAt: z.string().datetime().optional(),
  actualCompletedAt: z.string().datetime().optional(),
  totalDurationMs: z.number().int().optional(),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CutoverExecution = z.infer<typeof cutoverExecutionSchema>;
