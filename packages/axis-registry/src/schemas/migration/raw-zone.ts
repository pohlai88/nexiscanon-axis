/**
 * Raw Zone Schema (C01)
 *
 * Raw zone is NEVER mutated — replayable.
 */

import { z } from "zod";
import { RAW_ENTITY_TYPE, IMPORT_STATUS } from "./constants";

// ============================================================================
// Raw Record Schema
// ============================================================================

export const rawRecordSchema = z.object({
  id: z.uuid(),
  tenantId: z.uuid(),
  importBatchId: z.uuid(),

  // Source reference
  sourceTableName: z.string().max(255),
  sourcePrimaryKey: z.string().max(255).optional(),

  // Raw data (JSONB — untouched from source)
  rawData: z.record(z.string(), z.unknown()),

  // Entity classification
  entityType: z.enum(RAW_ENTITY_TYPE).default("unknown"),

  // Processing status
  isProcessed: z.boolean().default(false),
  processedAt: z.string().datetime().optional(),
  normalizedRecordId: z.uuid().optional(),

  // Errors
  hasError: z.boolean().default(false),
  errorMessage: z.string().max(1000).optional(),

  createdAt: z.string().datetime(),
});

export type RawRecord = z.infer<typeof rawRecordSchema>;

// ============================================================================
// Import Batch Schema
// ============================================================================

export const importBatchSchema = z.object({
  id: z.uuid(),
  tenantId: z.uuid(),
  migrationStateId: z.uuid(),

  // Batch metadata
  batchNumber: z.number().int().positive(),
  label: z.string().max(255).optional(),

  // Source
  sourceTableName: z.string().max(255),
  mappingVersionId: z.uuid().optional(),

  // Status
  status: z.enum(IMPORT_STATUS).default("pending"),

  // Metrics
  totalRecords: z.number().int().default(0),
  processedRecords: z.number().int().default(0),
  successRecords: z.number().int().default(0),
  errorRecords: z.number().int().default(0),
  skippedRecords: z.number().int().default(0),

  // Timing
  startedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  durationMs: z.number().int().optional(),

  // Error summary
  errors: z.array(z.object({
    recordId: z.uuid().optional(),
    errorType: z.string(),
    message: z.string(),
    count: z.number().int().default(1),
  })).optional(),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.uuid(),
});

export type ImportBatch = z.infer<typeof importBatchSchema>;

// ============================================================================
// Import Summary Schema
// ============================================================================

export const importSummarySchema = z.object({
  tenantId: z.uuid(),
  migrationStateId: z.uuid(),
  asOfDate: z.string().datetime(),

  // By entity type
  byEntityType: z.array(z.object({
    entityType: z.enum(RAW_ENTITY_TYPE),
    totalRecords: z.number().int(),
    processedRecords: z.number().int(),
    errorRecords: z.number().int(),
  })),

  // Totals
  totalBatches: z.number().int(),
  totalRecords: z.number().int(),
  totalProcessed: z.number().int(),
  totalErrors: z.number().int(),

  // Latest batch
  latestBatchId: z.uuid().optional(),
  latestBatchAt: z.string().datetime().optional(),
});

export type ImportSummary = z.infer<typeof importSummarySchema>;
