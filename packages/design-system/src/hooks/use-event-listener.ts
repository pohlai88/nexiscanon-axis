"use client"

import { useEffect, useRef, type RefObject } from "react"

/**
 * useEventListener - Attach event listeners with automatic cleanup
 * 
 * @example
 * ```tsx
 * function Component() {
 *   const buttonRef = useRef<HTMLButtonElement>(null)
 * 
 *   // Window event
 *   useEventListener("resize", () => console.log("Window resized"))
 * 
 *   // Element event
 *   useEventListener("click", () => console.log("Button clicked"), buttonRef)
 * 
 *   return <button ref={buttonRef}>Click me</button>
 * }
 * ```
 */
export function useEventListener<
  K extends keyof WindowEventMap,
  T extends HTMLElement = HTMLDivElement
>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element?: RefObject<T> | null,
  options?: boolean | AddEventListenerOptions
): void {
  const savedHandler = useRef(handler)

  useEffect(() => {
    savedHandler.current = handler
  }, [handler])

  useEffect(() => {
    // Define the listening target
    const targetElement: T | Window = element?.current ?? window
    
    if (!(targetElement && targetElement.addEventListener)) {
      return
    }

    // Create event listener that calls handler function stored in ref
    const listener: typeof handler = (event) => savedHandler.current(event)

    targetElement.addEventListener(eventName, listener as EventListener, options)

    // Remove event listener on cleanup
    return () => {
      targetElement.removeEventListener(eventName, listener as EventListener, options)
    }
  }, [eventName, element, options])
}
