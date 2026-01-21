import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  jsonb,
} from "drizzle-orm/pg-core";

/**
 * Tenant status values (matches SQL CHECK constraint).
 */
export const TENANT_STATUS = ["active", "suspended", "pending", "deleted"] as const;
export type TenantStatus = (typeof TENANT_STATUS)[number];

/**
 * Subscription plan values (matches SQL CHECK constraint).
 */
export const SUBSCRIPTION_PLAN = ["free", "starter", "professional", "enterprise"] as const;
export type SubscriptionPlan = (typeof SUBSCRIPTION_PLAN)[number];

/**
 * Tenant settings stored as JSONB.
 */
export interface TenantSettings {
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  [key: string]: unknown;
}

/**
 * Tenants table.
 * Each tenant represents an organization/workspace.
 *
 * Note: status and plan use VARCHAR with CHECK constraints in SQL,
 * represented as varchar here for compatibility.
 */
export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().defaultRandom(),

  /** URL-safe slug (used in path: /acme/dashboard) */
  slug: varchar("slug", { length: 63 }).notNull().unique(),

  /** Display name */
  name: varchar("name", { length: 255 }).notNull(),

  /** Tenant status (active, suspended, pending, deleted) */
  status: varchar("status", { length: 20 }).notNull().default("active").$type<TenantStatus>(),

  /** Subscription plan (free, starter, professional, enterprise) */
  plan: varchar("plan", { length: 20 }).notNull().default("free").$type<SubscriptionPlan>(),

  /** Settings stored as JSONB */
  settings: jsonb("settings").$type<TenantSettings>().default({}),

  /** Timestamps */
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Note: Tenant relations are defined in user.ts to avoid circular imports

/**
 * TypeScript types inferred from schema.
 */
export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;
