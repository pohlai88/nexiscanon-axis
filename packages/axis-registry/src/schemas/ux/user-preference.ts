/**
 * User Preference Schema (B10)
 *
 * User-level UX preferences.
 */

import { z } from "zod";
import { THEME_MODE, FORM_DENSITY } from "./constants";

// ============================================================================
// User Preference Schema
// ============================================================================

export const userPreferenceSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  tenantId: z.uuid(),

  // Theme
  themeMode: z.enum(THEME_MODE).default("system"),

  // Display
  formDensity: z.enum(FORM_DENSITY).default("comfortable"),
  sidebarCollapsed: z.boolean().default(false),
  showTooltips: z.boolean().default(true),

  // Locale overrides
  locale: z.string().max(10).optional(),
  timezone: z.string().max(50).optional(),
  dateFormat: z.string().max(20).optional(),
  numberFormat: z.string().max(20).optional(),

  // Keyboard shortcuts enabled
  keyboardShortcutsEnabled: z.boolean().default(true),

  // Notifications
  emailNotifications: z.boolean().default(true),
  pushNotifications: z.boolean().default(true),
  inAppNotifications: z.boolean().default(true),

  // Recent items
  recentItemsCount: z.number().int().min(5).max(50).default(10),

  // Favorites (stored as JSON array of item references)
  favorites: z.array(z.object({
    type: z.string().max(50),
    id: z.uuid(),
    label: z.string().max(255),
    href: z.string().max(500),
  })).default([]),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type UserPreference = z.infer<typeof userPreferenceSchema>;
