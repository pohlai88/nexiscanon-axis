/**
 * Persona Configuration Table (B10)
 *
 * Tenant-level UX personalization.
 */

import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";
import {
  type PersonaType,
  type UxComplexity,
  type NavigationStyle,
  type FormDensity,
  type ThemeMode,
} from "@axis/registry/schemas";

export const personaConfigs = pgTable(
  "ux_persona_configs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .unique()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Persona selection
    persona: varchar("persona", { length: 20 })
      .notNull()
      .default("quorum")
      .$type<PersonaType>(),

    // Feature exposure
    complexity: varchar("complexity", { length: 20 })
      .notNull()
      .default("simple")
      .$type<UxComplexity>(),

    // Navigation
    navigationStyle: varchar("navigation_style", { length: 20 })
      .notNull()
      .default("guided")
      .$type<NavigationStyle>(),
    showBreadcrumbs: boolean("show_breadcrumbs").notNull().default(true),
    showQuickActions: boolean("show_quick_actions").notNull().default(true),

    // Forms
    formDensity: varchar("form_density", { length: 20 })
      .notNull()
      .default("comfortable")
      .$type<FormDensity>(),
    showOptionalFields: boolean("show_optional_fields").notNull().default(false),
    inlineValidation: boolean("inline_validation").notNull().default(true),
    autosaveEnabled: boolean("autosave_enabled").notNull().default(true),

    // Help
    showContextualHelp: boolean("show_contextual_help").notNull().default(true),
    showTooltips: boolean("show_tooltips").notNull().default(true),
    showGuidedTours: boolean("show_guided_tours").notNull().default(true),

    // Theming
    themeMode: varchar("theme_mode", { length: 20 })
      .notNull()
      .default("system")
      .$type<ThemeMode>(),
    accentColor: varchar("accent_color", { length: 20 }),

    // Branding
    logoUrl: varchar("logo_url", { length: 500 }),
    faviconUrl: varchar("favicon_url", { length: 500 }),
    brandName: varchar("brand_name", { length: 100 }),

    // Locale
    defaultLocale: varchar("default_locale", { length: 10 })
      .notNull()
      .default("en-US"),
    defaultTimezone: varchar("default_timezone", { length: 50 })
      .notNull()
      .default("UTC"),
    defaultCurrency: varchar("default_currency", { length: 3 })
      .notNull()
      .default("USD"),
    dateFormat: varchar("date_format", { length: 20 })
      .notNull()
      .default("YYYY-MM-DD"),
    numberFormat: varchar("number_format", { length: 20 })
      .notNull()
      .default("1,234.56"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedBy: uuid("updated_by").notNull(),
  },
  (table) => [
    index("idx_ux_persona_tenant").on(table.tenantId),
    index("idx_ux_persona_type").on(table.persona),
  ]
);

export const personaConfigsRelations = relations(personaConfigs, ({ one }) => ({
  tenant: one(tenants, {
    fields: [personaConfigs.tenantId],
    references: [tenants.id],
  }),
}));

export type PersonaConfigRow = typeof personaConfigs.$inferSelect;
export type NewPersonaConfigRow = typeof personaConfigs.$inferInsert;
