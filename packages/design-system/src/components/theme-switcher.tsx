"use client";

import { useTheme } from "next-themes";
import { useColorTheme } from "../providers/theme-provider";
import { THEME_NAMES, THEME_LABELS, type ThemeName } from "../tokens/theme";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const { colorTheme, setColorTheme } = useColorTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="flex items-center gap-3">
        <div className="h-9 w-32 rounded-md border border-input bg-background" />
        <div className="h-9 w-20 rounded-md border border-input bg-background" />
      </div>
    );
  }

  const isDark = theme === "dark";

  return (
    <div className="flex items-center gap-3">
      {/* Color Theme Selector */}
      <select
        className="h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        value={colorTheme}
        onChange={(e) => setColorTheme(e.target.value as ThemeName)}
      >
        {THEME_NAMES.map((name: ThemeName) => (
          <option key={name} value={name}>
            {THEME_LABELS[name]}
          </option>
        ))}
      </select>

      {/* Dark Mode Toggle */}
      <button
        type="button"
        className="flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        onClick={() => setTheme(isDark ? "light" : "dark")}
      >
        {isDark ? (
          <>
            <Moon className="h-4 w-4" />
            <span>Dark</span>
          </>
        ) : (
          <>
            <Sun className="h-4 w-4" />
            <span>Light</span>
          </>
        )}
      </button>
    </div>
  );
}
