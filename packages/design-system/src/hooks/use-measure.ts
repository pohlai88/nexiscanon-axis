"use client"

import { useEffect, useRef, useState } from "react"

interface Bounds {
  left: number
  top: number
  width: number
  height: number
}

/**
 * useMeasure - Measure element dimensions with ResizeObserver
 * 
 * @example
 * ```tsx
 * function Component() {
 *   const [ref, bounds] = useMeasure<HTMLDivElement>()
 * 
 *   return (
 *     <div ref={ref}>
 *       Size: {bounds.width} x {bounds.height}
 *     </div>
 *   )
 * }
 * ```
 */
export function useMeasure<T extends HTMLElement = HTMLDivElement>(): [
  (node: T | null) => void,
  Bounds
] {
  const [element, setElement] = useState<T | null>(null)
  const [bounds, setBounds] = useState<Bounds>({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  })

  const observer = useRef<ResizeObserver | null>(null)

  useEffect(() => {
    if (!element) return

    observer.current = new ResizeObserver(([entry]) => {
      if (entry?.contentRect) {
        setBounds({
          left: entry.contentRect.left,
          top: entry.contentRect.top,
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        })
      }
    })

    observer.current.observe(element)

    return () => {
      observer.current?.disconnect()
    }
  }, [element])

  return [setElement, bounds]
}
