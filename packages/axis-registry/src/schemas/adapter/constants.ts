/**
 * Column Adapter Constants (C02)
 *
 * "The Machine understands columns, not ERPs."
 */

import { z } from "zod";

// ============================================================================
// Source Types
// ============================================================================

export const SOURCE_CONNECTOR_TYPE = [
  "postgresql",
  "mysql",
  "sqlserver",
  "oracle",
  "sqlite",
  "mongodb",
  "csv",
  "excel",
  "json",
  "api",
] as const;

export const sourceConnectorTypeSchema = z.enum(SOURCE_CONNECTOR_TYPE);
export type SourceConnectorType = z.infer<typeof sourceConnectorTypeSchema>;

// ============================================================================
// Semantic Categories
// ============================================================================

export const SEMANTIC_CATEGORY = [
  // Party-related
  "party.name",
  "party.legal_name",
  "party.display_name",
  "party.email",
  "party.phone",
  "party.tax_id",
  "party.address",
  "party.city",
  "party.country",
  "party.is_customer",
  "party.is_supplier",

  // Item-related
  "item.code",
  "item.name",
  "item.description",
  "item.unit_price",
  "item.cost",
  "item.uom",
  "item.category",
  "item.type",

  // Account-related
  "account.code",
  "account.name",
  "account.type",
  "account.parent",
  "account.balance",

  // Transaction-related
  "transaction.date",
  "transaction.number",
  "transaction.reference",
  "transaction.amount",
  "transaction.quantity",
  "transaction.unit_price",
  "transaction.line_total",
  "transaction.tax_amount",
  "transaction.discount",
  "transaction.total",
  "transaction.currency",
  "transaction.status",

  // System-related
  "system.id",
  "system.created_at",
  "system.updated_at",
  "system.created_by",

  // Unknown
  "unknown",
] as const;

export const semanticCategorySchema = z.enum(SEMANTIC_CATEGORY);
export type SemanticCategory = z.infer<typeof semanticCategorySchema>;

// ============================================================================
// Table Domain Classification
// ============================================================================

export const TABLE_DOMAIN = [
  "party",
  "item",
  "account",
  "sales",
  "purchase",
  "inventory",
  "journal",
  "system",
  "unknown",
] as const;

export const tableDomainSchema = z.enum(TABLE_DOMAIN);
export type TableDomain = z.infer<typeof tableDomainSchema>;

// ============================================================================
// Relationship Types
// ============================================================================

export const RELATIONSHIP_TYPE = [
  "one_to_one",
  "one_to_many",
  "many_to_many",
] as const;

export const relationshipTypeSchema = z.enum(RELATIONSHIP_TYPE);
export type RelationshipType = z.infer<typeof relationshipTypeSchema>;

// ============================================================================
// Transform Functions
// ============================================================================

export const TRANSFORM_FUNCTION = [
  // String transforms
  "trim",
  "uppercase",
  "lowercase",
  "titlecase",

  // Date transforms
  "parse_date",
  "parse_datetime",

  // Number transforms
  "parse_decimal",
  "parse_int",

  // Boolean transforms
  "parse_bool",
  "yes_no_to_bool",

  // Normalization
  "normalize_phone",
  "normalize_email",
  "normalize_country",

  // Lookup transforms
  "lookup_account_type",
  "lookup_item_type",
  "lookup_party_type",

  // Composite
  "chain",
] as const;

export const transformFunctionSchema = z.enum(TRANSFORM_FUNCTION);
export type TransformFunction = z.infer<typeof transformFunctionSchema>;

// ============================================================================
// Introspection Status
// ============================================================================

export const INTROSPECTION_STATUS = [
  "pending",
  "in_progress",
  "completed",
  "failed",
] as const;

export const introspectionStatusSchema = z.enum(INTROSPECTION_STATUS);
export type IntrospectionStatus = z.infer<typeof introspectionStatusSchema>;

// ============================================================================
// Analysis Status
// ============================================================================

export const ANALYSIS_STATUS = [
  "pending",
  "analyzing",
  "completed",
  "needs_review",
  "failed",
] as const;

export const analysisStatusSchema = z.enum(ANALYSIS_STATUS);
export type AnalysisStatus = z.infer<typeof analysisStatusSchema>;
