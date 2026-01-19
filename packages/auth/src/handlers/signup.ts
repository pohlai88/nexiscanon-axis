import { signupSchema } from "@workspace/validation"

/**
 * Signup handler - validates input and creates new user.
 * Intended for use in Next.js API routes (server-side).
 */
export async function signupHandler(input: unknown) {
  const validated = signupSchema.parse(input)
  void validated

  // TODO: Implement signup logic
  // - Check if email exists
  // - Hash password
  // - Create user record
  // - Send verification email
  throw new Error("signupHandler not implemented - add database integration")
}

