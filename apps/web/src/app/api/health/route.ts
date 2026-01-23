/**
 * Health check endpoint.
 *
 * Pattern: Used by deployment platforms to verify app is running.
 * Returns database connectivity status and basic metrics.
 *
 * Compatible with:
 * - Vercel health checks
 * - BetterStack uptime monitoring
 * - Kubernetes liveness/readiness probes
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { query } from "@/lib/db";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: { status: "ok" | "error"; latencyMs?: number };
    auth: { status: "ok" | "error" };
  };
  environment: string;
  region?: string;
  errors?: string[];
}

// Track process start time for uptime calculation
const startTime = Date.now();

export async function GET(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? "unknown";
  const log = logger.child({ requestId, endpoint: "/api/health" });

  const errors: string[] = [];
  let dbStatus: "ok" | "error" = "ok";
  let dbLatencyMs: number | undefined;
  let authStatus: "ok" | "error" = "ok";

  // Check database connectivity with latency measurement
  const dbStart = performance.now();
  try {
    await query(async (sql) => {
      return sql`SELECT 1 as health_check`;
    });
    dbLatencyMs = Math.round(performance.now() - dbStart);
  } catch (error) {
    dbStatus = "error";
    dbLatencyMs = Math.round(performance.now() - dbStart);
    errors.push(`Database: ${error instanceof Error ? error.message : "Connection failed"}`);
    log.error("Database health check failed", error);
  }

  // Check auth configuration
  if (!process.env.NEON_AUTH_BASE_URL) {
    authStatus = "error";
    errors.push("Auth: NEON_AUTH_BASE_URL not configured");
  }

  // Determine overall status
  let status: HealthStatus["status"] = "healthy";
  if (dbStatus === "error") {
    status = "unhealthy";
  } else if (authStatus === "error") {
    status = "degraded";
  }

  const response: HealthStatus = {
    status,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? "0.0.1",
    uptime: Math.round((Date.now() - startTime) / 1000),
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development",
    region: process.env.VERCEL_REGION,
    checks: {
      database: { status: dbStatus, latencyMs: dbLatencyMs },
      auth: { status: authStatus },
    },
  };

  if (errors.length > 0) {
    response.errors = errors;
  }

  const httpStatus = status === "unhealthy" ? 503 : 200;

  // Log health check result
  log.info("Health check completed", {
    status,
    dbLatencyMs,
    httpStatus,
  });

  return NextResponse.json(response, {
    status: httpStatus,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "X-Request-Id": requestId,
    },
  });
}
