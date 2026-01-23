/**
 * Source Abstraction Schemas (C02)
 *
 * Unified representation of any source database/file.
 */

import { z } from "zod";
import {
  sourceConnectorTypeSchema,
  relationshipTypeSchema,
  tableDomainSchema,
  introspectionStatusSchema,
} from "./constants";

// ============================================================================
// Connection Configuration
// ============================================================================

export const databaseConnectionSchema = z.object({
  host: z.string().optional(),
  port: z.number().int().optional(),
  database: z.string().optional(),
  schema: z.string().default("public"),
  // Credentials stored in secret manager, referenced by ID
  credentialRef: z.string().uuid().optional(),
  // SSL configuration
  ssl: z
    .object({
      enabled: z.boolean().default(false),
      rejectUnauthorized: z.boolean().default(true),
      ca: z.string().optional(),
    })
    .optional(),
});

export type DatabaseConnection = z.infer<typeof databaseConnectionSchema>;

export const fileSourceSchema = z.object({
  path: z.string(),
  encoding: z.string().default("utf-8"),
  delimiter: z.string().default(","),
  hasHeader: z.boolean().default(true),
  sheetName: z.string().optional(), // For Excel
  skipRows: z.number().int().default(0),
});

export type FileSource = z.infer<typeof fileSourceSchema>;

export const apiSourceSchema = z.object({
  baseUrl: z.string().url(),
  authType: z.enum(["none", "basic", "bearer", "api_key", "oauth2"]),
  credentialRef: z.string().uuid().optional(),
  headers: z.record(z.string(), z.string()).optional(),
});

export type ApiSource = z.infer<typeof apiSourceSchema>;

// ============================================================================
// Column Schema
// ============================================================================

export const sourceColumnDetailSchema = z.object({
  name: z.string(),
  dataType: z.string(), // Original type from source
  nullable: z.boolean(),
  isPrimaryKey: z.boolean().default(false),
  isForeignKey: z.boolean().default(false),
  foreignKeyRef: z
    .object({
      table: z.string(),
      column: z.string(),
    })
    .optional(),
  defaultValue: z.unknown().optional(),

  // Sample data for Machine analysis
  sampleValues: z.array(z.unknown()).optional(),
  distinctCount: z.number().int().optional(),
  nullCount: z.number().int().optional(),
  totalCount: z.number().int().optional(),

  // Statistics
  minValue: z.unknown().optional(),
  maxValue: z.unknown().optional(),
  avgLength: z.number().optional(), // For strings
});

export type SourceColumnDetail = z.infer<typeof sourceColumnDetailSchema>;

// ============================================================================
// Table Schema
// ============================================================================

export const sourceTableDetailSchema = z.object({
  name: z.string(),
  schema: z.string().optional(), // Database schema (e.g., "public")
  rowCount: z.number().int().optional(),
  columns: z.array(sourceColumnDetailSchema),

  // Machine classification
  detectedDomain: tableDomainSchema.optional(),
  domainConfidence: z.number().min(0).max(1).optional(),
});

export type SourceTableDetail = z.infer<typeof sourceTableDetailSchema>;

// ============================================================================
// Relationship Schema
// ============================================================================

export const sourceRelationshipSchema = z.object({
  fromTable: z.string(),
  fromColumn: z.string(),
  toTable: z.string(),
  toColumn: z.string(),
  type: relationshipTypeSchema,
  isInferred: z.boolean().default(false), // True if inferred from naming, not FK
});

export type SourceRelationship = z.infer<typeof sourceRelationshipSchema>;

// ============================================================================
// Source Schema (Complete Introspected Schema)
// ============================================================================

export const sourceSchemaSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  migrationStateId: z.string().uuid(),

  // Source type
  sourceType: sourceConnectorTypeSchema,

  // Connection info (one of)
  connection: databaseConnectionSchema.optional(),
  file: fileSourceSchema.optional(),
  api: apiSourceSchema.optional(),

  // Extracted schema
  tables: z.array(sourceTableDetailSchema),
  relationships: z.array(sourceRelationshipSchema).default([]),

  // Introspection metadata
  introspectionStatus: introspectionStatusSchema.default("pending"),
  introspectedAt: z.string().datetime().optional(),
  introspectionDurationMs: z.number().int().optional(),
  introspectionError: z.string().optional(),

  // Metrics
  totalTables: z.number().int().default(0),
  totalColumns: z.number().int().default(0),
  totalRows: z.number().int().default(0),
});

export type SourceSchema = z.infer<typeof sourceSchemaSchema>;

// ============================================================================
// Introspection Request
// ============================================================================

export const introspectionRequestSchema = z.object({
  tenantId: z.string().uuid(),
  migrationStateId: z.string().uuid(),
  sourceType: sourceConnectorTypeSchema,

  // Connection details
  connection: databaseConnectionSchema.optional(),
  file: fileSourceSchema.optional(),
  api: apiSourceSchema.optional(),

  // Options
  options: z
    .object({
      tables: z.array(z.string()).optional(), // Specific tables, or all
      sampleSize: z.number().int().default(100), // Rows to sample per column
      includeStatistics: z.boolean().default(true),
      inferRelationships: z.boolean().default(true),
    })
    .optional(),
});

export type IntrospectionRequest = z.infer<typeof introspectionRequestSchema>;

// ============================================================================
// Introspection Result
// ============================================================================

export const introspectionResultSchema = z.object({
  success: z.boolean(),
  schema: sourceSchemaSchema.optional(),
  error: z.string().optional(),
  warnings: z.array(z.string()).default([]),
});

export type IntrospectionResult = z.infer<typeof introspectionResultSchema>;
