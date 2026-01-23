/**
 * Persona Configuration Schema (B10)
 *
 * Tenant-level UX personalization.
 */

import { z } from "zod";
import {
  PERSONA_TYPE,
  UX_COMPLEXITY,
  NAVIGATION_STYLE,
  FORM_DENSITY,
  THEME_MODE,
} from "./constants";

// ============================================================================
// Persona Configuration Schema
// ============================================================================

export const personaConfigSchema = z.object({
  tenantId: z.string().uuid(),

  // Persona selection
  persona: z.enum(PERSONA_TYPE).default("quorum"),

  // Feature exposure
  complexity: z.enum(UX_COMPLEXITY).default("simple"),

  // Navigation
  navigationStyle: z.enum(NAVIGATION_STYLE).default("guided"),
  showBreadcrumbs: z.boolean().default(true),
  showQuickActions: z.boolean().default(true),

  // Forms
  formDensity: z.enum(FORM_DENSITY).default("comfortable"),
  showOptionalFields: z.boolean().default(false),
  inlineValidation: z.boolean().default(true),
  autosaveEnabled: z.boolean().default(true),

  // Help
  showContextualHelp: z.boolean().default(true),
  showTooltips: z.boolean().default(true),
  showGuidedTours: z.boolean().default(true),

  // Theming
  themeMode: z.enum(THEME_MODE).default("system"),
  accentColor: z.string().max(20).optional(),

  // Branding
  logoUrl: z.string().url().optional(),
  faviconUrl: z.string().url().optional(),
  brandName: z.string().max(100).optional(),

  // Locale
  defaultLocale: z.string().max(10).default("en-US"),
  defaultTimezone: z.string().max(50).default("UTC"),
  defaultCurrency: z.string().length(3).default("USD"),
  dateFormat: z.string().max(20).default("YYYY-MM-DD"),
  numberFormat: z.string().max(20).default("1,234.56"),

  updatedAt: z.string().datetime(),
  updatedBy: z.string().uuid(),
});

export type PersonaConfig = z.infer<typeof personaConfigSchema>;
