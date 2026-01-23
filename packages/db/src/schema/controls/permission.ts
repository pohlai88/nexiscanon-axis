/**
 * Permission Table (B08)
 *
 * Atomic action definitions.
 */

import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  boolean,
  text,
  index,
} from "drizzle-orm/pg-core";
import {
  type PermissionDomain,
  type PermissionAction,
  type PermissionScope,
} from "@axis/registry/schemas";

export const ctrlPermissions = pgTable(
  "ctrl_permissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    // Identity
    code: varchar("code", { length: 100 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),

    // Classification
    domain: varchar("domain", { length: 30 }).notNull().$type<PermissionDomain>(),
    resource: varchar("resource", { length: 50 }).notNull(),
    action: varchar("action", { length: 30 }).notNull().$type<PermissionAction>(),

    // Scope
    defaultScope: varchar("default_scope", { length: 20 })
      .notNull()
      .default("own")
      .$type<PermissionScope>(),

    // System flag
    isSystem: boolean("is_system").notNull().default(false),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_ctrl_permissions_domain").on(table.domain),
    index("idx_ctrl_permissions_resource").on(table.domain, table.resource),
  ]
);

export type CtrlPermissionRow = typeof ctrlPermissions.$inferSelect;
export type NewCtrlPermissionRow = typeof ctrlPermissions.$inferInsert;
