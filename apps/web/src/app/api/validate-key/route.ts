/**
 * API key validation endpoint.
 *
 * Pattern: Validate API keys for programmatic access.
 * Used by external services to authenticate requests.
 *
 * Rate limited: 100 requests per minute per IP (STANDARD).
 */

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { validateApiKey } from "@/lib/actions/api-keys";
import {
  checkRateLimit,
  getClientIP,
  addRateLimitHeaders,
  RateLimits,
} from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  // Rate limit
  const ip = getClientIP(request);
  const rateLimitResult = checkRateLimit(`validate-key:${ip}`, RateLimits.STANDARD);

  if (!rateLimitResult.success) {
    const response = NextResponse.json(
      {
        valid: false,
        error: "Too Many Requests",
        retryAfter: Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000),
      },
      { status: 429 }
    );
    return addRateLimitHeaders(response, rateLimitResult);
  }

  try {
    const body = await request.json();
    const { apiKey } = body;

    if (!apiKey || typeof apiKey !== "string") {
      return NextResponse.json(
        { valid: false, error: "API key is required" },
        { status: 400 }
      );
    }

    // Extract prefix for lookup
    const prefix = apiKey.slice(0, 10);

    // Find key by prefix
    const keys = await query(async (sql) => {
      return sql`
        SELECT ak.id, ak.key_hash, ak.tenant_id, ak.scopes, ak.expires_at,
               t.slug as tenant_slug, t.name as tenant_name, t.status as tenant_status
        FROM api_keys ak
        JOIN tenants t ON t.id = ak.tenant_id
        WHERE ak.key_prefix = ${prefix}
        LIMIT 1
      `;
    });

    const keyRecord = keys[0];

    if (!keyRecord) {
      return NextResponse.json(
        { valid: false, error: "Invalid API key" },
        { status: 401 }
      );
    }

    // Validate hash
    const isValid = await validateApiKey(apiKey, keyRecord.key_hash as string);

    if (!isValid) {
      return NextResponse.json(
        { valid: false, error: "Invalid API key" },
        { status: 401 }
      );
    }

    // Check expiration
    if (keyRecord.expires_at) {
      const expiresAt = new Date(keyRecord.expires_at as string);
      if (expiresAt < new Date()) {
        return NextResponse.json(
          { valid: false, error: "API key has expired" },
          { status: 401 }
        );
      }
    }

    // Check tenant status
    if (keyRecord.tenant_status !== "active") {
      return NextResponse.json(
        { valid: false, error: "Workspace is not active" },
        { status: 403 }
      );
    }

    // Update last used timestamp
    await query(async (sql) => {
      return sql`
        UPDATE api_keys
        SET last_used_at = now()
        WHERE id = ${keyRecord.id}::uuid
      `;
    });

    return NextResponse.json({
      valid: true,
      tenant: {
        id: keyRecord.tenant_id as string,
        slug: keyRecord.tenant_slug as string,
        name: keyRecord.tenant_name as string,
      },
      scopes: (keyRecord.scopes as string[]) ?? [],
    });
  } catch (error) {
    console.error("Validate API key error:", error);
    return NextResponse.json(
      { valid: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
