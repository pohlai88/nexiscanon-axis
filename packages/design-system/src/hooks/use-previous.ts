"use client"

import { useEffect, useRef } from "react"

/**
 * usePrevious - Get previous value of a state/prop
 * 
 * @example
 * ```tsx
 * function Counter() {
 *   const [count, setCount] = useState(0)
 *   const prevCount = usePrevious(count)
 * 
 *   return (
 *     <div>
 *       <p>Current: {count}</p>
 *       <p>Previous: {prevCount}</p>
 *       <button onClick={() => setCount(count + 1)}>Increment</button>
 *     </div>
 *   )
 * }
 * ```
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>()

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}
