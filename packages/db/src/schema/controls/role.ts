/**
 * Role Tables (B08)
 *
 * Named permission bundles.
 */

import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  integer,
  jsonb,
  boolean,
  text,
  index,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";
import { ctrlPermissions } from "./permission";
import { type RoleType, type PermissionScope } from "@axis/registry/schemas";

// ============================================================================
// Roles Table
// ============================================================================

export const ctrlRoles = pgTable(
  "ctrl_roles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Identity
    code: varchar("code", { length: 50 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),

    // Type
    roleType: varchar("role_type", { length: 20 })
      .notNull()
      .default("custom")
      .$type<RoleType>(),

    // Hierarchy (same domain, FK allowed)
    parentRoleId: uuid("parent_role_id"),
    level: integer("level").notNull().default(0),

    // Status
    isActive: boolean("is_active").notNull().default(true),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdBy: uuid("created_by").notNull(),
  },
  (table) => [
    uniqueIndex("uq_ctrl_roles_code").on(table.tenantId, table.code),
    index("idx_ctrl_roles_tenant").on(table.tenantId),
    index("idx_ctrl_roles_type").on(table.tenantId, table.roleType),
    index("idx_ctrl_roles_parent").on(table.tenantId, table.parentRoleId),
  ]
);

export const ctrlRolesRelations = relations(ctrlRoles, ({ one }) => ({
  tenant: one(tenants, {
    fields: [ctrlRoles.tenantId],
    references: [tenants.id],
  }),
  parentRole: one(ctrlRoles, {
    fields: [ctrlRoles.parentRoleId],
    references: [ctrlRoles.id],
  }),
}));

export type CtrlRoleRow = typeof ctrlRoles.$inferSelect;
export type NewCtrlRoleRow = typeof ctrlRoles.$inferInsert;

// ============================================================================
// Role Permissions Table
// ============================================================================

export const ctrlRolePermissions = pgTable(
  "ctrl_role_permissions",
  {
    roleId: uuid("role_id")
      .notNull()
      .references(() => ctrlRoles.id, { onDelete: "cascade" }),
    permissionId: uuid("permission_id")
      .notNull()
      .references(() => ctrlPermissions.id, { onDelete: "cascade" }),

    // Override default scope
    scope: varchar("scope", { length: 20 }).$type<PermissionScope>(),

    // Conditions (JSON rules)
    conditions: jsonb("conditions").$type<Record<string, unknown>>(),

    grantedAt: timestamp("granted_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    grantedBy: uuid("granted_by").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.roleId, table.permissionId] }),
    index("idx_ctrl_role_perms_role").on(table.roleId),
    index("idx_ctrl_role_perms_perm").on(table.permissionId),
  ]
);

export const ctrlRolePermissionsRelations = relations(
  ctrlRolePermissions,
  ({ one }) => ({
    role: one(ctrlRoles, {
      fields: [ctrlRolePermissions.roleId],
      references: [ctrlRoles.id],
    }),
    permission: one(ctrlPermissions, {
      fields: [ctrlRolePermissions.permissionId],
      references: [ctrlPermissions.id],
    }),
  })
);

export type CtrlRolePermissionRow = typeof ctrlRolePermissions.$inferSelect;
export type NewCtrlRolePermissionRow = typeof ctrlRolePermissions.$inferInsert;

// ============================================================================
// User Roles Table
// ============================================================================

export const ctrlUserRoles = pgTable(
  "ctrl_user_roles",
  {
    userId: uuid("user_id").notNull(),
    roleId: uuid("role_id")
      .notNull()
      .references(() => ctrlRoles.id, { onDelete: "cascade" }),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Effective period
    effectiveFrom: timestamp("effective_from", { withTimezone: true }).notNull(),
    effectiveTo: timestamp("effective_to", { withTimezone: true }),

    assignedAt: timestamp("assigned_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    assignedBy: uuid("assigned_by").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.roleId, table.tenantId] }),
    index("idx_ctrl_user_roles_user").on(table.tenantId, table.userId),
    index("idx_ctrl_user_roles_role").on(table.tenantId, table.roleId),
    index("idx_ctrl_user_roles_effective").on(
      table.tenantId,
      table.userId,
      table.effectiveFrom,
      table.effectiveTo
    ),
  ]
);

export const ctrlUserRolesRelations = relations(ctrlUserRoles, ({ one }) => ({
  role: one(ctrlRoles, {
    fields: [ctrlUserRoles.roleId],
    references: [ctrlRoles.id],
  }),
  tenant: one(tenants, {
    fields: [ctrlUserRoles.tenantId],
    references: [tenants.id],
  }),
}));

export type CtrlUserRoleRow = typeof ctrlUserRoles.$inferSelect;
export type NewCtrlUserRoleRow = typeof ctrlUserRoles.$inferInsert;
