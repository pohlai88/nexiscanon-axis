import { NextRequest, NextResponse } from "next/server";
import {
  checkRateLimit,
  getClientIP,
  addRateLimitHeaders,
  RateLimits,
} from "@/lib/rate-limit";

/**
 * Neon Auth proxy route.
 *
 * Forwards auth requests to Neon Auth service.
 * This allows the frontend to call /api/auth/* which proxies to Neon Auth.
 *
 * Rate limited: 10 requests per minute per IP (STRICT).
 */

const NEON_AUTH_URL = process.env.NEON_AUTH_BASE_URL;

async function handler(request: NextRequest) {
  // Rate limit auth endpoints (prevent brute force)
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
    console.error("Auth proxy error:", error);
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
