"use client"

import { useCallback, useState } from "react"

/**
 * useToggle - Toggle boolean state
 * 
 * @example
 * ```tsx
 * function Component() {
 *   const [isOpen, toggleOpen] = useToggle(false)
 * 
 *   return (
 *     <div>
 *       <button onClick={toggleOpen}>Toggle</button>
 *       {isOpen && <div>Content</div>}
 *     </div>
 *   )
 * }
 * ```
 */
export function useToggle(
  initialValue: boolean = false
): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState(initialValue)

  const toggle = useCallback(() => {
    setValue((v) => !v)
  }, [])

  return [value, toggle, setValue]
}
