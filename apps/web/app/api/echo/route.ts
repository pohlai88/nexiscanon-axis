import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/echo
 * Example: parse JSON body, validate, return JSON.
 * Use Route Handlers for: webhooks, REST APIs, non-UI responses.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (typeof body?.message !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'message' (string)" },
        { status: 400 }
      );
    }

    return NextResponse.json({ echoed: body.message }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }
}
