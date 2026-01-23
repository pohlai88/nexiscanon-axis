/**
 * Migration Domain Constants (C01)
 *
 * "365 Days? No. A Few Clicks."
 */

// ============================================================================
// Migration Modes
// ============================================================================

export const MIGRATION_MODE = [
  "setup",      // Initial configuration
  "mirror",     // Read-only, legacy primary
  "parallel",   // Both active, continuous recon
  "cutover",    // AXIS primary, legacy off
  "completed",  // Migration done
] as const;

export type MigrationMode = (typeof MIGRATION_MODE)[number];

// ============================================================================
// Source System Types
// ============================================================================

export const SOURCE_SYSTEM_TYPE = [
  "quickbooks",
  "odoo",
  "zoho",
  "sap",
  "sage",
  "xero",
  "netsuite",
  "csv",
  "excel",
  "postgresql",
  "mysql",
  "sqlserver",
  "oracle",
  "mongodb",
  "custom",
] as const;

export type SourceSystemType = (typeof SOURCE_SYSTEM_TYPE)[number];

// ============================================================================
// Sync Frequency
// ============================================================================

export const SYNC_FREQUENCY = [
  "manual",
  "hourly",
  "daily",
  "real_time",
] as const;

export type SyncFrequency = (typeof SYNC_FREQUENCY)[number];

// ============================================================================
// Reconciliation Status
// ============================================================================

export const RECON_STATUS = [
  "pending",
  "matched",
  "variance",
  "skipped",
] as const;

export type ReconStatus = (typeof RECON_STATUS)[number];

// ============================================================================
// Column Semantic Types
// ============================================================================

export const COLUMN_SEMANTIC_TYPE = [
  // Identifiers
  "id_primary",
  "id_foreign",
  "id_reference",
  
  // Party-related
  "party_name",
  "party_legal_name",
  "party_tax_id",
  "party_email",
  "party_phone",
  "party_address",
  
  // Item-related
  "item_code",
  "item_name",
  "item_description",
  "item_uom",
  "item_price",
  "item_cost",
  
  // Financial
  "account_code",
  "account_name",
  "amount_debit",
  "amount_credit",
  "amount_total",
  "currency_code",
  "exchange_rate",
  
  // Dates
  "date_transaction",
  "date_due",
  "date_created",
  "date_modified",
  
  // Quantities
  "quantity",
  "unit_price",
  "discount",
  "tax_rate",
  
  // Document references
  "doc_number",
  "doc_reference",
  "doc_type",
  "doc_status",
  
  // Other
  "description",
  "notes",
  "unknown",
] as const;

export type ColumnSemanticType = (typeof COLUMN_SEMANTIC_TYPE)[number];

// ============================================================================
// Mapping Confidence Levels
// ============================================================================

export const MAPPING_CONFIDENCE = [
  "high",       // 0.85+, auto-map safe
  "medium",     // 0.60-0.84, needs review
  "low",        // 0.30-0.59, manual required
  "uncertain",  // 0.00-0.29, cannot determine
] as const;

export type MappingConfidence = (typeof MAPPING_CONFIDENCE)[number];

// ============================================================================
// Mapping Status
// ============================================================================

export const MAPPING_STATUS = [
  "auto_mapped",
  "user_confirmed",
  "user_overridden",
  "unmapped",
  "ignored",
] as const;

export type MappingStatus = (typeof MAPPING_STATUS)[number];

// ============================================================================
// Raw Zone Entity Types
// ============================================================================

export const RAW_ENTITY_TYPE = [
  "party",
  "item",
  "account",
  "transaction",
  "document",
  "journal",
  "stock_move",
  "tax_code",
  "location",
  "unknown",
] as const;

export type RawEntityType = (typeof RAW_ENTITY_TYPE)[number];

// ============================================================================
// Import Status
// ============================================================================

export const IMPORT_STATUS = [
  "pending",
  "running",
  "completed",
  "failed",
  "cancelled",
] as const;

export type ImportStatus = (typeof IMPORT_STATUS)[number];
