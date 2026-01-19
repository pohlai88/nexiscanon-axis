import { signupHandler } from "@workspace/auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/auth/signup
 * 
 * Creates a new user account
 * 
 * Request body:
 * {
 *   email: string,
 *   password: string,
 *   confirmPassword: string
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   message: "Account created. Check your email to verify."
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Call handler from @repo/auth/handlers
    // TODO: Implement database integration in handler
    const result = await signupHandler(body);
    
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Signup failed";
    return NextResponse.json(
      { message, code: "SIGNUP_ERROR" },
      { status: 400 }
    );
  }
}
