/**
 * Theme Tokens & Configuration
 *
 * @see E02-08-THEME-ADVANCED.md for documentation
 */

// Theme Configuration - Types
export type {
  ThemeName,
  StyleName,
  AccentName,
  FontName,
  MenuColorName,
  MenuAccentName,
  ThemeConfig,
  ThemeMetadata,
} from "./theme-config"

// Theme Configuration - Constants
export {
  THEME_NAMES,
  THEME_LABELS,
  THEME_DESCRIPTIONS,
  THEME_METADATA,
  STYLE_NAMES,
  STYLE_LABELS,
  STYLE_DESCRIPTIONS,
  STYLE_RADIUS,
  ACCENT_NAMES,
  ACCENT_LABELS,
  ACCENT_SWATCHES,
  FONT_NAMES,
  FONT_LABELS,
  FONT_FAMILIES,
  FONT_PACKAGES,
  MENU_COLOR_NAMES,
  MENU_COLOR_LABELS,
  MENU_ACCENT_NAMES,
  MENU_ACCENT_LABELS,
  DEFAULT_THEME_CONFIG,
  THEME_STORAGE_KEYS,
} from "./theme-config"

// Theme Configuration - Functions
export {
  applyThemeConfig,
  loadThemeConfig,
  resetThemeConfig,
  toggleDarkMode,
  isDarkMode,
  getSystemColorScheme,
  getCSSVariable,
  setCSSVariable,
  generateThemeCSS,
} from "./theme-config"

// Theme Textures - Types
export type {
  TextureKind,
  TextureConfig,
  ThemeTextures,
} from "./theme-textures"

// Theme Textures - Constants
export {
  TEXTURE_PRESETS,
  TEXTURE_CSS_VARS,
  TEXTURE_CLASSES,
} from "./theme-textures"

// Theme Textures - Functions
export {
  generateNoisePattern,
  generateTextureCSS,
  getTextureConfig,
  applyTexture,
  createTextureStyle,
  getAllTextureConfigs,
  interpolateTextureConfig,
} from "./theme-textures"
