/**
 * Feature Flags System
 *
 * A simple, type-safe feature flag system that supports:
 * - Global flags (environment-based)
 * - Tenant-specific flags (stored in tenant settings)
 * - User-specific flags (stored in user settings)
 *
 * Pattern: Check flags at runtime without redeploying.
 */

import { query } from "@/lib/db";

/**
 * All available feature flags.
 * Add new flags here with their default values.
 */
export const FLAGS = {
  // Billing features
  BILLING_ENABLED: true,
  STRIPE_CHECKOUT_ENABLED: true,

  // Communication features
  EMAIL_NOTIFICATIONS_ENABLED: true,
  IN_APP_NOTIFICATIONS_ENABLED: false,

  // UI features
  DARK_MODE_ENABLED: true,
  COMMAND_PALETTE_ENABLED: true,
  ACTIVITY_FEED_ENABLED: true,

  // Multi-tenancy features
  SUBDOMAIN_ROUTING_ENABLED: false,
  TEAM_WORKSPACES_ENABLED: true,
  CUSTOM_DOMAIN_ENABLED: false,

  // Security features
  API_KEYS_ENABLED: true,
  AUDIT_LOG_ENABLED: true,
  TWO_FACTOR_AUTH_ENABLED: false,

  // Beta features
  BETA_FEATURES_ENABLED: false,
  AI_ASSISTANT_ENABLED: false,
  REAL_TIME_COLLABORATION_ENABLED: false,
} as const;

export type FeatureFlag = keyof typeof FLAGS;

/**
 * Feature flag context for evaluation.
 */
export interface FlagContext {
  tenantId?: string;
  userId?: string;
  plan?: string;
}

/**
 * Get the value of a feature flag.
 *
 * Priority order:
 * 1. Environment variable override (FEATURE_FLAG_NAME=true/false)
 * 2. Tenant-specific override (from tenant.settings.featureFlags)
 * 3. Default value from FLAGS constant
 */
export function getFlag(flag: FeatureFlag, _context?: FlagContext): boolean {
  // 1. Check environment variable override
  const envKey = `FEATURE_${flag}`;
  const envValue = process.env[envKey];
  if (envValue !== undefined) {
    return envValue === "true" || envValue === "1";
  }

  // 2. Default value (tenant/user overrides are async, use getFlagAsync)
  // Note: _context is available for future sync extensions
  return FLAGS[flag];
}

/**
 * Get the value of a feature flag with async tenant/user lookup.
 */
export async function getFlagAsync(
  flag: FeatureFlag,
  context?: FlagContext
): Promise<boolean> {
  // 1. Check environment variable override
  const envKey = `FEATURE_${flag}`;
  const envValue = process.env[envKey];
  if (envValue !== undefined) {
    return envValue === "true" || envValue === "1";
  }

  // 2. Check tenant-specific override
  if (context?.tenantId) {
    const tenantFlags = await getTenantFlags(context.tenantId);
    if (flag in tenantFlags) {
      return tenantFlags[flag] ?? FLAGS[flag];
    }
  }

  // 3. Plan-based flags
  if (context?.plan) {
    const planFlags = getPlanFlags(context.plan);
    if (flag in planFlags) {
      return planFlags[flag] ?? FLAGS[flag];
    }
  }

  // 4. Default value
  return FLAGS[flag];
}

/**
 * Get all flags with their current values.
 */
export function getAllFlags(context?: FlagContext): Record<FeatureFlag, boolean> {
  const result = {} as Record<FeatureFlag, boolean>;

  for (const flag of Object.keys(FLAGS) as FeatureFlag[]) {
    result[flag] = getFlag(flag, context);
  }

  return result;
}

/**
 * Check if a feature is enabled (convenience wrapper).
 */
export function isEnabled(flag: FeatureFlag, context?: FlagContext): boolean {
  return getFlag(flag, context);
}

/**
 * Check if a feature is enabled (async version).
 */
export async function isEnabledAsync(
  flag: FeatureFlag,
  context?: FlagContext
): Promise<boolean> {
  return getFlagAsync(flag, context);
}

// --- Internal helpers ---

/**
 * Get feature flag overrides for a tenant.
 */
async function getTenantFlags(
  tenantId: string
): Promise<Partial<Record<FeatureFlag, boolean>>> {
  try {
    const result = await query(async (sql) => {
      return sql`
        SELECT settings->'featureFlags' as flags
        FROM tenants
        WHERE id = ${tenantId}::uuid
        LIMIT 1
      `;
    });

    const flags = result[0]?.flags;
    if (flags && typeof flags === "object") {
      return flags as Partial<Record<FeatureFlag, boolean>>;
    }
  } catch {
    // Silently fail - use defaults
  }

  return {};
}

/**
 * Get feature flags based on subscription plan.
 */
function getPlanFlags(plan: string): Partial<Record<FeatureFlag, boolean>> {
  switch (plan) {
    case "professional":
      return {
        CUSTOM_DOMAIN_ENABLED: true,
        API_KEYS_ENABLED: true,
        AUDIT_LOG_ENABLED: true,
        TWO_FACTOR_AUTH_ENABLED: true,
      };
    case "starter":
      return {
        API_KEYS_ENABLED: true,
        AUDIT_LOG_ENABLED: true,
      };
    case "free":
    default:
      return {
        API_KEYS_ENABLED: false,
        AUDIT_LOG_ENABLED: false,
        CUSTOM_DOMAIN_ENABLED: false,
      };
  }
}

/**
 * React hook for feature flags (client-side).
 * Must be used within a component that has access to flag context.
 */
export function createFlagChecker(context?: FlagContext) {
  return {
    isEnabled: (flag: FeatureFlag) => getFlag(flag, context),
    getFlag: (flag: FeatureFlag) => getFlag(flag, context),
    getAllFlags: () => getAllFlags(context),
  };
}
