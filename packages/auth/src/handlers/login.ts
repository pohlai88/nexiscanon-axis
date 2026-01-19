import { loginSchema } from "@workspace/validation"

/**
 * Login handler - validates input and authenticates user.
 * Intended for use in Next.js API routes (server-side).
 */
export async function loginHandler(input: unknown) {
  const validated = loginSchema.parse(input)
  void validated

  // TODO: Implement actual authentication logic
  // - Query database for user
  // - Compare password hash
  // - Generate JWT token
  // - Return session
  throw new Error("loginHandler not implemented - add database integration")
}

