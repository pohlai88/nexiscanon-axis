import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/**
 * Tenant type values.
 * - organization: Top-level org (can have teams)
 * - team: Sub-group within an organization
 * - personal: Individual workspace (one per user)
 */
export const TENANT_TYPE = ["organization", "team", "personal"] as const;
export type TenantType = (typeof TENANT_TYPE)[number];

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
 * Each tenant represents an organization, team, or personal workspace.
 *
 * Hierarchy:
 * - organization: Top-level org (parent_id = null)
 * - team: Sub-group within org (parent_id = org.id)
 * - personal: Individual workspace (parent_id = null, one per user)
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

  /** Tenant type (organization, team, personal) */
  type: varchar("type", { length: 20 }).notNull().default("organization").$type<TenantType>(),

  /** Parent tenant ID (for teams within orgs) */
  parentId: uuid("parent_id"),

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

/**
 * Tenant relations.
 * - parent: Parent org (for teams)
 * - children: Child teams (for orgs)
 */
export const tenantsRelations = relations(tenants, ({ one, many }) => ({
  parent: one(tenants, {
    fields: [tenants.parentId],
    references: [tenants.id],
    relationName: "tenant_hierarchy",
  }),
  children: many(tenants, {
    relationName: "tenant_hierarchy",
  }),
}));

/**
 * TypeScript types inferred from schema.
 */
export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;
