"use client";

import * as React from "react";

/**
 * Hook to match a CSS media query.
 * Reactively updates when the media query match changes.
 *
 * @param query - CSS media query string (e.g., "(min-width: 768px)")
 * @returns `true` if the media query matches, `false` otherwise
 * @example
 * ```tsx
 * const isLargeScreen = useMediaQuery("(min-width: 1024px)");
 * const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
 * const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
 * ```
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    setMatches(mql.matches);
    mql.addEventListener("change", onChange);

    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return !!matches;
}

/**
 * Predefined breakpoint hooks matching Tailwind defaults.
 */
export const useBreakpoint = {
  /** >= 640px (sm) */
  sm: () => useMediaQuery("(min-width: 640px)"),
  /** >= 768px (md) */
  md: () => useMediaQuery("(min-width: 768px)"),
  /** >= 1024px (lg) */
  lg: () => useMediaQuery("(min-width: 1024px)"),
  /** >= 1280px (xl) */
  xl: () => useMediaQuery("(min-width: 1280px)"),
  /** >= 1536px (2xl) */
  "2xl": () => useMediaQuery("(min-width: 1536px)"),
} as const;
