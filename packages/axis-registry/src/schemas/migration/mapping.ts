/**
 * Column Mapping Schema (C01)
 *
 * The Machine understands columns, not ERPs.
 */

import { z } from "zod";
import {
  COLUMN_SEMANTIC_TYPE,
  MAPPING_CONFIDENCE,
  MAPPING_STATUS,
  RAW_ENTITY_TYPE,
} from "./constants";

// ============================================================================
// Source Column Schema
// ============================================================================

export const sourceColumnSchema = z.object({
  name: z.string().max(255),
  dataType: z.string().max(100),
  nullable: z.boolean(),
  maxLength: z.number().int().optional(),
  precision: z.number().int().optional(),
  scale: z.number().int().optional(),
  isPrimaryKey: z.boolean().default(false),
  isForeignKey: z.boolean().default(false),
  referencesTable: z.string().max(255).optional(),
  referencesColumn: z.string().max(255).optional(),
  sampleValues: z.array(z.string()).max(10).optional(),
  distinctCount: z.number().int().optional(),
  nullCount: z.number().int().optional(),
});

export type SourceColumn = z.infer<typeof sourceColumnSchema>;

// ============================================================================
// Source Table Schema
// ============================================================================

export const sourceTableSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  migrationStateId: z.string().uuid(),

  // Table metadata
  schemaName: z.string().max(255).optional(),
  tableName: z.string().max(255),
  rowCount: z.number().int().optional(),

  // Columns
  columns: z.array(sourceColumnSchema),

  // Entity type detection
  detectedEntityType: z.enum(RAW_ENTITY_TYPE).optional(),
  entityTypeConfidence: z.number().min(0).max(1).optional(),

  // Mapping status
  isMapped: z.boolean().default(false),
  mappedToEntity: z.string().max(100).optional(),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type SourceTable = z.infer<typeof sourceTableSchema>;

// ============================================================================
// Column Mapping Schema
// ============================================================================

export const columnMappingSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  sourceTableId: z.string().uuid(),

  // Source column
  sourceColumnName: z.string().max(255),
  sourceDataType: z.string().max(100),

  // Target mapping
  targetEntity: z.string().max(100), // e.g., "party", "item", "account"
  targetField: z.string().max(100),  // e.g., "legalName", "code", "balance"

  // Semantic classification (by The Machine)
  semanticType: z.enum(COLUMN_SEMANTIC_TYPE).optional(),

  // Confidence
  confidence: z.enum(MAPPING_CONFIDENCE).default("uncertain"),
  confidenceScore: z.number().min(0).max(1).optional(),
  confidenceFactors: z.array(z.object({
    factor: z.string(),
    impact: z.enum(["positive", "negative"]),
    weight: z.number(),
  })).optional(),

  // Status
  status: z.enum(MAPPING_STATUS).default("unmapped"),

  // Transformation
  transformationRule: z.string().max(500).optional(), // e.g., "UPPER(value)"
  defaultValue: z.unknown().optional(),

  // User override
  overriddenBy: z.string().uuid().optional(),
  overriddenAt: z.string().datetime().optional(),
  overrideReason: z.string().max(500).optional(),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type ColumnMapping = z.infer<typeof columnMappingSchema>;

// ============================================================================
// Mapping Version Schema
// ============================================================================

export const mappingVersionSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  migrationStateId: z.string().uuid(),

  // Version
  version: z.number().int().positive(),
  label: z.string().max(100).optional(),

  // Snapshot
  mappingsSnapshot: z.array(columnMappingSchema),

  // Metrics
  totalMappings: z.number().int(),
  autoMapped: z.number().int(),
  userConfirmed: z.number().int(),
  unmapped: z.number().int(),
  avgConfidence: z.number().min(0).max(1),

  createdAt: z.string().datetime(),
  createdBy: z.string().uuid(),
});

export type MappingVersion = z.infer<typeof mappingVersionSchema>;
