/**
 * Client-Side Hooks
 *
 * This directory contains reusable React hooks for client components.
 * All hooks in this file are client-side only (require "use client").
 *
 * Pattern:
 * - Hooks handle client-side state, effects, and subscriptions
 * - Server data should be fetched via Server Components or Server Actions
 * - Use SWR or React Query here if you need client-side revalidation
 *
 * @example
 * ```tsx
 * "use client";
 * import { useDebounce, useLocalStorage } from "@/lib/hooks";
 * ```
 */

// Re-export hooks from their source files
// These exports point to hooks defined alongside their providers/components

// Theme hook - from theme-provider
export { useTheme } from "@/components/theme-provider";

// Notification hook - from notifications component
export { useNotifications } from "@/components/notifications";

// Feature flags hook - from feature-flags provider
export { useFeatureFlags } from "@/lib/feature-flags/provider";

// Mobile sidebar hook - from mobile-sidebar component
export { useMobileSidebar } from "@/components/mobile-sidebar";

// Utility hooks defined in this directory
export { useDebounce } from "./use-debounce";
export { useLocalStorage } from "./use-local-storage";
export { useMediaQuery } from "./use-media-query";
