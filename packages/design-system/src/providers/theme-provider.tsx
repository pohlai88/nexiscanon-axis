"use client";

import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes";
import { createContext, useContext, useEffect, useState } from "react";
import type { ThemeName } from "../tokens/theme";

// Context for color theme (neutral/gray/stone/zinc/midnight/opulence/heirloom)
interface ColorThemeContext {
  colorTheme: ThemeName;
  setColorTheme: (theme: ThemeName) => void;
}

const ColorThemeContext = createContext<ColorThemeContext>({
  colorTheme: "neutral",
  setColorTheme: () => {},
});

export function useColorTheme() {
  return useContext(ColorThemeContext);
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [colorTheme, setColorTheme] = useState<ThemeName>("neutral");

  useEffect(() => {
    // Read stored color theme on mount
    const stored = localStorage.getItem("axis:color-theme") as ThemeName | null;
    if (stored && ["neutral", "gray", "stone", "zinc", "midnight", "opulence", "heirloom"].includes(stored)) {
      applyColorTheme(stored);
      setColorTheme(stored);
    }
  }, []);

  function handleSetColorTheme(theme: ThemeName) {
    applyColorTheme(theme);
    setColorTheme(theme);
    localStorage.setItem("axis:color-theme", theme);
  }

  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem {...props}>
      <ColorThemeContext.Provider value={{ colorTheme, setColorTheme: handleSetColorTheme }}>
        {children}
      </ColorThemeContext.Provider>
    </NextThemesProvider>
  );
}

function applyColorTheme(theme: ThemeName) {
  const root = document.documentElement;
  if (theme === "neutral") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", theme);
  }
}
