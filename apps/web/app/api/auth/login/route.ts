// apps/web/app/api/auth/login/route.ts
// Login endpoint - Neon Auth integration
//
// ARCHITECTURE: Proxies login requests to Neon Auth service
// Returns session data with JWT for authenticated API calls

import { kernel } from "@workspace/api-kernel";
import { z } from "zod";

const LoginInput = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const LoginOutput = z.object({
  success: z.boolean(),
  user: z
    .object({
      id: z.string(),
      email: z.string(),
      name: z.string(),
      emailVerified: z.boolean(),
    })
    .optional(),
  error: z.string().optional(),
});

/**
 * POST /api/auth/login
 *
 * Authenticates user via Neon Auth and returns session data.
 * The frontend AuthProvider calls this to sign in users.
 */
export const POST = kernel({
  method: "POST",
  routeId: "auth.login",
  auth: { mode: "public" },
  body: LoginInput,
  output: LoginOutput,

  async handler({ body, rawRequest }) {
    const neonAuthUrl = process.env.NEON_AUTH_BASE_URL;

    if (!neonAuthUrl) {
      return {
        success: false,
        error: "Neon Auth not configured",
      };
    }

    try {
      // Forward login request to Neon Auth
      const response = await fetch(`${neonAuthUrl}/api/auth/sign-in/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: body.email,
          password: body.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || "Authentication failed",
        };
      }

      // Ensure user exists in public.users (sync from neon_auth.user)
      if (data.user?.id) {
        const { db } = await import("@workspace/db");
        const { users, tenants } = await import("@workspace/db/schema");
        const { eq } = await import("drizzle-orm");
        
        const existingUser = await db
          .select({ id: users.id, tenantId: users.tenantId })
          .from(users)
          .where(eq(users.id, data.user.id))
          .limit(1);
        
        // If user doesn't exist in public.users, create with default tenant
        if (existingUser.length === 0) {
          const tenantSlug = `${data.user.email.split("@")[0]}-${Date.now()}`;
          const [tenant] = await db
            .insert(tenants)
            .values({
              name: `${data.user.name}'s Organization`,
              slug: tenantSlug,
            })
            .returning();
          
          await db.insert(users).values({
            id: data.user.id,
            tenantId: tenant.id,
            email: data.user.email,
            name: data.user.name,
          });
        }
      }

      // Return user data (session is managed via cookies by Neon Auth)
      return {
        success: true,
        user: data.user
          ? {
              id: data.user.id,
              email: data.user.email,
              name: data.user.name,
              emailVerified: data.user.emailVerified,
            }
          : undefined,
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Login failed",
      };
    }
  },
});

