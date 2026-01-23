"use client";

/**
 * Root Providers
 *
 * Consolidates all client-side providers into a single component.
 * Inspired by Liveblocks' Providers.tsx pattern.
 *
 * Pattern:
 * - All providers are composed here
 * - Order matters: outermost providers wrap innermost
 * - Server data can be passed as props for hydration
 *
 * @example
 * ```tsx
 * // app/layout.tsx
 * <Providers>
 *   {children}
 * </Providers>
 * ```
 */

import { type ReactNode } from "react";
import { ThemeProvider } from "./theme-provider";
import { NotificationProvider } from "./notifications";
import { FeatureFlagsProvider } from "@/lib/feature-flags/provider";
import type { FeatureFlag } from "@/lib/feature-flags";

interface ProvidersProps {
  children: ReactNode;
  /**
   * Optional feature flags from server.
   * If not provided, defaults are used.
   */
  featureFlags?: Partial<Record<FeatureFlag, boolean>>;
  /**
   * Optional default theme.
   * If not provided, system preference is used.
   */
  defaultTheme?: "light" | "dark" | "system";
}

/**
 * Root providers wrapper.
 *
 * Composition order (outermost → innermost):
 * 1. ThemeProvider - Theme must be available first
 * 2. FeatureFlagsProvider - Feature checks available to all components
 * 3. NotificationProvider - Notifications available everywhere
 */
export function Providers({
  children,
  featureFlags,
  defaultTheme = "system",
}: ProvidersProps) {
  return (
    <ThemeProvider defaultTheme={defaultTheme}>
      <FeatureFlagsProvider flags={featureFlags}>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </FeatureFlagsProvider>
    </ThemeProvider>
  );
}
