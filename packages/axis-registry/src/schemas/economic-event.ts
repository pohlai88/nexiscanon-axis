/**
 * Economic Event Registry Schema
 *
 * Single Source of Truth for economic events.
 * Immutable after creation - the truth layer.
 */

import { z } from "zod";
import { EVENT_TYPE, SCHEMA_URIS } from "./constants";
import { metadataFullSchema, lineageSchema } from "./common";

// ============================================================================
// Economic Event Schema
// ============================================================================

/**
 * Economic Event Registry Schema - Immutable truth record
 */
export const economicEventRegistrySchema = metadataFullSchema
  .merge(lineageSchema)
  .extend({
    // Self-describing
    $schema: z.literal(SCHEMA_URIS.economicEvent).default(SCHEMA_URIS.economicEvent),

    // Discriminator
    entityType: z.literal("economic_event"),

    // Event-specific fields
    documentId: z.string().uuid(), // Parent document
    eventType: z.enum(EVENT_TYPE),
    description: z.string().min(1).max(500),
    eventDate: z.string().datetime(),

    // Monetary value
    amount: z.string().regex(/^\d+(\.\d{1,4})?$/).optional(),
    currency: z.string().length(3).default("USD"),

    // Entity reference
    entityId: z.string().uuid().optional(),

    // Business data
    data: z.record(z.string(), z.unknown()),

    // Reversal tracking
    isReversal: z.boolean().default(false),
  });

/**
 * Economic Event Insert Schema
 */
export const economicEventInsertSchema = economicEventRegistrySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  version: true,
});

// ============================================================================
// Drizzle Column Mapping
// ============================================================================

export const economicEventDrizzleMapping = {
  tableName: "economic_events",
  columns: {
    id: { type: "uuid", primaryKey: true, default: "gen_random_uuid()" },
    tenantId: { type: "uuid", notNull: true, references: "tenants.id" },
    documentId: { type: "uuid", notNull: true, references: "documents.id" },
    eventType: { type: "varchar(50)", notNull: true },
    description: { type: "varchar(500)", notNull: true },
    eventDate: { type: "timestamptz", notNull: true },
    amount: { type: "numeric(19,4)", notNull: false },
    currency: { type: "varchar(3)", notNull: true, default: "'USD'" },
    entityId: { type: "uuid", notNull: false },
    data: { type: "jsonb", notNull: true },
    context6w1h: { type: "jsonb", notNull: true },
    dangerZone: { type: "jsonb", notNull: false },
    isReversal: { type: "boolean", notNull: true, default: "false" },
    reversalOf: { type: "uuid", notNull: false },
    reversedBy: { type: "uuid", notNull: false },
    createdBy: { type: "uuid", notNull: true, references: "users.id" },
    createdAt: { type: "timestamptz", notNull: true, default: "now()" },
    updatedAt: { type: "timestamptz", notNull: true, default: "now()" },
  },
  indexes: [
    { columns: ["tenantId"], name: "economic_events_tenant_id_idx" },
    { columns: ["documentId"], name: "economic_events_document_id_idx" },
    { columns: ["eventDate"], name: "economic_events_date_idx" },
  ],
  immutable: true, // Trigger: prevent UPDATE/DELETE
} as const;
