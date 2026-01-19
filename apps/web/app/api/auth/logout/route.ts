import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/auth/logout
 * 
 * Logs out the current user by clearing the auth token
 * 
 * Response:
 * {
 *   success: true
 * }
 */
export async function POST(_req: NextRequest) {
  try {
    // Clear auth cookie
    const response = NextResponse.json({ success: true }, { status: 200 });
    response.cookies.delete("auth-token");
    
    // TODO: Invalidate token in database/blacklist if using JWT
    
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Logout failed";
    return NextResponse.json(
      { message, code: "LOGOUT_ERROR" },
      { status: 400 }
    );
  }
}
