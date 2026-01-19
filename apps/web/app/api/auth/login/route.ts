// apps/web/app/api/auth/login/route.ts
// Login endpoint - Neon Auth integration

import { kernel } from "@workspace/api-kernel";
import { z } from "zod";

const LoginInput = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const LoginOutput = z.object({
  message: z.string(),
  neonAuthUrl: z.string().optional(),
  instructions: z.string(),
});

/**
 * POST /api/auth/login
 *
 * Phase 1: Minimal implementation
 * Neon Auth uses hosted pages for login. This endpoint provides instructions.
 * To obtain a JWT:
 * 1. Use Neon Auth hosted UI (if available)
 * 2. Or call Neon Auth API directly
 * 3. Return the JWT to use in Authorization: Bearer <jwt>
 */
export const POST = kernel({
  method: "POST",
  routeId: "auth.login",
  auth: { mode: "public" },
  body: LoginInput,
  output: LoginOutput,

  async handler({ body }) {
    const neonAuthUrl = process.env.NEON_AUTH_BASE_URL;

    // Phase 1: Return instructions for obtaining JWT
    // Phase 2 will implement actual Neon Auth API calls
    return {
      message: "Login via Neon Auth",
      neonAuthUrl,
      instructions: neonAuthUrl
        ? `Use Neon Auth at ${neonAuthUrl} to obtain JWT, then pass as Authorization: Bearer <jwt>`
        : "NEON_AUTH_BASE_URL not configured - using dev mode (Authorization: Bearer dev + X-Actor-ID header)",
    };
  },
});

