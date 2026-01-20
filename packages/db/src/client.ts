// packages/db/src/client.ts
// Neon + Drizzle connection with connection pooling and read replica support

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * Get the database URL from environment.
 * Automatically uses connection pooler for better performance.
 * Throws if not configured.
 */
function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL environment variable is required");
  }
  
  // Ensure connection pooler is used for SaaS workloads
  // Replace direct endpoint with -pooler suffix for pgBouncer
  if (!url.includes('-pooler.') && url.includes('.neon.tech')) {
    const optimizedUrl = url.replace(
      /\.([a-z0-9-]+)\.aws\.neon\.tech/,
      '-pooler.$1.aws.neon.tech'
    );
    console.log('[DB] Using connection pooler for optimized performance');
    return optimizedUrl;
  }
  
  return url;
}

/**
 * Get the read replica URL from environment (optional).
 * Falls back to primary if not configured.
 */
function getReplicaUrl(): string | null {
  const url = process.env.DATABASE_URL_REPLICA;
  if (!url) {
    return null;
  }
  
  // Ensure connection pooler is used for read replicas too
  if (!url.includes('-pooler.') && url.includes('.neon.tech')) {
    const optimizedUrl = url.replace(
      /\.([a-z0-9-]+)\.aws\.neon\.tech/,
      '-pooler.$1.aws.neon.tech'
    );
    console.log('[DB] Using read replica with connection pooler');
    return optimizedUrl;
  }
  
  return url;
}

/**
 * Create a Neon SQL client for primary (read-write) operations.
 */
export function createSqlClient() {
  return neon(getDatabaseUrl());
}

/**
 * Create a Neon SQL client for read replica (read-only) operations.
 * Falls back to primary if no replica is configured.
 */
export function createReplicaSqlClient() {
  const replicaUrl = getReplicaUrl();
  if (replicaUrl) {
    return neon(replicaUrl);
  }
  console.log('[DB] No read replica configured, using primary for reads');
  return createSqlClient();
}

/**
 * Create a Drizzle ORM instance for primary database (read-write).
 * Use this for all writes and critical reads.
 */
export function createDb() {
  const sql = createSqlClient();
  return drizzle(sql, { schema });
}

/**
 * Create a Drizzle ORM instance for read replica (read-only).
 * Use this for analytics, reports, and non-critical reads.
 * Falls back to primary if no replica is configured.
 */
export function createReplicaDb() {
  const sql = createReplicaSqlClient();
  return drizzle(sql, { schema });
}

/** Singleton database instance (primary) */
let _db: ReturnType<typeof createDb> | undefined;

/** Singleton read replica instance */
let _replicaDb: ReturnType<typeof createReplicaDb> | undefined;

/**
 * Get the primary database instance (singleton).
 * Use for writes and read-after-write scenarios.
 */
export function getDb() {
  if (!_db) {
    _db = createDb();
  }
  return _db;
}

/**
 * Get the read replica database instance (singleton).
 * Use for analytics, reports, and non-critical reads.
 * Automatically falls back to primary if no replica configured.
 */
export function getReplicaDb() {
  if (!_replicaDb) {
    _replicaDb = createReplicaDb();
  }
  return _replicaDb;
}

/** Database type for use in other modules */
export type Database = ReturnType<typeof createDb>;
export type ReplicaDatabase = ReturnType<typeof createReplicaDb>;