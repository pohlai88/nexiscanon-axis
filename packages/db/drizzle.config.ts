import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";
import { resolve } from "path";

// Load .env from monorepo root
config({ path: resolve(__dirname, "../../.env") });

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Use DIRECT connection for migrations (F01 LAW F01-04)
    url: process.env.DATABASE_URL_DIRECT || process.env.DATABASE_URL!,
  },
  entities: {
    roles: {
      // Exclude Neon system roles from schema introspection (F01 B5)
      provider: "neon",
    },
  },
  verbose: true,
  strict: true,
});
