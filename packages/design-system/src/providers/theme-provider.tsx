"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes";
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { THEME_NAMES, type ThemeName } from "../tokens/theme";

interface ColorThemeContextValue {
  colorTheme: ThemeName;
  setColorTheme: (theme: ThemeName) => void;
}

const ColorThemeContext = createContext<ColorThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "axis:color-theme";

export function useColorTheme() {
  const context = useContext(ColorThemeContext);
  if (!context) {
    throw new Error("useColorTheme must be used within ThemeProvider");
  }
  return context;
}

interface ThemeProviderComponentProps extends ThemeProviderProps {
  defaultColorTheme?: ThemeName;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultColorTheme = "neutral",
  storageKey = STORAGE_KEY,
  attribute = "class",
  defaultTheme = "system",
  enableSystem = true,
  disableTransitionOnChange = true,
  ...props
}: ThemeProviderComponentProps) {
  const [colorTheme, setColorThemeState] = useState<ThemeName>(defaultColorTheme);

  // Initialize color theme from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(storageKey) as ThemeName | null;
    if (stored && THEME_NAMES.includes(stored)) {
      applyColorTheme(stored);
      setColorThemeState(stored);
    } else {
      applyColorTheme(defaultColorTheme);
    }
  }, [defaultColorTheme, storageKey]);

  const setColorTheme = useCallback(
    (theme: ThemeName) => {
      if (!THEME_NAMES.includes(theme)) {
        console.warn(`Invalid theme: ${theme}. Falling back to ${defaultColorTheme}`);
        return;
      }
      applyColorTheme(theme);
      setColorThemeState(theme);
      localStorage.setItem(storageKey, theme);
    },
    [defaultColorTheme, storageKey]
  );

  const contextValue = useMemo<ColorThemeContextValue>(
    () => ({
      colorTheme,
      setColorTheme,
    }),
    [colorTheme, setColorTheme]
  );

  return (
    <NextThemesProvider
      attribute={attribute}
      defaultTheme={defaultTheme}
      enableSystem={enableSystem}
      disableTransitionOnChange={disableTransitionOnChange}
      {...props}
    >
      <ColorThemeContext.Provider value={contextValue}>{children}</ColorThemeContext.Provider>
    </NextThemesProvider>
  );
}

function applyColorTheme(theme: ThemeName) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "neutral") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", theme);
  }
}
