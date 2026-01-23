/**
 * Subdomain utilities for local development.
 *
 * Pattern: Helper functions for subdomain-based multi-tenancy.
 * Inspired by Vercel Platforms.
 *
 * Local Development Setup:
 * 1. Edit hosts file to add: 127.0.0.1 tenant.localhost
 * 2. Or use *.localhost which works in most modern browsers
 *
 * @see https://github.com/vercel/platforms
 */

/**
 * Get the root domain for the current environment.
 */
export function getRootDomain(): string {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost:3000";
  }
  return process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? window.location.host;
}

/**
 * Build a subdomain URL for a tenant.
 */
export function getTenantSubdomainUrl(
  tenantSlug: string,
  path: string = ""
): string {
  const rootDomain = getRootDomain();
  const protocol = rootDomain.includes("localhost") ? "http" : "https";

  // Handle localhost with port
  if (rootDomain.includes("localhost")) {
    const [, port] = rootDomain.split(":");
    return `${protocol}://${tenantSlug}.localhost:${port ?? "3000"}${path}`;
  }

  return `${protocol}://${tenantSlug}.${rootDomain}${path}`;
}

/**
 * Build a path-based URL for a tenant.
 * Fallback when subdomains aren't available.
 */
export function getTenantPathUrl(tenantSlug: string, path: string = ""): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${baseUrl}/${tenantSlug}${path}`;
}

/**
 * Check if subdomain routing is available.
 * Subdomains may not work in some environments (e.g., Vercel preview).
 */
export function isSubdomainAvailable(): boolean {
  if (typeof window === "undefined") {
    // Server-side: check environment
    return process.env.SUBDOMAIN_ROUTING_ENABLED === "true";
  }

  // Client-side: check if we're on a subdomain already
  const host = window.location.host;
  const parts = host.split(".");

  // If host has 3+ parts (tenant.domain.com) or 2+ with localhost
  if (host.includes("localhost")) {
    return parts.length >= 2 && parts[0] !== "www";
  }

  return parts.length >= 3 && parts[0] !== "www";
}

/**
 * Instructions for local subdomain setup.
 */
export const LOCAL_SUBDOMAIN_INSTRUCTIONS = `
# Local Subdomain Setup (Optional)

Modern browsers support *.localhost subdomains natively.
Access tenants at: http://acme.localhost:3000

For custom domains, edit your hosts file:

## macOS/Linux:
sudo nano /etc/hosts

## Windows (as Administrator):
notepad C:\\Windows\\System32\\drivers\\etc\\hosts

Add lines like:
127.0.0.1 acme.localhost
127.0.0.1 demo.localhost

Or use path-based routing (default):
http://localhost:3000/acme
http://localhost:3000/demo
`;
