/**
 * Cutover Rollback Schema (C05)
 *
 * "Reversible. Raw zone preserved."
 */

import { z } from "zod";
import { rollbackTriggerSchema, cutoverStatusSchema } from "./constants";

// ============================================================================
// Delta Transaction
// ============================================================================

export const deltaTransactionSchema = z.object({
  id: z.string().uuid(),
  entityType: z.string(),
  entityId: z.string().uuid(),
  action: z.enum(["create", "update", "delete"]),
  data: z.record(z.string(), z.unknown()),
  createdAt: z.string().datetime(),
});

export type DeltaTransaction = z.infer<typeof deltaTransactionSchema>;

// ============================================================================
// Rollback Execution
// ============================================================================

export const rollbackExecutionSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  migrationStateId: z.string().uuid(),
  cutoverExecutionId: z.string().uuid(),

  // Trigger
  trigger: rollbackTriggerSchema,
  triggerDetails: z.string().max(2000).optional(),

  // Authorization
  authorizedBy: z.string().uuid(),
  authorizedAt: z.string().datetime(),
  authorizationNote: z.string().max(2000).optional(),

  // Delta capture
  deltaTransactionCount: z.number().int(),
  deltaTransactions: z.array(deltaTransactionSchema).default([]),
  deltaCapturedAt: z.string().datetime().optional(),

  // Execution steps
  steps: z.object({
    axisDisabled: z.object({
      status: cutoverStatusSchema,
      completedAt: z.string().datetime().optional(),
    }),
    legacyReenabled: z.object({
      status: cutoverStatusSchema,
      completedAt: z.string().datetime().optional(),
    }),
    deltaApplied: z.object({
      status: cutoverStatusSchema,
      applied: z.boolean().default(false),
      appliedCount: z.number().int().optional(),
      failedCount: z.number().int().optional(),
      completedAt: z.string().datetime().optional(),
    }),
    verified: z.object({
      status: cutoverStatusSchema,
      completedAt: z.string().datetime().optional(),
    }),
  }),

  // Status
  overallStatus: cutoverStatusSchema,

  // Timing
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
  durationMs: z.number().int().optional(),

  // Post-mortem
  postMortemScheduled: z.boolean().default(false),
  postMortemScheduledAt: z.string().datetime().optional(),
  postMortemNotes: z.string().max(5000).optional(),

  createdAt: z.string().datetime(),
});

export type RollbackExecution = z.infer<typeof rollbackExecutionSchema>;

// ============================================================================
// Rollback Result
// ============================================================================

export const rollbackResultSchema = z.object({
  success: z.boolean(),
  deltaTransactions: z.number().int(),
  deltaApplied: z.boolean(),
  deltaAppliedCount: z.number().int().optional(),
  rolledBackAt: z.string().datetime(),
  errors: z.array(z.string()).default([]),
});

export type RollbackResult = z.infer<typeof rollbackResultSchema>;
