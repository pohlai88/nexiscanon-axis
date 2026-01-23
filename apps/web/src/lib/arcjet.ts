/**
 * Arcjet security configuration.
 *
 * Pattern: Centralized security rules for rate limiting, bot protection,
 * email validation, and attack detection.
 *
 * Reference: https://docs.arcjet.com
 *
 * Features:
 * - Distributed rate limiting (works across serverless instances)
 * - Bot detection (ML-based, blocks AI scrapers)
 * - Email validation (blocks disposable emails, validates MX)
 * - Shield (WAF for SQL injection, XSS detection)
 */

import arcjet, {
  detectBot,
  fixedWindow,
  shield,
  slidingWindow,
  tokenBucket,
  validateEmail,
} from "@arcjet/next";

// Initialize Arcjet client
// ARCJET_KEY is automatically read from environment
const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  characteristics: ["ip.src"], // Rate limit by IP address
  rules: [],
});

/**
 * Base Arcjet client for custom rule composition.
 */
export { aj as arcjet };

// =============================================================================
// Pre-configured Security Rules
// =============================================================================

/**
 * Auth endpoint protection.
 * - Strict rate limiting: 10 requests per minute
 * - Bot detection: Block automated clients
 * - Shield: Detect attacks
 */
export const authProtection = aj.withRule(
  fixedWindow({
    mode: "LIVE",
    window: "1m",
    max: 10,
  })
).withRule(
  detectBot({
    mode: "LIVE",
    allow: [], // Block all bots on auth endpoints
  })
).withRule(
  shield({
    mode: "LIVE",
  })
);

/**
 * API endpoint protection.
 * - Standard rate limiting: 100 requests per minute
 * - Shield: Detect attacks
 */
export const apiProtection = aj.withRule(
  fixedWindow({
    mode: "LIVE",
    window: "1m",
    max: 100,
  })
).withRule(
  shield({
    mode: "LIVE",
  })
);

/**
 * Relaxed API protection for high-traffic endpoints.
 * - Higher rate limit: 1000 requests per minute
 */
export const relaxedApiProtection = aj.withRule(
  fixedWindow({
    mode: "LIVE",
    window: "1m",
    max: 1000,
  })
);

/**
 * Email validation for registration/signup.
 * - Blocks disposable email providers
 * - Validates MX records
 * - Checks for typos in common domains
 */
export const emailValidation = aj.withRule(
  validateEmail({
    mode: "LIVE",
    deny: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
    requireTopLevelDomain: true,
    allowDomainLiteral: false,
  })
);

/**
 * Registration endpoint protection (combines all).
 * - Email validation
 * - Strict rate limiting
 * - Bot detection
 * - Shield
 */
export const registrationProtection = aj.withRule(
  validateEmail({
    mode: "LIVE",
    deny: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
    requireTopLevelDomain: true,
    allowDomainLiteral: false,
  })
).withRule(
  fixedWindow({
    mode: "LIVE",
    window: "1m",
    max: 5, // Very strict for registration
  })
).withRule(
  detectBot({
    mode: "LIVE",
    allow: [], // Block all bots
  })
).withRule(
  shield({
    mode: "LIVE",
  })
);

/**
 * Token bucket for authenticated users.
 * Higher limits with burst capacity.
 */
export const authenticatedProtection = aj.withRule(
  tokenBucket({
    mode: "LIVE",
    refillRate: 10, // 10 tokens per interval
    interval: "10s",
    capacity: 100, // Burst capacity
  })
).withRule(
  shield({
    mode: "LIVE",
  })
);

/**
 * Webhook protection (Stripe, etc.).
 * - No bot detection (webhooks are automated)
 * - Higher rate limits
 * - Shield enabled
 */
export const webhookProtection = aj.withRule(
  fixedWindow({
    mode: "LIVE",
    window: "1m",
    max: 500,
  })
).withRule(
  shield({
    mode: "LIVE",
  })
);

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Check if Arcjet is configured.
 */
export function isArcjetConfigured(): boolean {
  return !!process.env.ARCJET_KEY;
}

/**
 * Create a custom rate limit rule.
 */
export function createRateLimit(options: {
  window: "1s" | "10s" | "1m" | "10m" | "1h";
  max: number;
  mode?: "LIVE" | "DRY_RUN";
}) {
  return aj.withRule(
    fixedWindow({
      mode: options.mode ?? "LIVE",
      window: options.window,
      max: options.max,
    })
  );
}

/**
 * Create sliding window rate limit (smoother distribution).
 */
export function createSlidingRateLimit(options: {
  window: "1s" | "10s" | "1m" | "10m" | "1h";
  max: number;
  mode?: "LIVE" | "DRY_RUN";
}) {
  return aj.withRule(
    slidingWindow({
      mode: options.mode ?? "LIVE",
      interval: options.window,
      max: options.max,
    })
  );
}
