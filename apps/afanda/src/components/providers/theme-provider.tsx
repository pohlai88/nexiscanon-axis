"use client";

/**
 * AFANDA Theme Provider
 *
 * Integrates next-themes with AXIS multi-dimensional theming:
 * - 9 base themes (neutral, gray, stone, zinc, slate, midnight, opulence, heirloom, zenith)
 * - Light/dark mode
 * - 5 style presets (vega, nova, mia, lyra, mira)
 * - 9 accent colors
 * - Texture effects
 *
 * @see DESIGN_SYSTEM_GUIDE.md
 * @see packages/design-system/src/tokens/theme-config.ts
 */

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps as NextThemesProviderProps } from "next-themes";
import {
  type ThemeName,
  type StyleName,
  type AccentName,
  THEME_NAMES,
  STYLE_NAMES,
  ACCENT_NAMES,
  applyThemeConfig,
  loadThemeConfig,
} from "@workspace/design-system/tokens";

/**
 * Extended theme configuration context
 */
interface ThemeContextValue {
  // Base theme (color scale)
  baseTheme: ThemeName;
  setBaseTheme: (theme: ThemeName) => void;

  // Style preset (visual density)
  style: StyleName;
  setStyle: (style: StyleName) => void;

  // Accent color
  accent: AccentName;
  setAccent: (accent: AccentName) => void;

  // Texture effects
  textureEnabled: boolean;
  setTextureEnabled: (enabled: boolean) => void;
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(
  undefined
);

export interface ThemeProviderProps extends NextThemesProviderProps {
  children: React.ReactNode;
  defaultBaseTheme?: ThemeName;
  defaultStyle?: StyleName;
  defaultAccent?: AccentName;
  defaultTextureEnabled?: boolean;
}

export function ThemeProvider({
  children,
  defaultBaseTheme = "midnight",
  defaultStyle = "mia",
  defaultAccent = "neutral",
  defaultTextureEnabled = true,
  ...props
}: ThemeProviderProps) {
  // Base theme state
  const [baseTheme, setBaseThemeState] = React.useState<ThemeName>(
    defaultBaseTheme
  );

  // Style preset state
  const [style, setStyleState] = React.useState<StyleName>(defaultStyle);

  // Accent color state
  const [accent, setAccentState] = React.useState<AccentName>(defaultAccent);

  // Texture state
  const [textureEnabled, setTextureEnabled] = React.useState(
    defaultTextureEnabled
  );

  // Load saved theme configuration on mount
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const config = loadThemeConfig();
    setBaseThemeState(config.base);
    setStyleState(config.style);
    setAccentState(config.accent);

    const savedTexture = localStorage.getItem("afanda-texture-enabled");
    if (savedTexture !== null) {
      setTextureEnabled(savedTexture === "true");
    }
  }, []);

  // Apply base theme changes
  const setBaseTheme = React.useCallback((theme: ThemeName) => {
    setBaseThemeState(theme);
    applyThemeConfig({ base: theme });
  }, []);

  // Apply style changes
  const setStyle = React.useCallback((newStyle: StyleName) => {
    setStyleState(newStyle);
    applyThemeConfig({ style: newStyle });
  }, []);

  // Apply accent changes
  const setAccent = React.useCallback((newAccent: AccentName) => {
    setAccentState(newAccent);
    applyThemeConfig({ accent: newAccent });
  }, []);

  // Apply texture toggle
  React.useEffect(() => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    if (textureEnabled) {
      root.setAttribute("data-texture", "enabled");
    } else {
      root.removeAttribute("data-texture");
    }

    localStorage.setItem("afanda-texture-enabled", String(textureEnabled));
  }, [textureEnabled]);

  const value: ThemeContextValue = {
    baseTheme,
    setBaseTheme,
    style,
    setStyle,
    accent,
    setAccent,
    textureEnabled,
    setTextureEnabled,
  };

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    </NextThemesProvider>
  );
}

/**
 * Hook to access extended theme configuration
 */
export function useThemeConfig() {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useThemeConfig must be used within a ThemeProvider");
  }
  return context;
}

/**
 * Re-export next-themes hook for light/dark mode
 */
export { useTheme } from "next-themes";

/**
 * Export theme constants for convenience
 */
export { THEME_NAMES, STYLE_NAMES, ACCENT_NAMES };
export type { ThemeName, StyleName, AccentName };
