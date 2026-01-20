// apps/web/app/api/auth/signup/route.ts
// Signup endpoint - Neon Auth integration
//
// ARCHITECTURE: Proxies signup requests to Neon Auth service
// Creates user in neon_auth schema, returns session data

import { kernel } from "@workspace/api-kernel";
import { z } from "zod";

const SignupInput = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
  name: z.string().min(1).optional(),
});

const SignupOutput = z.object({
  success: z.boolean(),
  message: z.string().optional(),
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
 * POST /api/auth/signup
 *
 * Creates a new user account via Neon Auth.
 */
export const POST = kernel({
  method: "POST",
  routeId: "auth.signup",
  auth: { mode: "public" },
  body: SignupInput,
  output: SignupOutput,

  async handler({ body }) {
    const neonAuthUrl = process.env.NEON_AUTH_BASE_URL;

    if (!neonAuthUrl) {
      return {
        success: false,
        error: "Neon Auth not configured",
      };
    }

    // Validate password match
    if (body.password !== body.confirmPassword) {
      return {
        success: false,
        error: "Passwords do not match",
      };
    }

    try {
      // Forward signup request to Neon Auth
      const response = await fetch(`${neonAuthUrl}/api/auth/sign-up/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: body.email,
          password: body.password,
          name: body.name || body.email.split("@")[0],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || "Signup failed",
        };
      }

      // Sync to public.users table with tenant assignment
      if (data.user?.id) {
        const { db } = await import("@workspace/db");
        const { users, tenants } = await import("@workspace/db/schema");
        const { eq } = await import("drizzle-orm");
        
        // Check if user already exists in public.users
        const existingUser = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.id, data.user.id))
          .limit(1);
        
        if (existingUser.length === 0) {
          // Create default tenant for new user (single-tenant per user for now)
          const tenantSlug = `${body.email.split("@")[0]}-${Date.now()}`;
          const [tenant] = await db
            .insert(tenants)
            .values({
              name: `${data.user.name}'s Organization`,
              slug: tenantSlug,
            })
            .returning();
          
          // Create user in public.users with tenant_id
          await db.insert(users).values({
            id: data.user.id,
            tenantId: tenant.id,
            email: data.user.email,
            name: data.user.name,
          });
        }
      }

      // Return success with user data
      return {
        success: true,
        message: data.user?.emailVerified
          ? "Account created successfully"
          : "Account created. Check your email to verify.",
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
        error: err instanceof Error ? err.message : "Signup failed",
      };
    }
  },
});
