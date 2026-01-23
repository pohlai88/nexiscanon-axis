/**
 * User Preference Table (B10)
 *
 * User-level UX preferences.
 */

import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  boolean,
  integer,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";
import { type ThemeMode, type FormDensity } from "@axis/registry/schemas";

// Type for favorites stored in JSONB
interface FavoriteItem {
  type: string;
  id: string;
  label: string;
  href: string;
}

export const userPreferences = pgTable(
  "ux_user_preferences",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Theme
    themeMode: varchar("theme_mode", { length: 20 })
      .notNull()
      .default("system")
      .$type<ThemeMode>(),

    // Display
    formDensity: varchar("form_density", { length: 20 })
      .notNull()
      .default("comfortable")
      .$type<FormDensity>(),
    sidebarCollapsed: boolean("sidebar_collapsed").notNull().default(false),
    showTooltips: boolean("show_tooltips").notNull().default(true),

    // Locale overrides
    locale: varchar("locale", { length: 10 }),
    timezone: varchar("timezone", { length: 50 }),
    dateFormat: varchar("date_format", { length: 20 }),
    numberFormat: varchar("number_format", { length: 20 }),

    // Keyboard shortcuts enabled
    keyboardShortcutsEnabled: boolean("keyboard_shortcuts_enabled")
      .notNull()
      .default(true),

    // Notifications
    emailNotifications: boolean("email_notifications").notNull().default(true),
    pushNotifications: boolean("push_notifications").notNull().default(true),
    inAppNotifications: boolean("in_app_notifications").notNull().default(true),

    // Recent items
    recentItemsCount: integer("recent_items_count").notNull().default(10),

    // Favorites (stored as JSON array)
    favorites: jsonb("favorites").$type<FavoriteItem[]>().default([]),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("uq_ux_user_pref_user_tenant").on(table.userId, table.tenantId),
    index("idx_ux_user_pref_tenant").on(table.tenantId),
    index("idx_ux_user_pref_user").on(table.userId),
  ]
);

export const userPreferencesRelations = relations(
  userPreferences,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [userPreferences.tenantId],
      references: [tenants.id],
    }),
  })
);

export type UserPreferenceRow = typeof userPreferences.$inferSelect;
export type NewUserPreferenceRow = typeof userPreferences.$inferInsert;
