/**
 * Utility Functions
 *
 * This directory contains reusable utility functions.
 * These are pure functions with no side effects.
 *
 * Pattern:
 * - Utilities are organized by domain (formatters, validators, etc.)
 * - All exports are tree-shakeable
 * - No React dependencies (use lib/hooks for React utilities)
 *
 * @example
 * ```ts
 * import { formatDate, formatCurrency, cn } from "@/lib/utils";
 * ```
 */

// Re-export utilities organized by domain

// Subdomain utilities (already exists at lib/subdomain.ts)
export {
  getRootDomain,
  getTenantSubdomainUrl,
  getTenantPathUrl,
  isSubdomainAvailable,
  LOCAL_SUBDOMAIN_INSTRUCTIONS,
} from "@/lib/subdomain";

// Rate limiting utilities (already exists at lib/rate-limit.ts)
export {
  checkRateLimit,
  getClientIP,
  addRateLimitHeaders,
  withRateLimit,
  RateLimits,
  type RateLimitConfig,
  type RateLimitResult,
} from "@/lib/rate-limit";

// Formatters
export { formatDate, formatRelativeTime, formatCurrency, formatNumber } from "./formatters";

// Validators
export { isValidEmail, isValidSlug, isValidUrl, slugify } from "./validators";

// Classname utility (re-exported from design system for convenience)
export { cn } from "./cn";
