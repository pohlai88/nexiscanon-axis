import { z } from "zod";

/**
 * Environment variable schema with validation.
 * All required env vars are validated at startup.
 *
 * Zod v4 Contract-First:
 * - Uses .meta({ id }) with namespaced ID (kernel.*)
 * - Type inferred via z.infer<typeof envSchema>
 * - See .cursor/rules/zod.contract-first.delta.mdc
 *
 * @namespace kernel.config.env
 */
const envSchema = z
  .object({
    // Node environment
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),

    // Neon Database
    DATABASE_URL: z.string().optional(),
    NEON_PROJECT_ID: z.string().optional(),

    // Neon Auth
    NEON_AUTH_BASE_URL: z.url().optional(),
    JWKS_URL: z.url().optional(),
    NEXT_PUBLIC_NEON_AUTH_URL: z.url().optional(),

    // App config
    NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),
    NEXT_PUBLIC_SITE_URL: z.url().optional(),
    BASE_URL: z.url().optional(),

    // Session
    SESSION_SECRET: z.string().optional(),
  })
  .meta({
    id: "kernel.config.env",
    title: "Environment Configuration",
    description:
      "Runtime environment variables for AXIS kernel (database, auth, app config)",
  });

export type Env = z.infer<typeof envSchema>;

/**
 * Validated environment variables.
 * Throws at startup if required vars are missing.
 */
function getEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error(
      "❌ Invalid environment variables:",
      parsed.error.flatten().fieldErrors
    );

    // In development, allow partial env for easier setup
    if (process.env.NODE_ENV === "development" || !process.env.NODE_ENV) {
      console.warn("⚠️ Running with partial env in development mode");
      return envSchema.parse({
        NODE_ENV: "development",
        NEXT_PUBLIC_APP_URL: "http://localhost:3000",
      });
    }

    throw new Error("Invalid environment variables");
  }

  return parsed.data;
}

export const env = getEnv();
