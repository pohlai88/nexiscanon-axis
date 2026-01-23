/**
 * Texture Presets for SVG Noise Effects
 *
 * Per-component texture configurations optimized for each theme.
 * These presets control the visual texture applied to different component types.
 *
 * @see E02-08-THEME-ADVANCED.md for documentation
 * @see E02-07-THEME-GLASS.md for Glass Theme integration
 */

import type { ThemeName } from "./theme-config"

/* -----------------------------------------------------------------------------
 * Types
 * -------------------------------------------------------------------------- */

/**
 * Component types that support texture effects
 */
export type TextureKind = "bg" | "card" | "button" | "panel"

/**
 * Texture configuration for SVG noise pattern
 */
export interface TextureConfig {
  /** Base frequency of the noise pattern (0.5 - 1.2) */
  baseFrequency: number
  /** Opacity of the texture overlay (0.02 - 0.16) */
  opacity: number
  /** Number of octaves for the noise (2 - 4) */
  octaves: number
}

/**
 * Texture presets for all component types
 */
export type ThemeTextures = Record<TextureKind, TextureConfig>

/* -----------------------------------------------------------------------------
 * Texture Presets by Theme
 * -------------------------------------------------------------------------- */

export const TEXTURE_PRESETS: Record<ThemeName, ThemeTextures> = {
  neutral: {
    bg: { baseFrequency: 0.85, opacity: 0.08, octaves: 3 },
    card: { baseFrequency: 0.75, opacity: 0.14, octaves: 3 },
    button: { baseFrequency: 0.85, opacity: 0.1, octaves: 2 },
    panel: { baseFrequency: 0.7, opacity: 0.12, octaves: 3 },
  },
  gray: {
    bg: { baseFrequency: 0.85, opacity: 0.07, octaves: 3 },
    card: { baseFrequency: 0.8, opacity: 0.12, octaves: 3 },
    button: { baseFrequency: 0.9, opacity: 0.09, octaves: 2 },
    panel: { baseFrequency: 0.78, opacity: 0.1, octaves: 3 },
  },
  stone: {
    bg: { baseFrequency: 0.7, opacity: 0.08, octaves: 3 },
    card: { baseFrequency: 0.65, opacity: 0.14, octaves: 3 },
    button: { baseFrequency: 0.75, opacity: 0.1, octaves: 2 },
    panel: { baseFrequency: 0.6, opacity: 0.12, octaves: 3 },
  },
  zinc: {
    bg: { baseFrequency: 0.9, opacity: 0.07, octaves: 3 },
    card: { baseFrequency: 0.85, opacity: 0.12, octaves: 3 },
    button: { baseFrequency: 0.92, opacity: 0.09, octaves: 2 },
    panel: { baseFrequency: 0.82, opacity: 0.1, octaves: 3 },
  },
  slate: {
    bg: { baseFrequency: 0.82, opacity: 0.075, octaves: 3 },
    card: { baseFrequency: 0.77, opacity: 0.13, octaves: 3 },
    button: { baseFrequency: 0.87, opacity: 0.095, octaves: 2 },
    panel: { baseFrequency: 0.74, opacity: 0.11, octaves: 3 },
  },
  midnight: {
    bg: { baseFrequency: 0.95, opacity: 0.06, octaves: 3 },
    card: { baseFrequency: 0.9, opacity: 0.11, octaves: 3 },
    button: { baseFrequency: 1.0, opacity: 0.08, octaves: 2 },
    panel: { baseFrequency: 0.88, opacity: 0.1, octaves: 3 },
  },
  opulence: {
    bg: { baseFrequency: 0.75, opacity: 0.07, octaves: 3 },
    card: { baseFrequency: 0.7, opacity: 0.15, octaves: 3 },
    button: { baseFrequency: 0.8, opacity: 0.11, octaves: 2 },
    panel: { baseFrequency: 0.68, opacity: 0.13, octaves: 3 },
  },
  heirloom: {
    bg: { baseFrequency: 0.6, opacity: 0.08, octaves: 3 },
    card: { baseFrequency: 0.55, opacity: 0.16, octaves: 3 },
    button: { baseFrequency: 0.65, opacity: 0.12, octaves: 2 },
    panel: { baseFrequency: 0.52, opacity: 0.14, octaves: 3 },
  },
  zenith: {
    bg: { baseFrequency: 0.88, opacity: 0.065, octaves: 3 },
    card: { baseFrequency: 0.83, opacity: 0.115, octaves: 3 },
    button: { baseFrequency: 0.93, opacity: 0.085, octaves: 2 },
    panel: { baseFrequency: 0.8, opacity: 0.105, octaves: 3 },
  },
}

/* -----------------------------------------------------------------------------
 * Helper Functions
 * -------------------------------------------------------------------------- */

/**
 * Generate SVG noise pattern data URL
 */
export function generateNoisePattern(config: TextureConfig): string {
  const svg = `<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='noiseFilter'><feTurbulence type='fractalNoise' baseFrequency='${config.baseFrequency}' numOctaves='${config.octaves}' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(#noiseFilter)'/></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

/**
 * Generate CSS custom properties for a theme's textures
 */
export function generateTextureCSS(theme: ThemeName): string {
  const textures = TEXTURE_PRESETS[theme]
  const lines: string[] = []

  for (const [kind, config] of Object.entries(textures)) {
    lines.push(`  --texture-${kind}-frequency: ${config.baseFrequency};`)
    lines.push(`  --texture-${kind}-opacity: ${config.opacity};`)
    lines.push(`  --texture-${kind}-octaves: ${config.octaves};`)
  }

  return lines.join("\n")
}

/**
 * Get texture configuration for a specific theme and component type
 */
export function getTextureConfig(
  theme: ThemeName,
  kind: TextureKind
): TextureConfig {
  return TEXTURE_PRESETS[theme][kind]
}

/**
 * Apply texture to an element as inline style
 */
export function applyTexture(
  element: HTMLElement,
  theme: ThemeName,
  kind: TextureKind
): void {
  const config = getTextureConfig(theme, kind)
  const pattern = generateNoisePattern(config)

  element.style.setProperty("--texture-pattern", `url("${pattern}")`)
  element.style.setProperty("--texture-opacity", String(config.opacity))
}

/* -----------------------------------------------------------------------------
 * CSS Variable Integration
 * -------------------------------------------------------------------------- */

/**
 * CSS variable names for texture configuration
 * Use these in your CSS to reference texture settings
 */
export const TEXTURE_CSS_VARS = {
  pattern: "--texture-pattern",
  opacity: "--texture-opacity",
  frequency: "--texture-frequency",
  octaves: "--texture-octaves",
} as const

/* -----------------------------------------------------------------------------
 * Advanced Texture Utilities
 * -------------------------------------------------------------------------- */

/**
 * Create a texture style object for inline styles
 */
export function createTextureStyle(
  theme: ThemeName,
  kind: TextureKind
): React.CSSProperties {
  const config = getTextureConfig(theme, kind)
  const pattern = generateNoisePattern(config)

  return {
    "--texture-pattern": `url("${pattern}")`,
    "--texture-opacity": String(config.opacity),
  } as React.CSSProperties
}

/**
 * Get all texture configs for a theme (for SSR/preview)
 */
export function getAllTextureConfigs(theme: ThemeName): ThemeTextures {
  return TEXTURE_PRESETS[theme]
}

/**
 * Interpolate between two texture configs (for animations)
 */
export function interpolateTextureConfig(
  from: TextureConfig,
  to: TextureConfig,
  t: number
): TextureConfig {
  const clamp = (v: number) => Math.max(0, Math.min(1, v))
  const lerp = (a: number, b: number, t: number) => a + (b - a) * clamp(t)

  return {
    baseFrequency: lerp(from.baseFrequency, to.baseFrequency, t),
    opacity: lerp(from.opacity, to.opacity, t),
    octaves: Math.round(lerp(from.octaves, to.octaves, t)),
  }
}

/**
 * CSS class names for textured components
 * Use with glass.css utilities
 */
export const TEXTURE_CLASSES = {
  bg: "textured-bg",
  card: "textured-card",
  button: "textured-button",
  panel: "textured-panel",
} as const

/**
 * Example CSS usage (Tailwind v4 with glass.css):
 *
 * ```tsx
 * // Using CSS class (preferred)
 * <Card className="glass glass-grain textured-card">
 *   <div className="glass-content">...</div>
 * </Card>
 *
 * // Using inline styles
 * <Card style={createTextureStyle("opulence", "card")}>
 *   ...
 * </Card>
 * ```
 */
