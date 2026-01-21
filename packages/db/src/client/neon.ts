import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../schema/index";

/**
 * Create a Drizzle client for Neon database.
 *
 * @param connectionString - Neon database connection string
 * @returns Drizzle ORM client
 */
export function createDbClient(connectionString: string) {
  const sql = neon(connectionString);
  return drizzle(sql, { schema });
}

/**
 * Default database client.
 * Uses DATABASE_URL environment variable.
 *
 * Note: Only use this for scripts/migrations.
 * For multi-tenant queries, use tenant-scoped client.
 */
export const db = (() => {
  const url = process.env.DATABASE_URL;

  if (!url) {
    // Return a proxy that throws on access (for dev without DB)
    return new Proxy({} as ReturnType<typeof createDbClient>, {
      get() {
        throw new Error(
          "DATABASE_URL is not set. Configure your Neon connection string."
        );
      },
    });
  }

  return createDbClient(url);
})();

export type Database = ReturnType<typeof createDbClient>;
