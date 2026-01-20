// packages/db/drizzle.config.ts
// Drizzle Kit configuration for Neon PostgreSQL
//
// USAGE:
//   pnpm db:generate  - Generate migration files (no DB connection needed)
//   pnpm db:migrate   - Apply migrations to database (needs DATABASE_URL)
//   pnpm db:push      - Push schema directly (dev only, needs DATABASE_URL)
//   pnpm db:studio    - Open Drizzle Studio (needs DATABASE_URL)

import 'dotenv/config'; // Auto-load .env file
import { defineConfig } from "drizzle-kit";

// Only validate DATABASE_URL for commands that need it
// (generate works without it, migrate/push/studio need it)
const commandNeedsDb = process.argv.some(arg => 
  ['migrate', 'push', 'studio', 'pull', 'check', 'drop'].includes(arg)
);

if (commandNeedsDb && !process.env.DATABASE_URL) {
  throw new Error(
    '❌ DATABASE_URL is not set in .env file\n' +
    '   Copy .envExample to .env and configure DATABASE_URL\n' +
    '   Required for: migrate, push, studio, pull, check, drop'
  );
}

export default defineConfig({
  // Schema file(s)
  schema: "./src/schema.ts",
  
  // Migrations output directory
  out: "./drizzle",
  
  // Database dialect (must be "postgresql" not "postgres")
  dialect: "postgresql",
  
  // Database connection (only used for migrate/push/studio)
  ...(process.env.DATABASE_URL && {
    dbCredentials: {
      url: process.env.DATABASE_URL,
    },
  }),
  
  // Strict mode: catch potential issues during migration generation
  // Warns about: type mismatches, missing constraints, etc.
  strict: true,
  
  // Schema filter: only generate migrations for public schema
  // Excludes: drizzle, neon_auth, graphile_worker, pg_catalog, etc.
  schemaFilter: ["public"],
  
  // Verbose logging (enable with: DRIZZLE_VERBOSE=true pnpm db:generate)
  verbose: process.env.DRIZZLE_VERBOSE === 'true',
});
