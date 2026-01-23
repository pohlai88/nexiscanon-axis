/**
 * Transform Specification Schemas (C02)
 *
 * Transformation pipeline from source columns to AXIS canonical.
 */

import { z } from "zod";
import { transformFunctionSchema } from "./constants";

// ============================================================================
// Transform Specification
// ============================================================================

export const transformSpecSchema = z.object({
  // Transform function name
  function: transformFunctionSchema,

  // Options for the transform
  options: z.record(z.string(), z.unknown()).optional(),

  // For date parsing
  dateFormat: z.string().optional(), // e.g., "YYYY-MM-DD", "MM/DD/YYYY"

  // For lookup transforms
  lookupTable: z.string().optional(),
  lookupColumn: z.string().optional(),

  // Fallback value if transform fails
  fallback: z.unknown().optional(),
});

export type TransformSpec = z.infer<typeof transformSpecSchema>;

// ============================================================================
// Transform Chain (Composite Transforms)
// ============================================================================

export const transformChainSchema = z.object({
  steps: z.array(transformSpecSchema),
  stopOnError: z.boolean().default(true),
});

export type TransformChain = z.infer<typeof transformChainSchema>;

// ============================================================================
// Column Transform Rule
// ============================================================================

export const columnTransformRuleSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),

  // Source reference
  sourceTable: z.string(),
  sourceColumn: z.string(),

  // Target reference
  targetEntity: z.string(), // e.g., "party", "item"
  targetField: z.string(), // e.g., "legalName", "code"

  // Transform
  transform: transformSpecSchema.optional(),
  transformChain: transformChainSchema.optional(), // For complex transforms

  // Defaults
  defaultValue: z.unknown().optional(),
  isRequired: z.boolean().default(false),

  // Validation
  validationRegex: z.string().optional(),
  validationMessage: z.string().optional(),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
});

export type ColumnTransformRule = z.infer<typeof columnTransformRuleSchema>;

// ============================================================================
// Transform Result
// ============================================================================

export const transformResultSchema = z.object({
  sourceValue: z.unknown(),
  transformedValue: z.unknown(),
  success: z.boolean(),
  error: z.string().optional(),
  transformApplied: z.string().optional(),
});

export type TransformResult = z.infer<typeof transformResultSchema>;

// ============================================================================
// Batch Transform Result
// ============================================================================

export const batchTransformResultSchema = z.object({
  tenantId: z.string().uuid(),
  sourceTable: z.string(),

  // Counts
  totalRecords: z.number().int(),
  successCount: z.number().int(),
  errorCount: z.number().int(),
  skippedCount: z.number().int(),

  // Errors (sample)
  errors: z
    .array(
      z.object({
        sourceRowId: z.string(),
        column: z.string(),
        error: z.string(),
        sourceValue: z.unknown(),
      })
    )
    .default([]),

  // Timing
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime(),
  durationMs: z.number().int(),
});

export type BatchTransformResult = z.infer<typeof batchTransformResultSchema>;

// ============================================================================
// Canonical Record (Transformed Output)
// ============================================================================

export const canonicalRecordSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  migrationStateId: z.string().uuid(),

  // Source reference
  sourceTable: z.string(),
  sourceRowId: z.string(),
  rawRecordId: z.string().uuid(),

  // Target entity
  targetEntity: z.string(), // "party", "item", "account", etc.

  // Transformed data
  canonicalData: z.record(z.string(), z.unknown()),

  // Validation status
  isValid: z.boolean(),
  validationErrors: z.array(z.string()).default([]),

  // Import status
  isImported: z.boolean().default(false),
  importedAt: z.string().datetime().optional(),
  importedRecordId: z.string().uuid().optional(), // ID in AXIS system

  createdAt: z.string().datetime(),
});

export type CanonicalRecord = z.infer<typeof canonicalRecordSchema>;
