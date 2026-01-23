/**
 * Post-Cutover Report Schema (C05)
 *
 * "Migration complete. Here's the proof."
 */

import { z } from "zod";

// ============================================================================
// Migration Timeline
// ============================================================================

export const migrationTimelineSchema = z.object({
  migrationStarted: z.string().datetime(),
  mirrorModeStarted: z.string().datetime().optional(),
  parallelModeStarted: z.string().datetime().optional(),
  cutoverStarted: z.string().datetime(),
  cutoverCompleted: z.string().datetime(),
  totalDays: z.number().int(),
});

export type MigrationTimeline = z.infer<typeof migrationTimelineSchema>;

// ============================================================================
// Data Summary
// ============================================================================

export const dataSummarySchema = z.object({
  partiesMigrated: z.number().int(),
  itemsMigrated: z.number().int(),
  accountsMigrated: z.number().int(),
  transactionsMigrated: z.number().int(),
  totalRecords: z.number().int(),
});

export type DataSummary = z.infer<typeof dataSummarySchema>;

// ============================================================================
// Quality Metrics
// ============================================================================

export const qualityMetricsSchema = z.object({
  mappingConfidence: z.number().min(0).max(1),
  finalReconciliationVariance: z.string(),
  exceptionsResolved: z.number().int(),
  exceptionsAccepted: z.number().int(),
  totalExceptions: z.number().int(),
  validationTestsPassed: z.number().int(),
  validationTestsTotal: z.number().int(),
});

export type QualityMetrics = z.infer<typeof qualityMetricsSchema>;

// ============================================================================
// Post-Cutover Report
// ============================================================================

export const postCutoverReportSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  migrationStateId: z.string().uuid(),
  cutoverExecutionId: z.string().uuid(),

  // Timeline
  timeline: migrationTimelineSchema,

  // Data summary
  dataSummary: dataSummarySchema,

  // Quality metrics
  qualityMetrics: qualityMetricsSchema,

  // Sign-offs
  signOffs: z.object({
    financial: z.object({
      signedBy: z.string().uuid(),
      signedAt: z.string().datetime(),
    }),
    operational: z.object({
      signedBy: z.string().uuid(),
      signedAt: z.string().datetime(),
    }),
    final: z.object({
      signedBy: z.string().uuid(),
      signedAt: z.string().datetime(),
    }),
  }),

  // Key participants
  participants: z.array(
    z.object({
      userId: z.string().uuid(),
      role: z.string(),
      contribution: z.string().optional(),
    })
  ),

  // Recommendations
  recommendations: z.array(z.string()),

  // Lessons learned
  lessonsLearned: z.array(z.string()).optional(),

  generatedAt: z.string().datetime(),
});

export type PostCutoverReport = z.infer<typeof postCutoverReportSchema>;
