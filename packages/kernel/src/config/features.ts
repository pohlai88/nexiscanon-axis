/**
 * Feature flags for AXIS ERP.
 * Can be extended with runtime config (e.g., LaunchDarkly, Vercel Edge Config).
 */
export interface FeatureFlags {
  /** Enable multi-tenant features */
  multiTenant: boolean;

  /** Enable Neon Auth integration */
  neonAuth: boolean;

  /** Enable billing/subscription features */
  billing: boolean;

  /** Enable team invitations */
  teamInvites: boolean;

  /** Enable audit logging */
  auditLog: boolean;
}

/**
 * Default feature flags.
 * Override via environment or runtime config.
 */
export const features: FeatureFlags = {
  multiTenant: true,
  neonAuth: true,
  billing: false, // Phase 2
  teamInvites: true,
  auditLog: false, // Phase 2
};
