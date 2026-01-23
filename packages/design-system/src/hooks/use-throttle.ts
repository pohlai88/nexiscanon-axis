"use client"

import { useEffect, useRef, useState } from "react"

/**
 * useThrottle - Throttle a value
 * 
 * @example
 * ```tsx
 * function Component() {
 *   const [scrollY, setScrollY] = useState(0)
 *   const throttledScrollY = useThrottle(scrollY, 100)
 * 
 *   useEffect(() => {
 *     const handleScroll = () => setScrollY(window.scrollY)
 *     window.addEventListener("scroll", handleScroll)
 *     return () => window.removeEventListener("scroll", handleScroll)
 *   }, [])
 * 
 *   return <div>Scroll Y: {throttledScrollY}</div>
 * }
 * ```
 */
export function useThrottle<T>(value: T, interval: number = 500): T {
  const [throttledValue, setThrottledValue] = useState<T>(value)
  const lastExecuted = useRef<number>(Date.now())

  useEffect(() => {
    if (Date.now() >= lastExecuted.current + interval) {
      lastExecuted.current = Date.now()
      setThrottledValue(value)
    } else {
      const timerId = setTimeout(() => {
        lastExecuted.current = Date.now()
        setThrottledValue(value)
      }, interval)

      return () => clearTimeout(timerId)
    }
  }, [value, interval])

  return throttledValue
}
