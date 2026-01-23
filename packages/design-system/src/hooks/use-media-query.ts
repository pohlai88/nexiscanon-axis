"use client"

import { useEffect, useState } from "react"

/**
 * useMediaQuery - React hook for responsive media queries
 * 
 * Optimized for Tailwind v4 breakpoints and SSR safety.
 * 
 * @example
 * ```tsx
 * // Tailwind v4 breakpoints
 * const isMobile = useMediaQuery("(max-width: 767px)")
 * const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1023px)")
 * const isDesktop = useMediaQuery("(min-width: 1024px)")
 * 
 * // Prefers reduced motion
 * const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)")
 * 
 * // Dark mode
 * const prefersDark = useMediaQuery("(prefers-color-scheme: dark)")
 * ```
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false)
  const [mounted, setMounted] = useState<boolean>(false)

  useEffect(() => {
    setMounted(true)
    const mediaQuery = window.matchMedia(query)
    
    // Set initial value
    setMatches(mediaQuery.matches)

    // Create event listener
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange)
      return () => mediaQuery.removeEventListener("change", handleChange)
    }
    
    // Legacy browsers (Safari < 14)
    mediaQuery.addListener(handleChange)
    return () => mediaQuery.removeListener(handleChange)
  }, [query])

  // Return false during SSR and initial mount
  return mounted ? matches : false
}
