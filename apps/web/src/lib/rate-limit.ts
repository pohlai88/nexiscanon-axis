/**
 * Rate limiting utilities.
 *
 * Pattern: In-memory rate limiting for API routes.
 *
 * NOTE: This is a simple in-memory implementation suitable for single-server deployments.
 * For production with multiple instances, use Redis or a distributed cache.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store (cleared on server restart)
const store = new Map<string, RateLimitEntry>();

// Cleanup old entries periodically
const CLEANUP_INTERVAL = 60 * 1000; // 1 minute
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;

  lastCleanup = now;
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) {
      store.delete(key);
    }
  }
}

export interface RateLimitConfig {
  /** Max requests in the window */
  limit: number;
  /** Window size in seconds */
  windowSeconds: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

/**
 * Check rate limit for a key.
 *
 * @param key Unique identifier (IP, user ID, API key, etc.)
 * @param config Rate limit configuration
 * @returns Rate limit result
 *
 * @example
 * ```ts
 * const result = checkRateLimit(ip, { limit: 100, windowSeconds: 60 });
 * if (!result.success) {
 *   return new Response("Too Many Requests", { status: 429 });
 * }
 * ```
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  cleanup();

  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;
  const resetAt = now + windowMs;

  const entry = store.get(key);

  // No existing entry or window expired
  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt });
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      resetAt,
    };
  }

  // Within window
  entry.count += 1;

  if (entry.count > config.limit) {
    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Preset rate limit configurations.
 */
export const RateLimits = {
  /** Strict: 10 requests per minute (auth endpoints) */
  STRICT: { limit: 10, windowSeconds: 60 },

  /** Standard: 100 requests per minute (general API) */
  STANDARD: { limit: 100, windowSeconds: 60 },

  /** Relaxed: 1000 requests per minute (high-traffic endpoints) */
  RELAXED: { limit: 1000, windowSeconds: 60 },
} as const;

/**
 * Get client IP from request headers.
 */
export function getClientIP(request: Request): string {
  // Check common headers (in order of priority)
  const headers = request.headers;

  // Cloudflare
  const cfIP = headers.get("cf-connecting-ip");
  if (cfIP) return cfIP;

  // Standard proxy headers
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }

  const realIP = headers.get("x-real-ip");
  if (realIP) return realIP;

  // Fallback
  return "unknown";
}

/**
 * Add rate limit headers to response.
 */
export function addRateLimitHeaders(
  response: Response,
  result: RateLimitResult
): Response {
  const headers = new Headers(response.headers);
  headers.set("X-RateLimit-Limit", String(result.limit));
  headers.set("X-RateLimit-Remaining", String(result.remaining));
  headers.set("X-RateLimit-Reset", String(Math.ceil(result.resetAt / 1000)));

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Create a rate-limited handler wrapper.
 *
 * @example
 * ```ts
 * const handler = withRateLimit(
 *   async (request) => {
 *     return NextResponse.json({ data: "..." });
 *   },
 *   RateLimits.STANDARD
 * );
 *
 * export const GET = handler;
 * ```
 */
export function withRateLimit<T extends Request>(
  handler: (request: T) => Promise<Response>,
  config: RateLimitConfig = RateLimits.STANDARD
): (request: T) => Promise<Response> {
  return async (request: T) => {
    const ip = getClientIP(request);
    const result = checkRateLimit(ip, config);

    if (!result.success) {
      const response = new Response(
        JSON.stringify({
          error: "Too Many Requests",
          retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: { "Content-Type": "application/json" },
        }
      );
      return addRateLimitHeaders(response, result);
    }

    const response = await handler(request);
    return addRateLimitHeaders(response, result);
  };
}
