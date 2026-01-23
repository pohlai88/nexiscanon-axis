/**
 * Theme Registry (B10)
 *
 * Registry of theme tokens and configuration for @workspace/design-system.
 * Based on Tailwind CSS v4 with oklch color space.
 *
 * Source: @workspace/design-system/src/theme.css
 */

import { z } from "zod";

// ============================================================================
// Color Token Schema
// ============================================================================

/**
 * oklch color format: oklch(L C H) or oklch(L C H / A)
 * - L: Lightness (0-1)
 * - C: Chroma (0-0.4+)
 * - H: Hue (0-360)
 * - A: Alpha (optional, 0-1 or percentage)
 */
export const oklchColorSchema = z
  .string()
  .regex(/^oklch\([\d.]+ [\d.]+ [\d.]+(?: \/ [\d.]+%?)?\)$/)
  .describe("oklch color value");

// ============================================================================
// Semantic Color Tokens
// ============================================================================

export const SEMANTIC_COLOR_TOKEN = [
  // Core
  "background",
  "foreground",
  // Card
  "card",
  "card-foreground",
  // Popover
  "popover",
  "popover-foreground",
  // Primary
  "primary",
  "primary-foreground",
  // Secondary
  "secondary",
  "secondary-foreground",
  // Muted
  "muted",
  "muted-foreground",
  // Accent
  "accent",
  "accent-foreground",
  // Destructive
  "destructive",
  "destructive-foreground",
  // Border/Input/Ring
  "border",
  "input",
  "ring",
  // Chart
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
  // Sidebar
  "sidebar",
  "sidebar-foreground",
  "sidebar-primary",
  "sidebar-primary-foreground",
  "sidebar-accent",
  "sidebar-accent-foreground",
  "sidebar-border",
  "sidebar-ring",
  // Surface
  "surface",
  "surface-foreground",
] as const;

export type SemanticColorToken = (typeof SEMANTIC_COLOR_TOKEN)[number];

// ============================================================================
// Theme Preset Schema
// ============================================================================

export const themePresetSchema = z.object({
  $schema: z.literal("axis://theme/v1").default("axis://theme/v1"),

  // Identity
  name: z.string().describe("Theme preset name"),
  slug: z.string().describe("URL-safe identifier"),
  description: z.string().optional(),

  // Base color
  baseColor: z
    .enum(["neutral", "slate", "zinc", "stone", "gray"])
    .default("neutral"),

  // Radius
  radius: z.number().default(0.625).describe("Base radius in rem"),

  // Light mode colors
  light: z.record(z.string(), z.string()).describe("Light mode color tokens"),

  // Dark mode colors
  dark: z.record(z.string(), z.string()).describe("Dark mode color tokens"),
});

export type ThemePreset = z.infer<typeof themePresetSchema>;

// ============================================================================
// Default Theme (Neutral)
// ============================================================================

export const DEFAULT_THEME: ThemePreset = {
  $schema: "axis://theme/v1",
  name: "Neutral",
  slug: "neutral",
  description: "Clean, professional neutral theme with oklch colors",
  baseColor: "neutral",
  radius: 0.625,
  light: {
    background: "oklch(1 0 0)",
    foreground: "oklch(0.145 0 0)",
    card: "oklch(1 0 0)",
    "card-foreground": "oklch(0.145 0 0)",
    popover: "oklch(1 0 0)",
    "popover-foreground": "oklch(0.145 0 0)",
    primary: "oklch(0.205 0 0)",
    "primary-foreground": "oklch(0.985 0 0)",
    secondary: "oklch(0.97 0 0)",
    "secondary-foreground": "oklch(0.205 0 0)",
    muted: "oklch(0.97 0 0)",
    "muted-foreground": "oklch(0.556 0 0)",
    accent: "oklch(0.97 0 0)",
    "accent-foreground": "oklch(0.205 0 0)",
    destructive: "oklch(0.577 0.245 27.325)",
    "destructive-foreground": "oklch(0.97 0.01 17)",
    border: "oklch(0.922 0 0)",
    input: "oklch(0.922 0 0)",
    ring: "oklch(0.708 0 0)",
    "chart-1": "oklch(0.646 0.222 41.116)",
    "chart-2": "oklch(0.6 0.118 184.704)",
    "chart-3": "oklch(0.398 0.07 227.334)",
    "chart-4": "oklch(0.828 0.189 84.429)",
    "chart-5": "oklch(0.769 0.188 70.08)",
    sidebar: "oklch(0.985 0 0)",
    "sidebar-foreground": "oklch(0.145 0 0)",
    "sidebar-primary": "oklch(0.205 0 0)",
    "sidebar-primary-foreground": "oklch(0.985 0 0)",
    "sidebar-accent": "oklch(0.97 0 0)",
    "sidebar-accent-foreground": "oklch(0.205 0 0)",
    "sidebar-border": "oklch(0.922 0 0)",
    "sidebar-ring": "oklch(0.708 0 0)",
    surface: "oklch(0.98 0 0)",
    "surface-foreground": "oklch(0.145 0 0)",
  },
  dark: {
    background: "oklch(0.145 0 0)",
    foreground: "oklch(0.985 0 0)",
    card: "oklch(0.205 0 0)",
    "card-foreground": "oklch(0.985 0 0)",
    popover: "oklch(0.269 0 0)",
    "popover-foreground": "oklch(0.985 0 0)",
    primary: "oklch(0.922 0 0)",
    "primary-foreground": "oklch(0.205 0 0)",
    secondary: "oklch(0.269 0 0)",
    "secondary-foreground": "oklch(0.985 0 0)",
    muted: "oklch(0.269 0 0)",
    "muted-foreground": "oklch(0.708 0 0)",
    accent: "oklch(0.371 0 0)",
    "accent-foreground": "oklch(0.985 0 0)",
    destructive: "oklch(0.704 0.191 22.216)",
    "destructive-foreground": "oklch(0.58 0.22 27)",
    border: "oklch(1 0 0 / 10%)",
    input: "oklch(1 0 0 / 15%)",
    ring: "oklch(0.556 0 0)",
    "chart-1": "oklch(0.488 0.243 264.376)",
    "chart-2": "oklch(0.696 0.17 162.48)",
    "chart-3": "oklch(0.769 0.188 70.08)",
    "chart-4": "oklch(0.627 0.265 303.9)",
    "chart-5": "oklch(0.645 0.246 16.439)",
    sidebar: "oklch(0.205 0 0)",
    "sidebar-foreground": "oklch(0.985 0 0)",
    "sidebar-primary": "oklch(0.488 0.243 264.376)",
    "sidebar-primary-foreground": "oklch(0.985 0 0)",
    "sidebar-accent": "oklch(0.269 0 0)",
    "sidebar-accent-foreground": "oklch(0.985 0 0)",
    "sidebar-border": "oklch(1 0 0 / 10%)",
    "sidebar-ring": "oklch(0.439 0 0)",
    surface: "oklch(0.2 0 0)",
    "surface-foreground": "oklch(0.708 0 0)",
  },
};

// ============================================================================
// Tailwind v4 Custom Variants
// ============================================================================

export const TAILWIND_CUSTOM_VARIANT = [
  // Theme
  "dark",
  // Radix state variants
  "data-open",
  "data-closed",
  "data-checked",
  "data-unchecked",
  "data-selected",
  "data-disabled",
  "data-active",
  "data-horizontal",
  "data-vertical",
] as const;

export type TailwindCustomVariant = (typeof TAILWIND_CUSTOM_VARIANT)[number];

// ============================================================================
// CSS Variable Generation
// ============================================================================

/**
 * Generate CSS variables from theme preset
 */
export function generateCSSVariables(
  theme: ThemePreset,
  mode: "light" | "dark"
): string {
  const colors = mode === "light" ? theme.light : theme.dark;
  const lines: string[] = [];

  lines.push(`  --radius: ${theme.radius}rem;`);

  for (const [key, value] of Object.entries(colors)) {
    lines.push(`  --${key}: ${value};`);
  }

  return lines.join("\n");
}

/**
 * Generate full CSS for a theme preset
 */
export function generateThemeCSS(theme: ThemePreset): string {
  return `/* Theme: ${theme.name} */
:root {
${generateCSSVariables(theme, "light")}
}

.dark {
${generateCSSVariables(theme, "dark")}
}
`;
}
