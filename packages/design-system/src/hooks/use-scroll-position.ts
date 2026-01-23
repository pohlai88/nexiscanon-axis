"use client"

import { useEffect, useState } from "react"
import { useThrottle } from "./use-throttle"

interface ScrollPosition {
  x: number
  y: number
}

/**
 * useScrollPosition - Track scroll position with throttling
 * 
 * @example
 * ```tsx
 * function Component() {
 *   const { y } = useScrollPosition()
 *   const isScrolled = y > 50
 * 
 *   return (
 *     <header className={cn(isScrolled && "shadow-md")}>
 *       Header
 *     </header>
 *   )
 * }
 * ```
 */
export function useScrollPosition(throttleMs: number = 100): ScrollPosition {
  const [position, setPosition] = useState<ScrollPosition>({ x: 0, y: 0 })

  useEffect(() => {
    const handleScroll = () => {
      setPosition({
        x: window.scrollX,
        y: window.scrollY,
      })
    }

    // Set initial position
    handleScroll()

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return useThrottle(position, throttleMs)
}
