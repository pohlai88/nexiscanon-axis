"use client"

import { useCallback, useState } from "react"

interface CopyToClipboardResult {
  value: string | null
  success: boolean | null
  copy: (text: string) => Promise<void>
}

/**
 * useCopyToClipboard - Copy text to clipboard
 * 
 * @example
 * ```tsx
 * function Component() {
 *   const { copy, success } = useCopyToClipboard()
 * 
 *   return (
 *     <button onClick={() => copy("Hello World")}>
 *       {success ? "Copied!" : "Copy"}
 *     </button>
 *   )
 * }
 * ```
 */
export function useCopyToClipboard(): CopyToClipboardResult {
  const [value, setValue] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean | null>(null)

  const copy = useCallback(async (text: string) => {
    if (!navigator?.clipboard) {
      console.warn("Clipboard not supported")
      setSuccess(false)
      return
    }

    try {
      await navigator.clipboard.writeText(text)
      setValue(text)
      setSuccess(true)
    } catch (error) {
      console.warn("Copy failed", error)
      setValue(null)
      setSuccess(false)
    }
  }, [])

  return { value, success, copy }
}
