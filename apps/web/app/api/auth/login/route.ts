// apps/web/app/api/auth/login/route.ts
// Login endpoint - uses kernel pattern

import { kernel } from "@workspace/api-kernel";
import { loginSchema, loginOutputSchema } from "@workspace/validation";

/**
 * POST /api/auth/login
 *
 * Authenticates a user with email and password
 */
export const POST = kernel({
  method: "POST",
  routeId: "auth.login",
  // Public endpoint - no auth required (this IS the auth endpoint)
  auth: { mode: "public" },
  body: loginSchema,
  output: loginOutputSchema,

  async handler({ body }) {
    // TODO: Implement actual authentication logic
    // For now, return placeholder response

    // In production:
    // 1. Verify credentials against database
    // 2. Create session/token
    // 3. Set auth cookie
    // 4. Return user info

    // Placeholder validation
    if (body.email && body.password) {
      return {
        message: "Login handler not implemented",
      };
    }

    throw new Error("Invalid credentials");
  },
});
