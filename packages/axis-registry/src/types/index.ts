/**
 * AXIS Registry Types - Inferred from Zod schemas
 *
 * NEVER manually define types here.
 * ALL types are inferred from the Single Source of Truth (schemas).
 *
 * Pattern: z.infer<typeof schema> ensures 100% sync
 */

import { z } from "zod";
import {
  // Constants
  DOCUMENT_TYPE,
  DOCUMENT_STATE,
  EVENT_TYPE,
  POSTING_DIRECTION,
  ACCOUNT_TYPE,
  DANGER_LEVEL,
  ENTITY_TYPE,
  SCHEMA_URIS,
  SCHEMA_VERSION,
  DOCUMENT_STATE_MACHINE,

  // Common schemas
  sixW1HContextSchema,
  dangerZoneSchema,
  metadataLiteSchema,
  metadataFullSchema,
  lineageSchema,
  whoSchema,
  whatSchema,
  whenSchema,
  whereSchema,
  whySchema,
  whichSchema,
  howSchema,

  // Entity schemas
  documentRegistrySchema,
  documentInsertSchema,
  documentUpdateSchema,
  economicEventRegistrySchema,
  economicEventInsertSchema,
  ledgerPostingRegistrySchema,
  ledgerPostingInsertSchema,
  postingBatchSchema,
  accountRegistrySchema,
  accountInsertSchema,
  accountUpdateSchema,
} from "../schemas";

// ============================================================================
// Constant Types (for type-safe usage)
// ============================================================================

export type DocumentType = (typeof DOCUMENT_TYPE)[number];
export type DocumentState = (typeof DOCUMENT_STATE)[number];
export type EventType = (typeof EVENT_TYPE)[number];
export type PostingDirection = (typeof POSTING_DIRECTION)[number];
export type AccountType = (typeof ACCOUNT_TYPE)[number];
export type DangerLevel = (typeof DANGER_LEVEL)[number];
export type EntityType = (typeof ENTITY_TYPE)[number];
export type SchemaUri = (typeof SCHEMA_URIS)[keyof typeof SCHEMA_URIS];

// State machine type
export type DocumentStateMachine = typeof DOCUMENT_STATE_MACHINE;

// ============================================================================
// 6W1H Types
// ============================================================================

export type Who = z.infer<typeof whoSchema>;
export type What = z.infer<typeof whatSchema>;
export type When = z.infer<typeof whenSchema>;
export type Where = z.infer<typeof whereSchema>;
export type Why = z.infer<typeof whySchema>;
export type Which = z.infer<typeof whichSchema>;
export type How = z.infer<typeof howSchema>;
export type SixW1HContext = z.infer<typeof sixW1HContextSchema>;
export type DangerZoneMetadata = z.infer<typeof dangerZoneSchema>;

// ============================================================================
// Metadata Types
// ============================================================================

export type MetadataLite = z.infer<typeof metadataLiteSchema>;
export type MetadataFull = z.infer<typeof metadataFullSchema>;
export type Lineage = z.infer<typeof lineageSchema>;

// ============================================================================
// Entity Types (Inferred from Registry Schemas)
// ============================================================================

// Document
export type Document = z.infer<typeof documentRegistrySchema>;
export type DocumentInsert = z.infer<typeof documentInsertSchema>;
export type DocumentUpdate = z.infer<typeof documentUpdateSchema>;

// Economic Event
export type EconomicEvent = z.infer<typeof economicEventRegistrySchema>;
export type EconomicEventInsert = z.infer<typeof economicEventInsertSchema>;

// Ledger Posting
export type LedgerPosting = z.infer<typeof ledgerPostingRegistrySchema>;
export type LedgerPostingInsert = z.infer<typeof ledgerPostingInsertSchema>;
export type PostingBatch = z.infer<typeof postingBatchSchema>;

// Account
export type Account = z.infer<typeof accountRegistrySchema>;
export type AccountInsert = z.infer<typeof accountInsertSchema>;
export type AccountUpdate = z.infer<typeof accountUpdateSchema>;

// ============================================================================
// Re-export constants for convenience
// ============================================================================

export {
  DOCUMENT_TYPE,
  DOCUMENT_STATE,
  DOCUMENT_STATE_MACHINE,
  EVENT_TYPE,
  POSTING_DIRECTION,
  ACCOUNT_TYPE,
  DANGER_LEVEL,
  ENTITY_TYPE,
  SCHEMA_URIS,
  SCHEMA_VERSION,
};

// ============================================================================
// Re-export versioning utilities
// ============================================================================

export {
  // Schema URI validation
  schemaUriSchema,
  schemaUriPattern,
  extractVersion,
  extractEntityName,
  validateSchemaUri,

  // Version comparison
  compareSchemaVersions,
  needsMigration,

  // Schema validation with $schema check
  withSchemaValidation,

  // Migration helpers
  createMigrationRegistry,
  type SchemaMigration,
  type MigrationRegistry,
} from "../schemas/versioning";
