import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/users/[id]
 * Dynamic Route Handler: params is a Promise in Next.js 15+.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // In real apps: fetch from DB. For demo, return id.
  return NextResponse.json({ id, name: `User ${id}` }, { status: 200 });
}
