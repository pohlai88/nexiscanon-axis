/**
 * Tenant resolution result.
 */
export interface TenantResolution {
  /** Tenant slug from URL path */
  slug: string;

  /** Tenant ID from database (null if not validated) */
  tenantId: string | null;

  /** Whether tenant was found and is valid */
  isValid: boolean;

  /** Error message if resolution failed */
  error?: string;
}

/**
 * Reserved slugs that cannot be used as tenant names.
 */
const RESERVED_SLUGS = new Set([
  "api",
  "auth",
  "login",
  "register",
  "logout",
  "admin",
  "settings",
  "app",
  "www",
  "docs",
  "help",
  "support",
  "billing",
  "dashboard",
  "_next",
  "static",
]);

/**
 * Validate tenant slug format.
 * Must be lowercase alphanumeric with optional hyphens.
 */
function isValidSlugFormat(slug: string): boolean {
  return /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/.test(slug);
}

/**
 * Resolve tenant from URL path.
 *
 * @param pathname - URL pathname (e.g., "/acme/dashboard")
 * @returns Tenant resolution result
 */
export function resolveTenant(pathname: string): TenantResolution {
  const segments = pathname.split("/").filter(Boolean);
  const slug = segments[0]?.toLowerCase();

  if (!slug) {
    return {
      slug: "",
      tenantId: null,
      isValid: false,
      error: "No tenant slug in path",
    };
  }

  if (RESERVED_SLUGS.has(slug)) {
    return {
      slug,
      tenantId: null,
      isValid: false,
      error: `"${slug}" is a reserved path`,
    };
  }

  if (!isValidSlugFormat(slug)) {
    return {
      slug,
      tenantId: null,
      isValid: false,
      error: "Invalid tenant slug format",
    };
  }

  // TODO: Validate tenant exists in DB via @axis/db
  // For now, return as valid (will be validated in middleware with DB access)
  return {
    slug,
    tenantId: null, // Will be set after DB lookup
    isValid: true,
  };
}
