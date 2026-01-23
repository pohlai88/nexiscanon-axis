/**
 * Domain Outbox Table (B02 — Bounded Contexts)
 *
 * Implements the transactional outbox pattern for reliable
 * cross-domain event publishing.
 *
 * Pattern: Write event to outbox in same transaction as domain write,
 * then process asynchronously.
 */

import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  jsonb,
  integer,
  text,
  index,
  bigserial,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenant";

/**
 * Event status for outbox processing
 */
export const OUTBOX_STATUS = [
  "pending",
  "processing",
  "delivered",
  "failed",
] as const;
export type OutboxStatus = (typeof OUTBOX_STATUS)[number];

/**
 * Domain outbox table.
 *
 * Events are written here within the same transaction as the domain write,
 * then processed asynchronously by the outbox processor.
 */
export const domainOutbox = pgTable(
  "domain_outbox",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    /** Tenant isolation */
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Event metadata
    eventType: varchar("event_type", { length: 100 }).notNull(),
    eventId: uuid("event_id").notNull().unique(),
    correlationId: uuid("correlation_id").notNull(),
    causationId: uuid("causation_id"),

    // Source identification
    sourceDomain: varchar("source_domain", { length: 50 }).notNull(),
    sourceAggregateId: uuid("source_aggregate_id").notNull(),
    sourceAggregateType: varchar("source_aggregate_type", { length: 50 }).notNull(),

    // Event payload (full event-carried state)
    payload: jsonb("payload").notNull().$type<Record<string, unknown>>(),

    // Processing state
    status: varchar("status", { length: 20 })
      .notNull()
      .default("pending")
      .$type<OutboxStatus>(),
    attempts: integer("attempts").notNull().default(0),
    lastError: text("last_error"),

    // Timestamps
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    processedAt: timestamp("processed_at", { withTimezone: true }),

    // Ordering for reliable processing
    sequenceNumber: bigserial("sequence_number", { mode: "number" }).notNull(),
  },
  (table) => [
    // Index for efficient polling of pending events
    index("idx_outbox_pending").on(
      table.tenantId,
      table.status,
      table.sequenceNumber
    ),
    // Index for correlation lookups
    index("idx_outbox_correlation").on(table.correlationId),
    // Index for aggregate lookups
    index("idx_outbox_aggregate").on(
      table.sourceDomain,
      table.sourceAggregateType,
      table.sourceAggregateId
    ),
  ]
);

/**
 * TypeScript types inferred from schema.
 */
export type DomainOutboxEntry = typeof domainOutbox.$inferSelect;
export type NewDomainOutboxEntry = typeof domainOutbox.$inferInsert;
