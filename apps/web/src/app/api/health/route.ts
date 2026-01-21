/**
 * Health check endpoint.
 *
 * Pattern: Used by deployment platforms to verify app is running.
 * Returns database connectivity status.
 */

import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  version: string;
  checks: {
    database: "ok" | "error";
    auth: "ok" | "error";
  };
  errors?: string[];
}

export async function GET() {
  const errors: string[] = [];
  let dbStatus: "ok" | "error" = "ok";
  let authStatus: "ok" | "error" = "ok";

  // Check database connectivity
  try {
    await query(async (sql) => {
      return sql`SELECT 1 as health_check`;
    });
  } catch (error) {
    dbStatus = "error";
    errors.push(`Database: ${error instanceof Error ? error.message : "Connection failed"}`);
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
    checks: {
      database: dbStatus,
      auth: authStatus,
    },
  };

  if (errors.length > 0) {
    response.errors = errors;
  }

  const httpStatus = status === "unhealthy" ? 503 : 200;

  return NextResponse.json(response, { status: httpStatus });
}
