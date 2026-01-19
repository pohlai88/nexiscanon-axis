import { NextResponse } from "next/server";

/**
 * GET /api/health
 * Use for: liveness/readiness probes, load balancers, monitoring.
 */
export async function GET() {
  return NextResponse.json(
    { status: "ok", timestamp: new Date().toISOString() },
    { status: 200 }
  );
}
