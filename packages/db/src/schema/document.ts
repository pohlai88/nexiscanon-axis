import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  jsonb,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "./tenant";
import { users } from "./user";

// ============================================================================
// Import from @axis/registry (Single Source of Truth)
// ============================================================================

import {
  type DocumentState,
  type DocumentType,
  type SixW1HContext,
  type DangerZoneMetadata,
} from "@axis/registry/types";

// Re-export for consumers
export {
  DOCUMENT_STATE,
  DOCUMENT_TYPE,
  type DocumentState,
  type DocumentType,
  type SixW1HContext,
  type DangerZoneMetadata,
} from "@axis/registry/types";

/**
 * Documents table (PostingSpineEnvelope base).
 * Implements state machine, 6W1H recording, and Nexus flexibility.
 *
 * Key principles:
 * - State transitions are validated (DRAFT → SUBMITTED → APPROVED → POSTED)
 * - Every state change records 6W1H context
 * - Danger zone actions are recorded, not blocked
 * - Reversals create new documents, not mutations
 */
export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),

  /** Tenant isolation (RLS enforced) */
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),

  /** Document type classification */
  documentType: varchar("document_type", { length: 50 })
    .notNull()
    .$type<DocumentType>(),

  /** Current lifecycle state */
  state: varchar("state", { length: 20 })
    .notNull()
    .default("draft")
    .$type<DocumentState>(),

  /** Human-readable document number */
  documentNumber: varchar("document_number", { length: 50 }).notNull(),

  /** Document date (business date, not system timestamp) */
  documentDate: timestamp("document_date", { withTimezone: true }).notNull(),

  /** Reference to external entity (customer, supplier, etc.) */
  entityId: uuid("entity_id"),

  /** Document version (for optimistic locking) */
  version: integer("version").notNull().default(1),

  /** Business data (line items, totals, etc.) */
  data: jsonb("data").notNull().$type<Record<string, unknown>>(),

  /** 6W1H context for current state */
  context6w1h: jsonb("context_6w1h").notNull().$type<SixW1HContext>(),

  /** Danger zone metadata (policy violations) */
  dangerZone: jsonb("danger_zone").$type<DangerZoneMetadata>(),

  /** If reversed, reference to reversal document */
  reversalId: uuid("reversal_id"),

  /** If this is a reversal, reference to original */
  reversedFromId: uuid("reversed_from_id"),

  /** Created by user */
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id),

  /** Last modified by user */
  modifiedBy: uuid("modified_by")
    .notNull()
    .references(() => users.id),

  /** Timestamps */
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),

  /** Posted timestamp (immutable once set) */
  postedAt: timestamp("posted_at", { withTimezone: true }),

  /** Posted by user (immutable once set) */
  postedBy: uuid("posted_by").references(() => users.id),
});

/**
 * Document relations.
 */
export const documentsRelations = relations(documents, ({ one }) => ({
  tenant: one(tenants, {
    fields: [documents.tenantId],
    references: [tenants.id],
  }),
  creator: one(users, {
    fields: [documents.createdBy],
    references: [users.id],
    relationName: "document_creator",
  }),
  modifier: one(users, {
    fields: [documents.modifiedBy],
    references: [users.id],
    relationName: "document_modifier",
  }),
  poster: one(users, {
    fields: [documents.postedBy],
    references: [users.id],
    relationName: "document_poster",
  }),
  // Self-referential: original ↔ reversal
  reversal: one(documents, {
    fields: [documents.reversalId],
    references: [documents.id],
    relationName: "document_reversal",
  }),
  reversedFrom: one(documents, {
    fields: [documents.reversedFromId],
    references: [documents.id],
    relationName: "document_reversed_from",
  }),
}));

/**
 * TypeScript types inferred from schema.
 */
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
