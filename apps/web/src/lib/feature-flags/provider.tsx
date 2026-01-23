"use client";

/**
 * Feature Flags React Provider
 *
 * Provides feature flag context to client components.
 * Flags are passed from server components to avoid client-side fetching.
 */

import { createContext, useContext, type ReactNode } from "react";
import { type FeatureFlag, FLAGS } from "./index";

type FlagValues = Record<FeatureFlag, boolean>;

interface FeatureFlagsContextValue {
  flags: FlagValues;
  isEnabled: (flag: FeatureFlag) => boolean;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextValue | null>(null);

interface FeatureFlagsProviderProps {
  children: ReactNode;
  flags?: Partial<FlagValues>;
}

/**
 * Provider component for feature flags.
 *
 * Usage in layout:
 * ```tsx
 * <FeatureFlagsProvider flags={await getServerFlags()}>
 *   {children}
 * </FeatureFlagsProvider>
 * ```
 */
export function FeatureFlagsProvider({
  children,
  flags: overrides = {},
}: FeatureFlagsProviderProps) {
  // Merge defaults with overrides
  const flags = { ...FLAGS, ...overrides } as FlagValues;

  const value: FeatureFlagsContextValue = {
    flags,
    isEnabled: (flag: FeatureFlag) => flags[flag] ?? false,
  };

  return (
    <FeatureFlagsContext.Provider value={value}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

/**
 * Hook to access feature flags in client components.
 *
 * Usage:
 * ```tsx
 * const { isEnabled } = useFeatureFlags();
 * if (isEnabled("DARK_MODE_ENABLED")) { ... }
 * ```
 */
export function useFeatureFlags(): FeatureFlagsContextValue {
  const context = useContext(FeatureFlagsContext);

  if (!context) {
    // Return defaults if no provider (SSR safety)
    return {
      flags: FLAGS as FlagValues,
      isEnabled: (flag: FeatureFlag) => FLAGS[flag] ?? false,
    };
  }

  return context;
}

/**
 * Component that conditionally renders based on a feature flag.
 *
 * Usage:
 * ```tsx
 * <FeatureGate flag="AI_ASSISTANT_ENABLED">
 *   <AIAssistant />
 * </FeatureGate>
 * ```
 */
interface FeatureGateProps {
  flag: FeatureFlag;
  children: ReactNode;
  fallback?: ReactNode;
}

export function FeatureGate({ flag, children, fallback = null }: FeatureGateProps) {
  const { isEnabled } = useFeatureFlags();

  if (!isEnabled(flag)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
