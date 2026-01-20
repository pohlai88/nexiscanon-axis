"use client";

import * as React from "react";

/**
 * Hook to track component mount state.
 * Useful for avoiding hydration mismatches with SSR.
 *
 * @returns `true` after the component has mounted on the client
 * @example
 * ```tsx
 * const mounted = useMounted();
 *
 * // Avoid hydration mismatch
 * if (!mounted) return <Skeleton />;
 * return <DynamicContent />;
 * ```
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}

/**
 * Hook that returns a stable callback ref for mount state.
 * Useful when you need to check mount state in callbacks.
 *
 * @returns Ref object with `current` set to mount state
 * @example
 * ```tsx
 * const mountedRef = useMountedRef();
 *
 * const handleAsync = async () => {
 *   const result = await fetchData();
 *   if (mountedRef.current) {
 *     setState(result); // Safe to update state
 *   }
 * };
 * ```
 */
export function useMountedRef(): React.RefObject<boolean> {
  const mountedRef = React.useRef(false);

  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return mountedRef;
}
