/**
 * Mapping Version Schemas (C03)
 *
 * Versioned snapshots of mappings for trial imports.
 */

import { z } from "zod";
import {
  mappingVersionStatusSchema,
  trialImportStatusSchema,
} from "./constants";

// ============================================================================
// Mapping Change
// ============================================================================

export const mappingChangeSchema = z.object({
  mappingId: z.uuid(),
  mappingType: z.enum(["column", "coa", "alias", "tax"]),
  field: z.string(),
  oldValue: z.unknown(),
  newValue: z.unknown(),
  changedBy: z.uuid(),
  changedAt: z.string().datetime(),
});

export type MappingChange = z.infer<typeof mappingChangeSchema>;

// ============================================================================
// Mapping Version
// ============================================================================

export const studioMappingVersionSchema = z.object({
  id: z.uuid(),
  tenantId: z.uuid(),
  migrationStateId: z.uuid(),

  // Version number
  version: z.number().int(),
  label: z.string().optional(), // User-friendly label

  // Status
  status: mappingVersionStatusSchema,

  // Snapshot counts (not full snapshot to save space)
  columnMappingCount: z.number().int(),
  coaMappingCount: z.number().int(),
  aliasMappingCount: z.number().int(),
  taxMappingCount: z.number().int(),

  // Confidence metrics at snapshot time
  overallConfidence: z.number().min(0).max(1),
  autoAcceptedCount: z.number().int(),
  pendingReviewCount: z.number().int(),
  confirmedCount: z.number().int(),
  exceptionCount: z.number().int(),

  // Changes from previous version
  changes: z.array(mappingChangeSchema).default([]),

  // Trial import (if run)
  trialImportId: z.uuid().optional(),
  trialImportStatus: trialImportStatusSchema.optional(),
  trialImportResult: z
    .object({
      totalRecords: z.number().int(),
      successCount: z.number().int(),
      errorCount: z.number().int(),
      warnings: z.array(z.string()),
    })
    .optional(),

  createdAt: z.string().datetime(),
  createdBy: z.uuid(),
});

export type StudioMappingVersion = z.infer<typeof studioMappingVersionSchema>;

// ============================================================================
// Trial Import
// ============================================================================

export const trialImportSchema = z.object({
  id: z.uuid(),
  tenantId: z.uuid(),
  migrationStateId: z.uuid(),
  mappingVersionId: z.uuid(),

  // Status
  status: trialImportStatusSchema,

  // Progress
  totalRecords: z.number().int(),
  processedRecords: z.number().int(),
  successCount: z.number().int(),
  errorCount: z.number().int(),
  skippedCount: z.number().int(),

  // Errors (sample)
  errors: z
    .array(
      z.object({
        entityType: z.string(),
        sourceId: z.string(),
        error: z.string(),
      })
    )
    .default([]),

  // Warnings
  warnings: z.array(z.string()).default([]),

  // Timing
  startedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  durationMs: z.number().int().optional(),

  // Cleanup
  isCleanedUp: z.boolean().default(false),
  cleanedUpAt: z.string().datetime().optional(),

  createdAt: z.string().datetime(),
  createdBy: z.uuid(),
});

export type TrialImport = z.infer<typeof trialImportSchema>;
