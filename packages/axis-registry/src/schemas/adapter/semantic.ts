/**
 * Semantic Analysis Schemas (C02)
 *
 * "The Machine notices what columns mean."
 */

import { z } from "zod";
import {
  semanticCategorySchema,
  tableDomainSchema,
  analysisStatusSchema,
} from "./constants";
import { CONFIDENCE_LEVEL } from "../lynx/constants";

// ============================================================================
// Analysis Factor
// ============================================================================

export const analysisFactorSchema = z.object({
  factor: z.string(), // e.g., "column_name_pattern", "data_type", "sample_values"
  contribution: z.number().min(0).max(1), // How much this factor contributed
  evidence: z.string(), // What evidence supports this
});

export type AnalysisFactor = z.infer<typeof analysisFactorSchema>;

// ============================================================================
// Alternative Classification
// ============================================================================

export const alternativeClassificationSchema = z.object({
  category: semanticCategorySchema,
  confidence: z.number().min(0).max(1),
  reasoning: z.string().optional(),
});

export type AlternativeClassification = z.infer<
  typeof alternativeClassificationSchema
>;

// ============================================================================
// Column Semantic Analysis
// ============================================================================

export const columnSemanticSchema = z.object({
  id: z.uuid(),
  tenantId: z.uuid(),
  sourceSchemaId: z.uuid(),

  // Source reference
  sourceTable: z.string(),
  sourceColumn: z.string(),

  // Semantic classification
  semanticCategory: semanticCategorySchema,
  confidence: z.number().min(0).max(1),
  confidenceLevel: z.enum(CONFIDENCE_LEVEL),

  // Analysis factors (how The Machine arrived at this classification)
  factors: z.array(analysisFactorSchema),
  reasoning: z.string().optional(),

  // Alternative classifications
  alternatives: z.array(alternativeClassificationSchema).default([]),

  // Mapping target
  axisEntity: z.string().optional(), // e.g., "party", "item", "account"
  axisField: z.string().optional(), // e.g., "legalName", "code"
  axisSchema: z.string().optional(), // e.g., "partySchema"

  // Transform hint
  transformHint: z.string().optional(), // e.g., "uppercase", "trim", "parse_date"

  // Status
  status: analysisStatusSchema.default("pending"),
  isConfirmed: z.boolean().default(false), // Human confirmed
  confirmedBy: z.uuid().optional(),
  confirmedAt: z.string().datetime().optional(),

  analyzedAt: z.string().datetime(),
  analyzedBy: z.string().optional(), // "machine" or user ID
});

export type ColumnSemantic = z.infer<typeof columnSemanticSchema>;

// ============================================================================
// Table Context Analysis
// ============================================================================

export const tableContextSchema = z.object({
  id: z.uuid(),
  tenantId: z.uuid(),
  sourceSchemaId: z.uuid(),

  // Table reference
  tableName: z.string(),

  // Domain classification
  likelyDomain: tableDomainSchema,
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),

  // Alternatives
  alternatives: z
    .array(
      z.object({
        domain: tableDomainSchema,
        confidence: z.number().min(0).max(1),
      })
    )
    .default([]),

  // Status
  isConfirmed: z.boolean().default(false),
  confirmedBy: z.uuid().optional(),
  confirmedAt: z.string().datetime().optional(),

  analyzedAt: z.string().datetime(),
});

export type TableContext = z.infer<typeof tableContextSchema>;

// ============================================================================
// Semantic Analysis Job
// ============================================================================

export const semanticAnalysisJobSchema = z.object({
  id: z.uuid(),
  tenantId: z.uuid(),
  sourceSchemaId: z.uuid(),

  // Job status
  status: analysisStatusSchema,

  // Progress
  totalTables: z.number().int(),
  analyzedTables: z.number().int().default(0),
  totalColumns: z.number().int(),
  analyzedColumns: z.number().int().default(0),

  // Results
  highConfidenceCount: z.number().int().default(0), // >= 0.8
  mediumConfidenceCount: z.number().int().default(0), // 0.5 - 0.8
  lowConfidenceCount: z.number().int().default(0), // < 0.5
  unknownCount: z.number().int().default(0),

  // Timing
  startedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  durationMs: z.number().int().optional(),

  // Errors
  error: z.string().optional(),
  warnings: z.array(z.string()).default([]),

  createdAt: z.string().datetime(),
  createdBy: z.uuid(),
});

export type SemanticAnalysisJob = z.infer<typeof semanticAnalysisJobSchema>;

// ============================================================================
// Column Pattern Definition
// ============================================================================

export const columnPatternSchema = z.object({
  id: z.uuid(),
  category: semanticCategorySchema,
  pattern: z.string(), // Regex pattern
  source: z.string().optional(), // e.g., "SAP", "QuickBooks", "Generic"
  confidence: z.number().min(0).max(1).default(0.7),
  isBuiltIn: z.boolean().default(true),
});

export type ColumnPattern = z.infer<typeof columnPatternSchema>;
