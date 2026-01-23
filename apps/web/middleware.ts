import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Generate a short unique request ID.
 * Used for log correlation across the request lifecycle.
 */
function generateRequestId(): string {
  return crypto.randomUUID().slice(0, 8);
}

// Reserved slugs that cannot be tenant names
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
  "_next",
  "static",
  "favicon.ico",
]);

// Root domains (no tenant context)
const ROOT_DOMAINS = new Set([
  "localhost:3000",
  "localhost:3001",
  "localhost:3002",
  "127.0.0.1:3000",
  process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "nexuscanon.com",
]);

/**
 * Extract subdomain from hostname.
 * Handles: tenant.domain.com, tenant.localhost:3000, etc.
 *
 * Pattern inspired by Vercel Platforms:
 * @see https://github.com/vercel/platforms
 */
function getSubdomain(request: NextRequest): string | null {
  const host = request.headers.get("host") ?? "";

  // Check for Vercel preview deployments
  const vercelUrl = request.headers.get("x-forwarded-host");
  if (vercelUrl?.includes(".vercel.app")) {
    return null; // No subdomain on preview deployments
  }

  // Check if it's a root domain (no subdomain)
  for (const rootDomain of ROOT_DOMAINS) {
    if (host === rootDomain || host === `www.${rootDomain}`) {
      return null;
    }
  }

  // Extract subdomain: tenant.domain.com -> tenant
  const parts = host.split(".");

  // Handle localhost:port (tenant.localhost:3000)
  if (host.includes("localhost")) {
    if (parts.length >= 2 && parts[0] !== "www") {
      return parts[0] ?? null;
    }
    return null;
  }

  // Handle production domain (tenant.domain.com)
  if (parts.length >= 3 && parts[0] !== "www") {
    return parts[0] ?? null;
  }

  return null;
}

/**
 * Middleware for tenant resolution and auth protection.
 *
 * Hybrid multi-tenancy pattern (Vercel style + path-based):
 * - Supports both /[tenant]/* paths AND tenant.domain.com subdomains
 * - Tenant slug is extracted from URL path OR subdomain
 * - Integrates with Neon Auth for authentication
 *
 * @see https://github.com/vercel/platforms
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const subdomain = getSubdomain(request);

  // Generate request ID for log correlation
  const requestId = request.headers.get("x-request-id") ?? generateRequestId();

  // Public routes - skip auth check (note: some require auth but handle it themselves)
  const publicRoutes = ["/", "/login", "/register"];
  const authHandledRoutes = ["/onboarding", "/invite", "/account", "/forgot-password", "/reset-password"];

  // Helper to add request ID to response
  const addRequestIdHeader = (response: NextResponse) => {
    response.headers.set("x-request-id", requestId);
    return response;
  };

  if (publicRoutes.includes(pathname)) {
    return addRequestIdHeader(NextResponse.next());
  }

  // Routes that handle their own auth
  if (authHandledRoutes.some(route => pathname.startsWith(route))) {
    return addRequestIdHeader(NextResponse.next());
  }

  // API routes - handle separately
  if (pathname.startsWith("/api/")) {
    return addRequestIdHeader(NextResponse.next());
  }

  // Determine tenant from subdomain or path
  let tenantSlug: string | null = null;
  let isSubdomainAccess = false;

  // Priority 1: Subdomain-based tenant (tenant.domain.com)
  if (subdomain && !RESERVED_SLUGS.has(subdomain)) {
    tenantSlug = subdomain;
    isSubdomainAccess = true;
  }

  // Priority 2: Path-based tenant (/tenant/*)
  if (!tenantSlug) {
    const pathSegments = pathname.split("/").filter(Boolean);
    const pathTenant = pathSegments[0]?.toLowerCase();

    if (pathTenant && !RESERVED_SLUGS.has(pathTenant)) {
      tenantSlug = pathTenant;
    }
  }

  // No tenant context - skip tenant auth
  if (!tenantSlug) {
    return addRequestIdHeader(NextResponse.next());
  }

  // Validate tenant slug format (alphanumeric + hyphens)
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/.test(tenantSlug)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Check for session cookie (Neon Auth uses 'better-auth.session_token')
  const sessionToken = request.cookies.get("better-auth.session_token")?.value;

  // Enforce authentication on tenant routes
  if (!sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();

  // Add request ID for log correlation
  response.headers.set("x-request-id", requestId);

  // Pass tenant context to server components via headers
  response.headers.set("x-tenant-slug", tenantSlug);
  response.headers.set("x-tenant-access", isSubdomainAccess ? "subdomain" : "path");

  // If authenticated, pass session info
  if (sessionToken) {
    response.headers.set("x-has-session", "true");
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
