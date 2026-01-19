// apps/web/app/api/auth/signup/route.ts
// Signup endpoint - uses kernel pattern

import { kernel } from "@workspace/api-kernel";
import { signupSchema, signupOutputSchema } from "@workspace/validation";

/**
 * POST /api/auth/signup
 *
 * Creates a new user account
 */
export const POST = kernel({
  method: "POST",
  routeId: "auth.signup",
  // Public endpoint - no auth required (this creates the account)
  auth: { mode: "public" },
  body: signupSchema,
  output: signupOutputSchema,

  async handler({ body }) {
    // TODO: Implement actual signup logic
    // In production:
    // 1. Check if email already exists
    // 2. Hash password
    // 3. Create user in database
    // 4. Send verification email
    // 5. Return success message

    // Placeholder validation
    if (body.email && body.password && body.confirmPassword) {
      return {
        success: true,
        message: "Account created. Check your email to verify.",
      };
    }

    throw new Error("Invalid signup data");
  },
});
