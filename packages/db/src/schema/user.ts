import {
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  boolean,
  jsonb,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "./tenant";

/**
 * User role values (matches SQL CHECK constraint).
 */
export const USER_ROLE = ["owner", "admin", "member", "viewer"] as const;
export type UserRole = (typeof USER_ROLE)[number];

/**
 * User settings stored as JSONB.
 */
export interface UserSettings {
  theme?: "light" | "dark" | "system";
  notifications?: boolean;
  [key: string]: unknown;
}

/**
 * Users table.
 * Users can belong to multiple tenants.
 */
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),

  /** Email (unique globally) */
  email: varchar("email", { length: 255 }).notNull().unique(),

  /** Display name */
  name: varchar("name", { length: 255 }),

  /** Avatar URL */
  avatarUrl: text("avatar_url"),

  /** Email verified */
  emailVerified: boolean("email_verified").notNull().default(false),

  /** Neon Auth subject ID (external identity) */
  authSubjectId: varchar("auth_subject_id", { length: 255 }).unique(),

  /** User settings as JSONB */
  settings: jsonb("settings").$type<UserSettings>().default({}),

  /** Timestamps */
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * Tenant-User membership (many-to-many with role).
 * This is the core multi-tenancy junction table.
 */
export const tenantUsers = pgTable(
  "tenant_users",
  {
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    /** User's role in this tenant (owner, admin, member, viewer) */
    role: varchar("role", { length: 20 }).notNull().default("member").$type<UserRole>(),

    /** Invitation accepted */
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),

    /** Timestamps */
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.tenantId, table.userId] }),
  ]
);

/**
 * Invitations table.
 * Pending invitations for users to join tenants.
 */
export const invitations = pgTable("invitations", {
  id: uuid("id").primaryKey().defaultRandom(),

  /** Tenant being invited to */
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),

  /** Email of invitee */
  email: varchar("email", { length: 255 }).notNull(),

  /** Role to assign on accept (owner, admin, member, viewer) */
  role: varchar("role", { length: 20 }).notNull().default("member").$type<UserRole>(),

  /** Invitation token (for email link) */
  token: varchar("token", { length: 255 }).notNull().unique(),

  /** Invited by user */
  invitedBy: uuid("invited_by").references(() => users.id),

  /** Expiration */
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),

  /** Accepted at (null if pending) */
  acceptedAt: timestamp("accepted_at", { withTimezone: true }),

  /** Timestamps */
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * User relations.
 */
export const usersRelations = relations(users, ({ many }) => ({
  tenantMemberships: many(tenantUsers),
}));

/**
 * TenantUsers relations.
 */
export const tenantUsersRelations = relations(tenantUsers, ({ one }) => ({
  tenant: one(tenants, {
    fields: [tenantUsers.tenantId],
    references: [tenants.id],
  }),
  user: one(users, {
    fields: [tenantUsers.userId],
    references: [users.id],
  }),
}));

/**
 * TypeScript types.
 */
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type TenantUser = typeof tenantUsers.$inferSelect;
export type NewTenantUser = typeof tenantUsers.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
