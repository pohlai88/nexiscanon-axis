import { NextRequest, NextResponse } from "next/server";
import { authProtection, isArcjetConfigured } from "@/lib/arcjet";
import {
  checkRateLimit,
  getClientIP,
  addRateLimitHeaders,
  RateLimits,
} from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

/**
 * Neon Auth proxy route.
 *
 * Forwards auth requests to Neon Auth service.
 * This allows the frontend to call /api/auth/* which proxies to Neon Auth.
 *
 * Protection:
 * - Arcjet: Rate limiting + bot detection + shield (if configured)
 * - Fallback: In-memory rate limiting
 */

const NEON_AUTH_URL = process.env.NEON_AUTH_BASE_URL;

async function handler(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? "unknown";
  const log = logger.child({ requestId, endpoint: "/api/auth" });

  // Use Arcjet if configured, otherwise fall back to in-memory rate limiting
  if (isArcjetConfigured()) {
    const decision = await authProtection.protect(request);

    if (decision.isDenied()) {
      log.warn("Auth request denied by Arcjet", {
        reason: decision.reason,
        ip: request.headers.get("x-forwarded-for"),
      });

      if (decision.reason.isRateLimit()) {
        return NextResponse.json(
          { error: "Too Many Requests" },
          { status: 429 }
        );
      }
      if (decision.reason.isBot()) {
        return NextResponse.json(
          { error: "Bot detected" },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { error: "Request denied" },
        { status: 403 }
      );
    }
  } else {
    // Fallback: In-memory rate limiting
    const ip = getClientIP(request);
    const rateLimitResult = checkRateLimit(`auth:${ip}`, RateLimits.STRICT);

    if (!rateLimitResult.success) {
      const response = NextResponse.json(
        {
          error: "Too Many Requests",
          retryAfter: Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000),
        },
        { status: 429 }
      );
      return addRateLimitHeaders(response, rateLimitResult);
    }
  }

  if (!NEON_AUTH_URL) {
    return NextResponse.json(
      { error: "NEON_AUTH_BASE_URL not configured" },
      { status: 500 }
    );
  }

  // Get the path after /api/auth/
  const pathname = request.nextUrl.pathname.replace("/api/auth", "");
  const targetUrl = `${NEON_AUTH_URL}${pathname}${request.nextUrl.search}`;

  try {
    // Forward the request to Neon Auth
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: {
        "Content-Type": request.headers.get("Content-Type") || "application/json",
        Cookie: request.headers.get("Cookie") || "",
      },
      body: request.method !== "GET" ? await request.text() : undefined,
    });

    // Get response body
    const body = await response.text();

    // Create response with proper headers
    const proxyResponse = new NextResponse(body, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "application/json",
      },
    });

    // Forward Set-Cookie headers
    const setCookie = response.headers.get("Set-Cookie");
    if (setCookie) {
      proxyResponse.headers.set("Set-Cookie", setCookie);
    }

    return proxyResponse;
  } catch (error) {
    log.error("Auth proxy error", error);
    return NextResponse.json(
      { error: "Auth service unavailable" },
      { status: 502 }
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
