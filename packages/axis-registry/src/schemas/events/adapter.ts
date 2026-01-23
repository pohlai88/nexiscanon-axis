/**
 * Column Adapter Events (C02)
 *
 * Events published by the Column Adapter domain.
 */

import { z } from "zod";
import { createEventSchema } from "./base";
import {
  SOURCE_CONNECTOR_TYPE,
  SEMANTIC_CATEGORY,
  TABLE_DOMAIN,
  INTROSPECTION_STATUS,
  ANALYSIS_STATUS,
} from "../adapter/constants";

// ============================================================================
// Introspection Events
// ============================================================================

export const adapterIntrospectionStartedEventSchema = createEventSchema(
  "adapter.introspection.started",
  z.object({
    sourceSchemaId: z.string().uuid(),
    sourceType: z.enum(SOURCE_CONNECTOR_TYPE),
    estimatedTables: z.number().int().optional(),
  })
);

export const adapterIntrospectionCompletedEventSchema = createEventSchema(
  "adapter.introspection.completed",
  z.object({
    sourceSchemaId: z.string().uuid(),
    sourceType: z.enum(SOURCE_CONNECTOR_TYPE),
    status: z.enum(INTROSPECTION_STATUS),
    tablesFound: z.number().int(),
    columnsFound: z.number().int(),
    rowsEstimated: z.number().int().optional(),
    durationMs: z.number().int(),
    error: z.string().optional(),
  })
);

export const adapterTableDetectedEventSchema = createEventSchema(
  "adapter.table.detected",
  z.object({
    sourceSchemaId: z.string().uuid(),
    tableName: z.string(),
    columnCount: z.number().int(),
    rowCount: z.number().int().optional(),
    detectedDomain: z.enum(TABLE_DOMAIN).optional(),
    domainConfidence: z.number().min(0).max(1).optional(),
  })
);

// ============================================================================
// Semantic Analysis Events
// ============================================================================

export const adapterAnalysisStartedEventSchema = createEventSchema(
  "adapter.analysis.started",
  z.object({
    analysisJobId: z.string().uuid(),
    sourceSchemaId: z.string().uuid(),
    totalTables: z.number().int(),
    totalColumns: z.number().int(),
  })
);

export const adapterAnalysisCompletedEventSchema = createEventSchema(
  "adapter.analysis.completed",
  z.object({
    analysisJobId: z.string().uuid(),
    sourceSchemaId: z.string().uuid(),
    status: z.enum(ANALYSIS_STATUS),
    analyzedColumns: z.number().int(),
    highConfidenceCount: z.number().int(),
    mediumConfidenceCount: z.number().int(),
    lowConfidenceCount: z.number().int(),
    unknownCount: z.number().int(),
    durationMs: z.number().int(),
  })
);

export const adapterColumnClassifiedEventSchema = createEventSchema(
  "adapter.column.classified",
  z.object({
    sourceSchemaId: z.string().uuid(),
    sourceTable: z.string(),
    sourceColumn: z.string(),
    semanticCategory: z.enum(SEMANTIC_CATEGORY),
    confidence: z.number().min(0).max(1),
    axisEntity: z.string().optional(),
    axisField: z.string().optional(),
    transformHint: z.string().optional(),
  })
);

export const adapterColumnConfirmedEventSchema = createEventSchema(
  "adapter.column.confirmed",
  z.object({
    columnSemanticId: z.string().uuid(),
    sourceTable: z.string(),
    sourceColumn: z.string(),
    originalCategory: z.enum(SEMANTIC_CATEGORY),
    confirmedCategory: z.enum(SEMANTIC_CATEGORY),
    wasChanged: z.boolean(),
    confirmedBy: z.string().uuid(),
  })
);

// ============================================================================
// Transform Events
// ============================================================================

export const adapterTransformStartedEventSchema = createEventSchema(
  "adapter.transform.started",
  z.object({
    migrationStateId: z.string().uuid(),
    sourceTable: z.string(),
    targetEntity: z.string(),
    estimatedRecords: z.number().int(),
  })
);

export const adapterTransformCompletedEventSchema = createEventSchema(
  "adapter.transform.completed",
  z.object({
    migrationStateId: z.string().uuid(),
    sourceTable: z.string(),
    targetEntity: z.string(),
    totalRecords: z.number().int(),
    successCount: z.number().int(),
    errorCount: z.number().int(),
    skippedCount: z.number().int(),
    durationMs: z.number().int(),
  })
);

export const adapterTransformErrorEventSchema = createEventSchema(
  "adapter.transform.error",
  z.object({
    migrationStateId: z.string().uuid(),
    sourceTable: z.string(),
    sourceRowId: z.string(),
    column: z.string(),
    error: z.string(),
    sourceValue: z.unknown().optional(),
  })
);

// ============================================================================
// Canonical Record Events
// ============================================================================

export const adapterRecordCanonicalizedEventSchema = createEventSchema(
  "adapter.record.canonicalized",
  z.object({
    canonicalRecordId: z.string().uuid(),
    sourceTable: z.string(),
    sourceRowId: z.string(),
    targetEntity: z.string(),
    isValid: z.boolean(),
    validationErrorCount: z.number().int(),
  })
);

export const adapterRecordImportedEventSchema = createEventSchema(
  "adapter.record.imported",
  z.object({
    canonicalRecordId: z.string().uuid(),
    sourceTable: z.string(),
    sourceRowId: z.string(),
    targetEntity: z.string(),
    importedRecordId: z.string().uuid(),
  })
);

// ============================================================================
// Pattern Events
// ============================================================================

export const adapterPatternMatchedEventSchema = createEventSchema(
  "adapter.pattern.matched",
  z.object({
    sourceSchemaId: z.string().uuid(),
    sourceTable: z.string(),
    sourceColumn: z.string(),
    patternId: z.string().uuid(),
    category: z.enum(SEMANTIC_CATEGORY),
    confidence: z.number().min(0).max(1),
  })
);

// ============================================================================
// Union Type
// ============================================================================

export const adapterEventSchema = z.discriminatedUnion("type", [
  adapterIntrospectionStartedEventSchema,
  adapterIntrospectionCompletedEventSchema,
  adapterTableDetectedEventSchema,
  adapterAnalysisStartedEventSchema,
  adapterAnalysisCompletedEventSchema,
  adapterColumnClassifiedEventSchema,
  adapterColumnConfirmedEventSchema,
  adapterTransformStartedEventSchema,
  adapterTransformCompletedEventSchema,
  adapterTransformErrorEventSchema,
  adapterRecordCanonicalizedEventSchema,
  adapterRecordImportedEventSchema,
  adapterPatternMatchedEventSchema,
]);

export type AdapterEvent = z.infer<typeof adapterEventSchema>;
