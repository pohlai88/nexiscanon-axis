/**
 * Advanced Theme Configuration (Tailwind v4)
 *
 * Multi-dimensional theming system supporting:
 * - 9 base themes (neutral, gray, stone, zinc, slate, midnight, opulence, heirloom, zenith)
 * - 5 style presets (vega, nova, mia, lyra, mira)
 * - 9 accent colors (OKLCH)
 * - 4 variable fonts
 * - Menu variants
 *
 * @see {@link https://ui.shadcn.com/docs/theming} shadcn/ui theming
 * @see E02-08-THEME-ADVANCED.md for full documentation
 */

/* -----------------------------------------------------------------------------
 * Base Theme (Color scale)
 * -------------------------------------------------------------------------- */

export const THEME_NAMES = [
  "neutral",
  "gray",
  "stone",
  "zinc",
  "slate",
  "midnight",
  "opulence",
  "heirloom",
  "zenith",
] as const

export type ThemeName = (typeof THEME_NAMES)[number]

export const THEME_LABELS: Record<ThemeName, string> = {
  neutral: "Neutral",
  gray: "Gray",
  stone: "Stone",
  zinc: "Zinc",
  slate: "Slate",
  midnight: "Midnight",
  opulence: "Opulence",
  heirloom: "Heirloom",
  zenith: "Zenith",
}

export const THEME_DESCRIPTIONS: Record<ThemeName, string> = {
  neutral: "Pure grayscale, professional default",
  gray: "Cool blue-tinted gray",
  stone: "Warm cream and charcoal tones",
  zinc: "Purple-tinted modern gray",
  slate: "Deep blue-gray, navy depths",
  midnight: "Electric ink with cool paper",
  opulence: "Luxury gold and bronze accents",
  heirloom: "Historic warmth with aged leather",
  zenith: "Modern minimal, content-first",
}

/* -----------------------------------------------------------------------------
 * Style (Visual density, radius, shadows)
 * -------------------------------------------------------------------------- */

export const STYLE_NAMES = ["vega", "nova", "mia", "lyra", "mira"] as const

export type StyleName = (typeof STYLE_NAMES)[number]

export const STYLE_LABELS: Record<StyleName, string> = {
  vega: "Vega",
  nova: "Nova",
  mia: "Mia",
  lyra: "Lyra",
  mira: "Mira",
}

export const STYLE_DESCRIPTIONS: Record<StyleName, string> = {
  vega: "Default balanced style with subtle shadows",
  nova: "Sharp, minimal with zero radius",
  mia: "Soft, rounded with gentle shadows",
  lyra: "Compact, tight spacing",
  mira: "Pill-shaped, full radius with glow effects",
}

export const STYLE_RADIUS: Record<StyleName, string> = {
  vega: "0.625rem",
  nova: "0",
  mia: "1rem",
  lyra: "0.375rem",
  mira: "9999px",
}

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
  | "fuchsia"

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
]

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
}

/** Preview swatch colors for accent picker (light mode, OKLCH) */
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
}

/* -----------------------------------------------------------------------------
 * Font (Variable typography system)
 * -------------------------------------------------------------------------- */

export const FONT_NAMES = ["inter", "noto", "nunito", "figtree"] as const

export type FontName = (typeof FONT_NAMES)[number]

export const FONT_LABELS: Record<FontName, string> = {
  inter: "Inter",
  noto: "Noto Sans",
  nunito: "Nunito Sans",
  figtree: "Figtree",
}

export const FONT_FAMILIES: Record<FontName, string> = {
  inter: "'Inter Variable', sans-serif",
  noto: "'Noto Sans Variable', sans-serif",
  nunito: "'Nunito Sans Variable', sans-serif",
  figtree: "'Figtree Variable', sans-serif",
}

/** NPM package names for lazy loading */
export const FONT_PACKAGES: Record<FontName, string> = {
  inter: "@fontsource-variable/inter",
  noto: "@fontsource-variable/noto-sans",
  nunito: "@fontsource-variable/nunito-sans",
  figtree: "@fontsource-variable/figtree",
}

/* -----------------------------------------------------------------------------
 * Menu Color (Sidebar color scheme)
 * -------------------------------------------------------------------------- */

export const MENU_COLOR_NAMES = ["default", "inverted"] as const

export type MenuColorName = (typeof MENU_COLOR_NAMES)[number]

export const MENU_COLOR_LABELS: Record<MenuColorName, string> = {
  default: "Default",
  inverted: "Inverted",
}

/* -----------------------------------------------------------------------------
 * Menu Accent (Sidebar accent style)
 * -------------------------------------------------------------------------- */

export const MENU_ACCENT_NAMES = ["subtle", "bold", "minimal"] as const

export type MenuAccentName = (typeof MENU_ACCENT_NAMES)[number]

export const MENU_ACCENT_LABELS: Record<MenuAccentName, string> = {
  subtle: "Subtle",
  bold: "Bold",
  minimal: "Minimal",
}

/* -----------------------------------------------------------------------------
 * Combined Theme Configuration
 * -------------------------------------------------------------------------- */

export interface ThemeConfig {
  /** Base color scale (neutral, gray, stone, zinc, slate, midnight, opulence, heirloom, zenith) */
  base: ThemeName
  /** Style preset (vega, nova, mia, lyra, mira) */
  style: StyleName
  /** Accent/theme color (neutral, rose, orange, amber, etc.) */
  accent: AccentName
  /** Font family (inter, noto, nunito, figtree) */
  font: FontName
  /** Menu/sidebar color scheme */
  menuColor: MenuColorName
  /** Menu/sidebar accent style */
  menuAccent: MenuAccentName
}

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  base: "neutral",
  style: "vega",
  accent: "neutral",
  font: "inter",
  menuColor: "default",
  menuAccent: "subtle",
}

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
} as const

/* -----------------------------------------------------------------------------
 * Helper Functions
 * -------------------------------------------------------------------------- */

/**
 * Apply theme configuration to the document
 */
export function applyThemeConfig(config: Partial<ThemeConfig>): void {
  if (typeof document === "undefined") return

  const root = document.documentElement

  if (config.base) {
    root.setAttribute("data-theme", config.base)
    localStorage.setItem(THEME_STORAGE_KEYS.base, config.base)
  }

  if (config.style) {
    root.setAttribute("data-style", config.style)
    localStorage.setItem(THEME_STORAGE_KEYS.style, config.style)
  }

  if (config.accent) {
    root.setAttribute("data-accent", config.accent)
    localStorage.setItem(THEME_STORAGE_KEYS.accent, config.accent)
  }

  if (config.font) {
    root.style.setProperty("--font-sans", FONT_FAMILIES[config.font])
    localStorage.setItem(THEME_STORAGE_KEYS.font, config.font)
  }

  if (config.menuColor) {
    root.setAttribute("data-menu-color", config.menuColor)
    localStorage.setItem(THEME_STORAGE_KEYS.menuColor, config.menuColor)
  }

  if (config.menuAccent) {
    root.setAttribute("data-menu-accent", config.menuAccent)
    localStorage.setItem(THEME_STORAGE_KEYS.menuAccent, config.menuAccent)
  }
}

/**
 * Load theme configuration from localStorage
 */
export function loadThemeConfig(): ThemeConfig {
  if (typeof localStorage === "undefined") return DEFAULT_THEME_CONFIG

  return {
    base:
      (localStorage.getItem(THEME_STORAGE_KEYS.base) as ThemeName) ||
      DEFAULT_THEME_CONFIG.base,
    style:
      (localStorage.getItem(THEME_STORAGE_KEYS.style) as StyleName) ||
      DEFAULT_THEME_CONFIG.style,
    accent:
      (localStorage.getItem(THEME_STORAGE_KEYS.accent) as AccentName) ||
      DEFAULT_THEME_CONFIG.accent,
    font:
      (localStorage.getItem(THEME_STORAGE_KEYS.font) as FontName) ||
      DEFAULT_THEME_CONFIG.font,
    menuColor:
      (localStorage.getItem(THEME_STORAGE_KEYS.menuColor) as MenuColorName) ||
      DEFAULT_THEME_CONFIG.menuColor,
    menuAccent:
      (localStorage.getItem(THEME_STORAGE_KEYS.menuAccent) as MenuAccentName) ||
      DEFAULT_THEME_CONFIG.menuAccent,
  }
}

/**
 * Reset theme configuration to defaults
 */
export function resetThemeConfig(): void {
  if (typeof localStorage === "undefined") return

  Object.values(THEME_STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key)
  })

  applyThemeConfig(DEFAULT_THEME_CONFIG)
}

/* -----------------------------------------------------------------------------
 * Dark Mode Utilities
 * -------------------------------------------------------------------------- */

/**
 * Toggle dark mode class on document
 */
export function toggleDarkMode(isDark?: boolean): boolean {
  if (typeof document === "undefined") return false

  const root = document.documentElement
  const currentlyDark = root.classList.contains("dark")
  const shouldBeDark = isDark ?? !currentlyDark

  if (shouldBeDark) {
    root.classList.add("dark")
  } else {
    root.classList.remove("dark")
  }

  return shouldBeDark
}

/**
 * Check if dark mode is active
 */
export function isDarkMode(): boolean {
  if (typeof document === "undefined") return false
  return document.documentElement.classList.contains("dark")
}

/**
 * Get system color scheme preference
 */
export function getSystemColorScheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

/* -----------------------------------------------------------------------------
 * CSS Variable Utilities (Tailwind v4)
 * -------------------------------------------------------------------------- */

/**
 * Get computed CSS variable value
 */
export function getCSSVariable(name: string): string {
  if (typeof document === "undefined") return ""
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim()
}

/**
 * Set CSS variable on root
 */
export function setCSSVariable(name: string, value: string): void {
  if (typeof document === "undefined") return
  document.documentElement.style.setProperty(name, value)
}

/**
 * Generate CSS for a complete theme configuration
 * Useful for SSR or generating theme preview
 */
export function generateThemeCSS(config: Partial<ThemeConfig>): string {
  const lines: string[] = []

  if (config.style && STYLE_RADIUS[config.style]) {
    lines.push(`  --radius: ${STYLE_RADIUS[config.style]};`)
  }

  if (config.font && FONT_FAMILIES[config.font]) {
    lines.push(`  --font-sans: ${FONT_FAMILIES[config.font]};`)
  }

  return lines.length > 0 ? `:root {\n${lines.join("\n")}\n}` : ""
}

/* -----------------------------------------------------------------------------
 * Theme Metadata (for UI pickers)
 * -------------------------------------------------------------------------- */

export interface ThemeMetadata {
  name: ThemeName
  label: string
  description: string
  warmth: "cold" | "neutral" | "warm"
  contrast: "low" | "medium" | "high"
  category: "standard" | "premium" | "minimal"
}

export const THEME_METADATA: Record<ThemeName, ThemeMetadata> = {
  neutral: {
    name: "neutral",
    label: "Neutral",
    description: "Pure grayscale, professional default",
    warmth: "cold",
    contrast: "medium",
    category: "standard",
  },
  gray: {
    name: "gray",
    label: "Gray",
    description: "Cool blue-tinted gray",
    warmth: "cold",
    contrast: "medium",
    category: "standard",
  },
  stone: {
    name: "stone",
    label: "Stone",
    description: "Warm cream and charcoal tones",
    warmth: "warm",
    contrast: "medium",
    category: "standard",
  },
  zinc: {
    name: "zinc",
    label: "Zinc",
    description: "Purple-tinted modern gray",
    warmth: "cold",
    contrast: "medium",
    category: "standard",
  },
  slate: {
    name: "slate",
    label: "Slate",
    description: "Deep blue-gray, navy depths",
    warmth: "cold",
    contrast: "medium",
    category: "standard",
  },
  midnight: {
    name: "midnight",
    label: "Midnight",
    description: "Electric ink with cool paper",
    warmth: "cold",
    contrast: "medium",
    category: "premium",
  },
  opulence: {
    name: "opulence",
    label: "Opulence",
    description: "Luxury gold and bronze accents",
    warmth: "warm",
    contrast: "high",
    category: "premium",
  },
  heirloom: {
    name: "heirloom",
    label: "Heirloom",
    description: "Historic warmth with aged leather",
    warmth: "warm",
    contrast: "high",
    category: "premium",
  },
  zenith: {
    name: "zenith",
    label: "Zenith",
    description: "Modern minimal, content-first",
    warmth: "neutral",
    contrast: "high",
    category: "minimal",
  },
}
