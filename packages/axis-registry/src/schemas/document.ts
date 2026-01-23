/**
 * Document Registry Schema - PostingSpineEnvelope
 *
 * Single Source of Truth for document entity.
 * Drizzle schema and validation are derived from this.
 */

import { z } from "zod";
import {
  DOCUMENT_STATE,
  DOCUMENT_TYPE,
  SCHEMA_URIS,
} from "./constants";
import {
  metadataFullSchema,
  lineageSchema,
} from "./common";

// ============================================================================
// Document Schema
// ============================================================================

/**
 * Document Registry Schema - The canonical document definition
 *
 * This is the SINGLE SOURCE OF TRUTH.
 * - TypeScript types: Inferred via z.infer<>
 * - Drizzle schema: Generated from this
 * - API validation: Re-exported from this
 */
export const documentRegistrySchema = metadataFullSchema
  .merge(lineageSchema)
  .extend({
    // Self-describing
    $schema: z.literal(SCHEMA_URIS.document).default(SCHEMA_URIS.document),

    // Discriminator
    entityType: z.literal("document"),

    // Document-specific fields
    documentType: z.enum(DOCUMENT_TYPE),
    state: z.enum(DOCUMENT_STATE).default("draft"),
    documentNumber: z.string().min(1).max(50),
    documentDate: z.string().datetime(),

    // Optional entity reference (customer, vendor, etc.)
    entityId: z.string().uuid().optional(),

    // Business data (line items, totals, etc.)
    data: z.record(z.string(), z.unknown()),

    // Posting metadata
    postedAt: z.string().datetime().optional(),
    postedBy: z.string().uuid().optional(),
  });

/**
 * Document Insert Schema - For creating new documents
 * Omits auto-generated fields
 */
export const documentInsertSchema = documentRegistrySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  version: true,
});

/**
 * Document Update Schema - For updating documents
 * All fields optional except id
 */
export const documentUpdateSchema = documentRegistrySchema
  .partial()
  .required({ id: true, tenantId: true });

/**
 * Document State Transition Schema - For state machine
 */
export const documentStateTransitionSchema = z.object({
  documentId: z.string().uuid(),
  fromState: z.enum(DOCUMENT_STATE),
  toState: z.enum(DOCUMENT_STATE),
  context6w1h: z.lazy(() =>
    z.object({}).passthrough() // Deferred to avoid circular
  ),
});

// ============================================================================
// Drizzle Column Mapping (for codegen)
// ============================================================================

/**
 * Column definitions for Drizzle codegen
 * Maps Zod types to Drizzle column types
 */
export const documentDrizzleMapping = {
  tableName: "documents",
  columns: {
    id: { type: "uuid", primaryKey: true, default: "gen_random_uuid()" },
    tenantId: { type: "uuid", notNull: true, references: "tenants.id" },
    documentType: { type: "varchar(50)", notNull: true },
    state: { type: "varchar(20)", notNull: true, default: "'draft'" },
    documentNumber: { type: "varchar(50)", notNull: true },
    documentDate: { type: "timestamptz", notNull: true },
    entityId: { type: "uuid", notNull: false },
    version: { type: "integer", notNull: true, default: "1" },
    data: { type: "jsonb", notNull: true },
    context6w1h: { type: "jsonb", notNull: true },
    dangerZone: { type: "jsonb", notNull: false },
    createdBy: { type: "uuid", notNull: true, references: "users.id" },
    modifiedBy: { type: "uuid", notNull: true, references: "users.id" },
    createdAt: { type: "timestamptz", notNull: true, default: "now()" },
    updatedAt: { type: "timestamptz", notNull: true, default: "now()" },
    postedAt: { type: "timestamptz", notNull: false },
    postedBy: { type: "uuid", notNull: false, references: "users.id" },
    reversalOf: { type: "uuid", notNull: false },
    reversedBy: { type: "uuid", notNull: false },
  },
  indexes: [
    { columns: ["tenantId"], name: "documents_tenant_id_idx" },
    { columns: ["tenantId", "documentNumber"], unique: true },
    { columns: ["tenantId", "state"], name: "documents_tenant_state_idx" },
    { columns: ["documentDate"], name: "documents_date_idx" },
  ],
} as const;
