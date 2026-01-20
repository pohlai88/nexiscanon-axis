/**
 * Advanced Theme Configuration
 *
 * Multi-dimensional theming system matching shadcn/ui's "Create Project" interface.
 * Supports independent configuration of base colors, styles, accents, fonts, and menu variants.
 *
 * @see {@link https://ui.shadcn.com/create} shadcn/ui theme creator
 * @see {@link https://ui.shadcn.com/docs/theming} shadcn/ui theming documentation
 */

/* -----------------------------------------------------------------------------
 * Style (Visual density, radius, shadows)
 * -------------------------------------------------------------------------- */
export type StyleName = "vega" | "nova" | "mia" | "lyra" | "mira";

export const STYLE_NAMES: StyleName[] = ["vega", "nova", "mia", "lyra", "mira"];

export const STYLE_LABELS: Record<StyleName, string> = {
  vega: "Vega",
  nova: "Nova",
  mia: "Mia",
  lyra: "Lyra",
  mira: "Mira",
};

export const STYLE_DESCRIPTIONS: Record<StyleName, string> = {
  vega: "Default balanced style with subtle shadows",
  nova: "Sharp, minimal with zero radius",
  mia: "Soft, rounded with gentle shadows",
  lyra: "Compact, tight spacing",
  mira: "Pill-shaped, full radius with glow effects",
};

/* -----------------------------------------------------------------------------
 * Accent Color (Primary brand color overlay)
 * -------------------------------------------------------------------------- */
export type AccentName =
  | "neutral"
  | "rose"
  | "orange"
  | "amber"
  | "emerald"
  | "cyan"
  | "blue"
  | "violet"
  | "fuchsia";

export const ACCENT_NAMES: AccentName[] = [
  "neutral",
  "rose",
  "orange",
  "amber",
  "emerald",
  "cyan",
  "blue",
  "violet",
  "fuchsia",
];

export const ACCENT_LABELS: Record<AccentName, string> = {
  neutral: "Neutral",
  rose: "Rose",
  orange: "Orange",
  amber: "Amber",
  emerald: "Emerald",
  cyan: "Cyan",
  blue: "Blue",
  violet: "Violet",
  fuchsia: "Fuchsia",
};

/** Preview swatch colors for accent picker (light mode) */
export const ACCENT_SWATCHES: Record<AccentName, string> = {
  neutral: "oklch(0.45 0 0)",
  rose: "oklch(0.65 0.22 350)",
  orange: "oklch(0.70 0.18 45)",
  amber: "oklch(0.75 0.18 75)",
  emerald: "oklch(0.60 0.17 160)",
  cyan: "oklch(0.65 0.15 195)",
  blue: "oklch(0.55 0.22 260)",
  violet: "oklch(0.55 0.22 290)",
  fuchsia: "oklch(0.60 0.24 320)",
};

/* -----------------------------------------------------------------------------
 * Font (Typography system - lazy loaded)
 * -------------------------------------------------------------------------- */
export type FontName = "inter" | "noto" | "nunito" | "figtree";

export const FONT_NAMES: FontName[] = ["inter", "noto", "nunito", "figtree"];

export const FONT_LABELS: Record<FontName, string> = {
  inter: "Inter",
  noto: "Noto Sans",
  nunito: "Nunito Sans",
  figtree: "Figtree",
};

export const FONT_FAMILIES: Record<FontName, string> = {
  inter: "'Inter Variable', sans-serif",
  noto: "'Noto Sans Variable', sans-serif",
  nunito: "'Nunito Sans Variable', sans-serif",
  figtree: "'Figtree Variable', sans-serif",
};

/** NPM package names for lazy loading */
export const FONT_PACKAGES: Record<FontName, string> = {
  inter: "@fontsource-variable/inter",
  noto: "@fontsource-variable/noto-sans",
  nunito: "@fontsource-variable/nunito-sans",
  figtree: "@fontsource-variable/figtree",
};

/* -----------------------------------------------------------------------------
 * Menu Color (Sidebar color scheme)
 * -------------------------------------------------------------------------- */
export type MenuColorName = "default" | "inverted";

export const MENU_COLOR_NAMES: MenuColorName[] = ["default", "inverted"];

export const MENU_COLOR_LABELS: Record<MenuColorName, string> = {
  default: "Default",
  inverted: "Inverted",
};

/* -----------------------------------------------------------------------------
 * Menu Accent (Sidebar accent style)
 * -------------------------------------------------------------------------- */
export type MenuAccentName = "subtle" | "bold" | "minimal";

export const MENU_ACCENT_NAMES: MenuAccentName[] = ["subtle", "bold", "minimal"];

export const MENU_ACCENT_LABELS: Record<MenuAccentName, string> = {
  subtle: "Subtle",
  bold: "Bold",
  minimal: "Minimal",
};

/* -----------------------------------------------------------------------------
 * Combined Theme Configuration
 * -------------------------------------------------------------------------- */
export interface ThemeConfig {
  /** Base color scale (gray, slate, stone, zinc, neutral, etc.) */
  base: string;
  /** Style preset (vega, nova, mia, lyra, mira) */
  style: StyleName;
  /** Accent/theme color (neutral, rose, orange, amber, etc.) */
  accent: AccentName;
  /** Font family (inter, noto, nunito, figtree) */
  font: FontName;
  /** Menu/sidebar color scheme */
  menuColor: MenuColorName;
  /** Menu/sidebar accent style */
  menuAccent: MenuAccentName;
}

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  base: "neutral",
  style: "vega",
  accent: "neutral",
  font: "inter",
  menuColor: "default",
  menuAccent: "subtle",
};

/* -----------------------------------------------------------------------------
 * Storage Keys
 * -------------------------------------------------------------------------- */
export const THEME_STORAGE_KEYS = {
  base: "axis:base-theme",
  style: "axis:style",
  accent: "axis:accent",
  font: "axis:font",
  menuColor: "axis:menu-color",
  menuAccent: "axis:menu-accent",
} as const;
