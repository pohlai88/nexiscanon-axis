import {
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenant";
import { users } from "./user";

/**
 * API Keys table.
 * For programmatic access to tenant resources.
 */
export const apiKeys = pgTable("api_keys", {
  id: uuid("id").primaryKey().defaultRandom(),

  /** Tenant this key belongs to */
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),

  /** User who created this key */
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  /** Display name for the key */
  name: varchar("name", { length: 255 }).notNull(),

  /** Hashed key (never store plaintext) */
  keyHash: varchar("key_hash", { length: 255 }).notNull().unique(),

  /** First 10 chars for display (e.g., "nxc_a1b2c3...") */
  keyPrefix: varchar("key_prefix", { length: 10 }).notNull(),

  /**
   * Scopes/permissions as TEXT[] array.
   * Stored as text but typed as string[] for application use.
   */
  scopes: text("scopes").array().default([]),

  /** Last usage timestamp */
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }),

  /** Expiration (null = never expires) */
  expiresAt: timestamp("expires_at", { withTimezone: true }),

  /** Timestamps */
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * TypeScript types.
 */
export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;
