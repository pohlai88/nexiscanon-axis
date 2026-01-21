import { z } from "zod";

/**
 * Environment variable schema with validation.
 * All required env vars are validated at startup.
 */
const envSchema = z.object({
  // Node environment
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // Neon Database
  DATABASE_URL: z.string().optional(),
  NEON_PROJECT_ID: z.string().optional(),

  // Neon Auth
  NEON_AUTH_BASE_URL: z.string().url().optional(),
  JWKS_URL: z.string().url().optional(),
  NEXT_PUBLIC_NEON_AUTH_URL: z.string().url().optional(),

  // App config
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  BASE_URL: z.string().url().optional(),

  // Session
  SESSION_SECRET: z.string().optional(),
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
