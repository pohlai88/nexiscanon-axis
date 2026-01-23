/**
 * Validation Utilities
 *
 * Pure functions for validating and transforming strings.
 * For schema validation, use Zod from @axis/db/validation.
 */

/**
 * Validate an email address.
 *
 * @example
 * ```ts
 * isValidEmail("user@example.com") // true
 * isValidEmail("invalid") // false
 * ```
 */
export function isValidEmail(email: string): boolean {
  // RFC 5322 simplified regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate a URL-safe slug.
 *
 * Rules:
 * - Lowercase letters, numbers, hyphens only
 * - Must start with a letter
 * - No consecutive hyphens
 * - 1-63 characters
 *
 * @example
 * ```ts
 * isValidSlug("my-tenant") // true
 * isValidSlug("My_Tenant") // false
 * isValidSlug("123-start") // false (must start with letter)
 * ```
 */
export function isValidSlug(slug: string): boolean {
  if (slug.length === 0 || slug.length > 63) {
    return false;
  }

  // Must start with a letter
  if (!/^[a-z]/.test(slug)) {
    return false;
  }

  // Only lowercase, numbers, and single hyphens
  if (!/^[a-z][a-z0-9-]*$/.test(slug)) {
    return false;
  }

  // No consecutive hyphens
  if (/--/.test(slug)) {
    return false;
  }

  // No trailing hyphen
  if (slug.endsWith("-")) {
    return false;
  }

  return true;
}

/**
 * Validate a URL.
 *
 * @example
 * ```ts
 * isValidUrl("https://example.com") // true
 * isValidUrl("not-a-url") // false
 * ```
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Convert a string to a URL-safe slug.
 *
 * @example
 * ```ts
 * slugify("Hello World!") // "hello-world"
 * slugify("Acme Corp 123") // "acme-corp-123"
 * slugify("  Multiple   Spaces  ") // "multiple-spaces"
 * ```
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove non-word chars (except spaces and hyphens)
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-+/, "") // Trim leading hyphens
    .replace(/-+$/, ""); // Trim trailing hyphens
}
