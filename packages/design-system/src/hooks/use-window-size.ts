"use client"

import { useEffect, useState } from "react"

interface WindowSize {
  width: number
  height: number
}

/**
 * useWindowSize - Track window dimensions
 * 
 * @example
 * ```tsx
 * function Component() {
 *   const { width, height } = useWindowSize()
 * 
 *   return (
 *     <div>
 *       Window size: {width} x {height}
 *     </div>
 *   )
 * }
 * ```
 */
export function useWindowSize(): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: 0,
    height: 0,
  })

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    // Set initial size
    handleResize()

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return windowSize
}
