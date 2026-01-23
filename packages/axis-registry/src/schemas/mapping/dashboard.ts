/**
 * Mapping Dashboard Schemas (C03)
 *
 * "Few clicks" UX — confidence at a glance.
 */

import { z } from "zod";

// ============================================================================
// Category Stats
// ============================================================================

export const mappingCategoryStatsSchema = z.object({
  total: z.number().int(),
  autoAccepted: z.number().int(),
  pendingReview: z.number().int(),
  confirmed: z.number().int(),
  exception: z.number().int(),
  averageConfidence: z.number().min(0).max(1),
});

export type MappingCategoryStats = z.infer<typeof mappingCategoryStatsSchema>;

// ============================================================================
// Confidence Dashboard
// ============================================================================

export const confidenceDashboardSchema = z.object({
  migrationStateId: z.uuid(),

  // Totals
  totalMappings: z.number().int(),
  overallConfidence: z.number().min(0).max(1),

  // By status
  autoAccepted: z.number().int(),
  pendingReview: z.number().int(),
  userConfirmed: z.number().int(),
  exceptions: z.number().int(),

  // By category
  columns: mappingCategoryStatsSchema,
  accounts: mappingCategoryStatsSchema,
  parties: mappingCategoryStatsSchema,
  items: mappingCategoryStatsSchema,
  taxCodes: mappingCategoryStatsSchema,

  // Duplicates
  duplicateGroups: z.number().int(),
  duplicatesResolved: z.number().int(),
  duplicatesPending: z.number().int(),

  // Ready status
  readyForTrialImport: z.boolean(),
  blockers: z.array(z.string()).default([]),

  // Latest version
  currentVersion: z.number().int().optional(),
  latestTrialImportStatus: z.string().optional(),

  updatedAt: z.string().datetime(),
});

export type ConfidenceDashboard = z.infer<typeof confidenceDashboardSchema>;

// ============================================================================
// Review Item
// ============================================================================

export const reviewItemSchema = z.object({
  id: z.uuid(),
  mappingType: z.enum(["column", "coa", "alias", "tax"]),

  // Source info
  sourceName: z.string(),
  sourceCode: z.string().optional(),
  sourceValue: z.unknown().optional(),

  // Suggestion
  suggestedValue: z.string(),
  confidence: z.number().min(0).max(1),

  // Alternatives
  alternatives: z.array(z.string()).default([]),

  // Additional context
  context: z.record(z.string(), z.unknown()).optional(),
  warning: z.string().optional(),
});

export type ReviewItem = z.infer<typeof reviewItemSchema>;

// ============================================================================
// Review Queue
// ============================================================================

export const reviewQueueSchema = z.object({
  migrationStateId: z.uuid(),

  // Items to review
  items: z.array(reviewItemSchema),
  totalItems: z.number().int(),

  // Pagination
  page: z.number().int(),
  pageSize: z.number().int(),
  hasMore: z.boolean(),

  // Filters applied
  filters: z
    .object({
      mappingType: z.string().optional(),
      confidenceMin: z.number().optional(),
      confidenceMax: z.number().optional(),
      hasWarning: z.boolean().optional(),
    })
    .optional(),

  generatedAt: z.string().datetime(),
});

export type ReviewQueue = z.infer<typeof reviewQueueSchema>;
