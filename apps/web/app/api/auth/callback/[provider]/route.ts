// apps/web/app/api/auth/callback/[provider]/route.ts
// OAuth callback handler - Neon Auth integration
//
// ARCHITECTURE: Handles OAuth callbacks from providers (Google, GitHub)
// Exchanges auth code with Neon Auth and redirects to app

import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/auth/callback/:provider
 *
 * Handles OAuth callback from providers.
 * Neon Auth manages the OAuth flow; this route just redirects appropriately.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const searchParams = request.nextUrl.searchParams;

  // Get callback parameters
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const state = searchParams.get("state");

  // Handle OAuth errors
  if (error) {
    const errorDescription =
      searchParams.get("error_description") || "OAuth authentication failed";
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorDescription)}`, request.url)
    );
  }

  // No code means invalid callback
  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=Invalid+OAuth+callback", request.url)
    );
  }

  const neonAuthUrl = process.env.NEON_AUTH_BASE_URL;

  if (!neonAuthUrl) {
    return NextResponse.redirect(
      new URL("/login?error=Auth+not+configured", request.url)
    );
  }

  try {
    // Forward to Neon Auth OAuth callback handler
    const callbackUrl = new URL(`${neonAuthUrl}/api/auth/callback/${provider}`);
    callbackUrl.searchParams.set("code", code);
    if (state) {
      callbackUrl.searchParams.set("state", state);
    }

    // Redirect to Neon Auth callback which will set cookies and redirect back
    return NextResponse.redirect(callbackUrl.toString());
  } catch {
    return NextResponse.redirect(
      new URL("/login?error=OAuth+callback+failed", request.url)
    );
  }
}
