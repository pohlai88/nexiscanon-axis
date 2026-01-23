import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  jsonb,
  numeric,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "./tenant";
import { users } from "./user";
import { documents } from "./document";

// ============================================================================
// Import from @axis/registry (Single Source of Truth)
// ============================================================================

import {
  type EventType,
  type SixW1HContext,
  type DangerZoneMetadata,
} from "@axis/registry/types";

// Re-export for consumers
export { EVENT_TYPE, type EventType } from "@axis/registry/types";

/**
 * Economic events table (The Truth Layer - A01 §4.2, B01 §2).
 * IMMUTABLE after insert.
 *
 * Key principles:
 * - One event per economic occurrence
 * - Never updated, only reversed
 * - Triggers database postings
 * - Records complete 6W1H context
 * - Captures danger zone metadata
 *
 * Example: "Sold goods to customer X for $1,000 on 2026-01-15"
 */
export const economicEvents = pgTable("economic_events", {
  id: uuid("id").primaryKey().defaultRandom(),

  /** Tenant isolation (RLS enforced) */
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),

  /** Source document that generated this event */
  documentId: uuid("document_id")
    .notNull()
    .references(() => documents.id, { onDelete: "restrict" }),

  /** Event classification */
  eventType: varchar("event_type", { length: 50 })
    .notNull()
    .$type<EventType>(),

  /** Event description (human-readable) */
  description: varchar("description", { length: 500 }).notNull(),

  /** Event date (business date) */
  eventDate: timestamp("event_date", { withTimezone: true }).notNull(),

  /** Amount (monetary value, if applicable) */
  amount: numeric("amount", { precision: 19, scale: 4 }),

  /** Currency code (ISO 4217) */
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),

  /** Reference to external entity (customer, supplier, etc.) */
  entityId: uuid("entity_id"),

  /** Business data (quantities, rates, terms, etc.) */
  data: jsonb("data").notNull().$type<Record<string, unknown>>(),

  /** 6W1H context (A01 §5 - 100-year recall) */
  context6w1h: jsonb("context_6w1h").notNull().$type<SixW1HContext>(),

  /** Danger zone metadata (Nexus Doctrine) */
  dangerZone: jsonb("danger_zone").$type<DangerZoneMetadata>(),

  /** If reversed, reference to reversal event */
  reversalId: uuid("reversal_id"),

  /** If this is a reversal, reference to original */
  reversedFromId: uuid("reversed_from_id"),

  /** Is this event a reversal? */
  isReversal: varchar("is_reversal", { length: 10 })
    .notNull()
    .default("false")
    .$type<"true" | "false">(),

  /** Created by user (immutable) */
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id),

  /** Created timestamp (immutable) */
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * Economic event relations.
 */
export const economicEventsRelations = relations(economicEvents, ({ one }) => ({
  tenant: one(tenants, {
    fields: [economicEvents.tenantId],
    references: [tenants.id],
  }),
  document: one(documents, {
    fields: [economicEvents.documentId],
    references: [documents.id],
  }),
  creator: one(users, {
    fields: [economicEvents.createdBy],
    references: [users.id],
  }),
  // Self-referential: original ↔ reversal
  reversal: one(economicEvents, {
    fields: [economicEvents.reversalId],
    references: [economicEvents.id],
    relationName: "event_reversal",
  }),
  reversedFrom: one(economicEvents, {
    fields: [economicEvents.reversedFromId],
    references: [economicEvents.id],
    relationName: "event_reversed_from",
  }),
}));

/**
 * TypeScript types inferred from schema.
 */
export type EconomicEvent = typeof economicEvents.$inferSelect;
export type NewEconomicEvent = typeof economicEvents.$inferInsert;
