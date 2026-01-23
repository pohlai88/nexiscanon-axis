/**
 * Posting Idempotency Keys (B01 §6.3)
 *
 * Prevents duplicate posting operations.
 * On duplicate key, returns existing result instead of re-posting.
 */

import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  primaryKey,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenant";
import { documents } from "./document";

/**
 * Posting idempotency keys table.
 *
 * Used to prevent duplicate POST or REVERSE operations.
 * The same (tenantId, idempotencyKey) combination always returns
 * the same result, even if called multiple times.
 */
export const postingIdempotencyKeys = pgTable(
  "posting_idempotency_keys",
  {
    /** Tenant isolation (RLS enforced) */
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    /** Client-provided idempotency key */
    idempotencyKey: varchar("idempotency_key", { length: 255 }).notNull(),

    /** Document that was created/modified by this operation */
    documentId: uuid("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),

    /** When the operation was performed */
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    // Composite primary key
    primaryKey({ columns: [table.tenantId, table.idempotencyKey] }),
  ]
);

/**
 * TypeScript types inferred from schema.
 */
export type PostingIdempotencyKey = typeof postingIdempotencyKeys.$inferSelect;
export type NewPostingIdempotencyKey = typeof postingIdempotencyKeys.$inferInsert;
