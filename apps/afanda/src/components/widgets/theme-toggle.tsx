"use client";

/**
 * AFANDA Theme Toggle
 *
 * Quick light/dark mode toggle button.
 * For full theme customization, use ThemeSwitcher component.
 *
 * @see theme-switcher.tsx for comprehensive theme controls
 */

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@workspace/design-system";
import { useTheme } from "@/components/providers/theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Sun className="h-5 w-5" />
      </Button>
    );
  }

  const isDark = theme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="h-5 w-5 transition-all" />
      ) : (
        <Moon className="h-5 w-5 transition-all" />
      )}
    </Button>
  );
}
