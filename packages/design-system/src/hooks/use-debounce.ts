"use client"

import { useEffect, useState } from "react"

/**
 * useDebounce - Debounce a value
 * 
 * @example
 * ```tsx
 * function SearchInput() {
 *   const [searchTerm, setSearchTerm] = useState("")
 *   const debouncedSearchTerm = useDebounce(searchTerm, 500)
 * 
 *   useEffect(() => {
 *     if (debouncedSearchTerm) {
 *       // Perform search
 *     }
 *   }, [debouncedSearchTerm])
 * 
 *   return <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
 * }
 * ```
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
