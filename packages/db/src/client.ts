// packages/db/src/client.ts
// Neon + Drizzle connection

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * Get the database URL from environment.
 * Throws if not configured.
 */
function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL environment variable is required");
  }
  return url;
}

/**
 * Create a Neon SQL client.
 */
export function createSqlClient() {
  return neon(getDatabaseUrl());
}

/**
 * Create a Drizzle ORM instance.
 */
export function createDb() {
  const sql = createSqlClient();
  return drizzle(sql, { schema });
}

/** Singleton database instance */
let _db: ReturnType<typeof createDb> | undefined;

/**
 * Get the database instance (singleton).
 */
export function getDb() {
  if (!_db) {
    _db = createDb();
  }
  return _db;
}

/** Database type for use in other modules */
export type Database = ReturnType<typeof createDb>;
