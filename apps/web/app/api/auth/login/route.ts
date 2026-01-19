import { loginHandler } from "@workspace/auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/auth/login
 * 
 * Authenticates a user with email and password
 * 
 * Request body:
 * {
 *   email: string,
 *   password: string
 * }
 * 
 * Response:
 * {
 *   user: { id, email, name?, emailVerified? },
 *   token: string,
 *   expiresAt?: number
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Call handler from @repo/auth/handlers
    // TODO: Implement database integration in handler
    await loginHandler(body);
    
    // If we reach here, handler will have thrown since it's not implemented
    // For now, return a placeholder response
    return NextResponse.json(
      { message: "Login handler not implemented" },
      { status: 501 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed";
    return NextResponse.json(
      { message, code: "LOGIN_ERROR" },
      { status: 400 }
    );
  }
}
