/* eslint-disable no-undef */
"use client"

import { useEffect, useState, type RefObject } from "react"

interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  freezeOnceVisible?: boolean
}

/**
 * useIntersectionObserver - Track element visibility in viewport
 * 
 * @example
 * ```tsx
 * function LazyImage() {
 *   const ref = useRef<HTMLDivElement>(null)
 *   const entry = useIntersectionObserver(ref, { threshold: 0.5 })
 *   const isVisible = !!entry?.isIntersecting
 * 
 *   return (
 *     <div ref={ref}>
 *       {isVisible && <img src="..." alt="..." />}
 *     </div>
 *   )
 * }
 * ```
 */
export function useIntersectionObserver(
  elementRef: RefObject<Element>,
  {
    threshold = 0,
    root = null,
    rootMargin = "0%",
    freezeOnceVisible = false,
  }: UseIntersectionObserverOptions = {}
): IntersectionObserverEntry | undefined {
  const [entry, setEntry] = useState<IntersectionObserverEntry>()

  const frozen = entry?.isIntersecting && freezeOnceVisible

  useEffect(() => {
    const node = elementRef?.current
    const hasIOSupport = !!window.IntersectionObserver

    if (!hasIOSupport || frozen || !node) {
      return
    }

    const observerParams = { threshold, root, rootMargin }
    const observer = new IntersectionObserver(
      ([entry]) => setEntry(entry),
      observerParams
    )

    observer.observe(node)

    return () => observer.disconnect()
  }, [elementRef, threshold, root, rootMargin, frozen])

  return entry
}
