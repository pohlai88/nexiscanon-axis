/**
 * Migration Reconciliation Schemas (C04)
 *
 * "Proving Balance: Legacy ↔ AXIS"
 */

import { z } from "zod";
import {
  migrationReconTypeSchema,
  dualLedgerReconStatusSchema,
} from "./constants";

// ============================================================================
// Reconciliation Detail (line-level comparison)
// ============================================================================

export const reconDetailSchema = z.object({
  key: z.string(), // Account code, customer ID, item code, etc.
  name: z.string(),
  legacyValue: z.string(),
  axisValue: z.string(),
  variance: z.string(),
  status: dualLedgerReconStatusSchema,
});

export type ReconDetail = z.infer<typeof reconDetailSchema>;

// ============================================================================
// Reconciliation Exception Summary
// ============================================================================

export const reconExceptionSummarySchema = z.object({
  key: z.string(),
  reason: z.string(),
  suggestedAction: z.string(),
});

export type ReconExceptionSummary = z.infer<typeof reconExceptionSummarySchema>;

// ============================================================================
// Migration Reconciliation
// ============================================================================

export const migrationReconSchema = z.object({
  id: z.uuid(),
  tenantId: z.uuid(),
  migrationStateId: z.uuid(),

  // Type
  reconType: migrationReconTypeSchema,

  // Timing
  asOfDate: z.string().datetime(),
  executedAt: z.string().datetime(),

  // Totals
  legacyTotal: z.string(), // Decimal string
  axisTotal: z.string(), // Decimal string
  variance: z.string(), // Decimal string (absolute)
  variancePercent: z.number(),

  // Tolerance
  toleranceAmount: z.string(),
  tolerancePercent: z.number(),

  // Status
  status: dualLedgerReconStatusSchema,

  // Details (line-level comparison)
  details: z.array(reconDetailSchema).default([]),

  // Exceptions
  exceptionCount: z.number().int(),
  exceptions: z.array(reconExceptionSummarySchema).optional(),

  // Execution info
  durationMs: z.number().int().optional(),

  createdAt: z.string().datetime(),
});

export type MigrationRecon = z.infer<typeof migrationReconSchema>;

// ============================================================================
// Reconciliation Run
// ============================================================================

export const reconRunSchema = z.object({
  id: z.uuid(),
  tenantId: z.uuid(),
  migrationStateId: z.uuid(),

  // Run info
  triggeredBy: z.enum(["scheduled", "manual", "sync_complete"]),
  triggeredByUserId: z.uuid().optional(),

  // Timing
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
  durationMs: z.number().int().optional(),

  // Types included
  reconTypes: z.array(migrationReconTypeSchema),

  // Results
  results: z.array(
    z.object({
      reconType: migrationReconTypeSchema,
      reconId: z.uuid(),
      status: dualLedgerReconStatusSchema,
      variance: z.string(),
    })
  ).default([]),

  // Summary
  allMatched: z.boolean().default(false),
  failedCount: z.number().int().default(0),

  createdAt: z.string().datetime(),
});

export type ReconRun = z.infer<typeof reconRunSchema>;
