/**
 * Type exports from @axis/registry.
 *
 * This file provides backward compatibility while migrating to
 * Single Source of Truth pattern.
 *
 * MIGRATION PATH:
 * 1. Old: import { Document } from "@axis/db/schema"
 * 2. New: import type { Document } from "@axis/db/types"
 * 3. Final: import type { Document } from "@axis/registry/types"
 *
 * All types are inferred from Zod schemas in @axis/registry.
 * Never manually define types here.
 */

// Re-export all types from registry
export type {
  // Entity types
  Document,
  DocumentInsert,
  DocumentUpdate,
  EconomicEvent,
  EconomicEventInsert,
  LedgerPosting,
  LedgerPostingInsert,
  PostingBatch,
  Account,
  AccountInsert,
  AccountUpdate,

  // 6W1H types
  SixW1HContext,
  DangerZoneMetadata,
  Who,
  What,
  When,
  Where,
  Why,
  Which,
  How,

  // Metadata types
  MetadataLite,
  MetadataFull,
  Lineage,

  // Enum types
  DocumentType,
  DocumentState,
  EventType,
  PostingDirection,
  AccountType,
  DangerLevel,
  EntityType,
} from "@axis/registry/types";

// Re-export constants
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
} from "@axis/registry/types";

// Re-export schemas for validation
export {
  // 6W1H schemas
  sixW1HContextSchema,
  dangerZoneSchema,
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

  // Metadata schemas
  metadataLiteSchema,
  metadataFullSchema,
  lineageSchema,
} from "@axis/registry/schemas";

// Report types (Phase 5)
export type * from "./reports";
