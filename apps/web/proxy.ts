import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Proxy runs before routes. Use for: auth, redirects, rewrites, headers.
 * (Renamed from middleware in Next.js 16.)
 * Restrict with matcher to avoid running on static assets and _next.
 */
export function proxy(_request: NextRequest) {
  const res = NextResponse.next();

  // Example: add a header for downstream (e.g. region, request-id)
  res.headers.set("x-request-id", crypto.randomUUID());

  return res;
}

export const config = {
  matcher: [
    /*
     * Exclude: api, _next, static files, favicon, common metadata.
     * Match all other pathnames.
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
