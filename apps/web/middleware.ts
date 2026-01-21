import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

/**
 * Middleware for tenant resolution and auth protection.
 * 
 * Path-based multi-tenancy pattern (Vercel style):
 * - /[tenant]/* routes are protected
 * - Tenant slug is extracted from URL path
 * - Integrates with Neon Auth for authentication
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes - skip auth check (note: some require auth but handle it themselves)
  const publicRoutes = ["/", "/login", "/register"];
  const authHandledRoutes = ["/onboarding", "/invite", "/account", "/forgot-password", "/reset-password"];
  
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }
  
  // Routes that handle their own auth
  if (authHandledRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // API routes - handle separately
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Extract tenant from path (e.g., /acme/dashboard -> acme)
  const pathSegments = pathname.split("/").filter(Boolean);
  const tenantSlug = pathSegments[0]?.toLowerCase();

  // Skip if no tenant segment or is a reserved route
  if (!tenantSlug || RESERVED_SLUGS.has(tenantSlug)) {
    return NextResponse.next();
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

  // Pass tenant slug to server components via header
  response.headers.set("x-tenant-slug", tenantSlug);

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
