/**
 * Migration Exception Schemas (C04)
 *
 * "The Machine analyzes reconciliation exceptions"
 */

import { z } from "zod";
import {
  dualLedgerExceptionTypeSchema,
  dualLedgerExceptionStatusSchema,
  resolutionActionSchema,
  migrationReconTypeSchema,
} from "./constants";

// ============================================================================
// Exception Resolution
// ============================================================================

export const exceptionResolutionSchema = z.object({
  action: resolutionActionSchema,
  note: z.string().max(2000),
  adjustmentDetails: z.record(z.string(), z.unknown()).optional(),
  resolvedBy: z.uuid(),
  resolvedAt: z.string().datetime(),
});

export type ExceptionResolution = z.infer<typeof exceptionResolutionSchema>;

// ============================================================================
// Migration Exception
// ============================================================================

export const migrationExceptionSchema = z.object({
  id: z.uuid(),
  tenantId: z.uuid(),
  migrationStateId: z.uuid(),
  reconId: z.uuid(),

  // Exception details
  exceptionType: dualLedgerExceptionTypeSchema,
  reconType: migrationReconTypeSchema,

  // Affected entity
  entityType: z.string(), // "account", "customer", "supplier", "item"
  entityKey: z.string(),
  entityName: z.string(),

  // Values
  legacyValue: z.string(),
  axisValue: z.string(),
  variance: z.string(),
  variancePercent: z.number().optional(),

  // Machine analysis
  suggestedAction: z.string(),
  suggestedReason: z.string(),
  confidence: z.number().min(0).max(1),
  analysisContext: z.record(z.string(), z.unknown()).optional(),

  // Status
  status: dualLedgerExceptionStatusSchema,

  // Resolution
  resolution: exceptionResolutionSchema.optional(),

  // Assignment
  assignedTo: z.uuid().optional(),
  assignedAt: z.string().datetime().optional(),

  // Priority
  priority: z.enum(["critical", "high", "medium", "low"]).default("medium"),

  // Notes
  notes: z.array(
    z.object({
      content: z.string().max(2000),
      createdBy: z.uuid(),
      createdAt: z.string().datetime(),
    })
  ).default([]),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type MigrationException = z.infer<typeof migrationExceptionSchema>;

// ============================================================================
// Exception Summary
// ============================================================================

export const exceptionSummarySchema = z.object({
  migrationStateId: z.uuid(),

  // Counts by status
  openCount: z.number().int(),
  investigatingCount: z.number().int(),
  resolvedCount: z.number().int(),
  acceptedCount: z.number().int(),
  totalCount: z.number().int(),

  // Counts by type
  byType: z.record(z.string(), z.number().int()),

  // Counts by recon type
  byReconType: z.record(z.string(), z.number().int()),

  // Total variance
  totalVarianceAmount: z.string(),

  // High priority exceptions
  highPriorityCount: z.number().int(),

  summarizedAt: z.string().datetime(),
});

export type ExceptionSummary = z.infer<typeof exceptionSummarySchema>;
