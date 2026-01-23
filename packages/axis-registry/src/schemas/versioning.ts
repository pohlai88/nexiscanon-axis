/**
 * Schema Versioning - $schema URL Validation
 *
 * Implements self-describing schemas with version validation.
 * Pattern inspired by JSON Schema's $schema field.
 *
 * Features:
 * - Schema URI validation (axis://entity/vN)
 * - Version extraction and comparison
 * - Migration helpers
 */

import { z } from "zod";
import { SCHEMA_URIS, SCHEMA_VERSION } from "./constants";

// ============================================================================
// Schema URI Validation
// ============================================================================

/**
 * Valid AXIS schema URI pattern: axis://entity-name/vN
 * Examples:
 * - axis://document/v1
 * - axis://economic-event/v1
 * - axis://6w1h/v1
 */
export const schemaUriPattern = /^axis:\/\/[\w-]+\/v\d+$/;

/**
 * Zod schema for validating $schema URIs
 */
export const schemaUriSchema = z.string().regex(schemaUriPattern, {
  message: "Invalid schema URI. Expected format: axis://entity-name/vN",
});

/**
 * Extract version number from schema URI
 */
export function extractVersion(schemaUri: string): number | null {
  const match = schemaUri.match(/\/v(\d+)$/);
  if (!match || !match[1]) return null;
  return parseInt(match[1], 10);
}

/**
 * Extract entity name from schema URI
 */
export function extractEntityName(schemaUri: string): string | null {
  const match = schemaUri.match(/^axis:\/\/([\w-]+)\/v\d+$/);
  if (!match || !match[1]) return null;
  return match[1];
}

/**
 * Validate schema URI matches expected entity and version
 */
export function validateSchemaUri(
  uri: string,
  expectedEntity: keyof typeof SCHEMA_URIS
): { valid: boolean; error?: string } {
  const expectedUri = SCHEMA_URIS[expectedEntity];
  
  if (!schemaUriPattern.test(uri)) {
    return { valid: false, error: `Invalid schema URI format: ${uri}` };
  }

  const entityName = extractEntityName(uri);
  const expectedEntityName = extractEntityName(expectedUri);

  if (entityName !== expectedEntityName) {
    return {
      valid: false,
      error: `Entity mismatch: expected ${expectedEntityName}, got ${entityName}`,
    };
  }

  const version = extractVersion(uri);
  const expectedVersion = extractVersion(expectedUri);

  if (version !== expectedVersion) {
    return {
      valid: false,
      error: `Version mismatch: expected v${expectedVersion}, got v${version}`,
    };
  }

  return { valid: true };
}

// ============================================================================
// Version Comparison
// ============================================================================

/**
 * Compare two schema URIs by version
 * Returns: -1 if a < b, 0 if equal, 1 if a > b
 */
export function compareSchemaVersions(uriA: string, uriB: string): number {
  const versionA = extractVersion(uriA);
  const versionB = extractVersion(uriB);

  if (versionA === null || versionB === null) {
    throw new Error("Invalid schema URI for version comparison");
  }

  return Math.sign(versionA - versionB);
}

/**
 * Check if schema needs migration (version is older than current)
 */
export function needsMigration(
  schemaUri: string,
  entityType: keyof typeof SCHEMA_URIS
): boolean {
  const currentUri = SCHEMA_URIS[entityType];
  const documentVersion = extractVersion(schemaUri);
  const currentVersion = extractVersion(currentUri);

  if (documentVersion === null || currentVersion === null) {
    return false;
  }

  return documentVersion < currentVersion;
}

// ============================================================================
// Schema Validation with $schema Check
// ============================================================================

/**
 * Create a schema validator that enforces $schema field
 *
 * @param baseSchema - The Zod schema to extend
 * @param entityType - The entity type for URI validation
 * @param options - Validation options
 */
export function withSchemaValidation<T extends z.ZodTypeAny>(
  baseSchema: T,
  entityType: keyof typeof SCHEMA_URIS,
  options: {
    requireSchema?: boolean;
    strictVersion?: boolean;
  } = {}
) {
  const { requireSchema = false, strictVersion = true } = options;

  return baseSchema.superRefine((data, ctx) => {
    // Only validate if data is an object with $schema
    if (typeof data !== "object" || data === null) {
      return;
    }

    const record = data as Record<string, unknown>;
    const schemaField = record.$schema;

    // Check if $schema is required
    if (requireSchema && !schemaField) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Missing required $schema field. Expected: ${SCHEMA_URIS[entityType]}`,
        path: ["$schema"],
      });
      return;
    }

    // Validate $schema if present
    if (schemaField && typeof schemaField === "string") {
      const validation = validateSchemaUri(schemaField, entityType);
      
      if (!validation.valid && strictVersion) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: validation.error ?? "Invalid $schema",
          path: ["$schema"],
        });
      }
    }
  });
}

// ============================================================================
// Migration Helpers
// ============================================================================

/**
 * Schema migration function type
 */
export type SchemaMigration<TFrom, TTo> = (data: TFrom) => TTo;

/**
 * Migration registry for a specific entity type
 */
export interface MigrationRegistry<T> {
  /**
   * Current schema version
   */
  currentVersion: number;

  /**
   * Migrations from version N to N+1
   */
  migrations: Map<number, SchemaMigration<unknown, unknown>>;

  /**
   * Apply migrations to bring data to current version
   */
  migrate(data: unknown, fromVersion: number): T;
}

/**
 * Create a migration registry for an entity type
 */
export function createMigrationRegistry<T>(): MigrationRegistry<T> {
  const migrations = new Map<number, SchemaMigration<unknown, unknown>>();

  return {
    currentVersion: SCHEMA_VERSION,
    migrations,
    migrate(data: unknown, fromVersion: number): T {
      let current = data;
      let version = fromVersion;

      while (version < SCHEMA_VERSION) {
        const migration = migrations.get(version);
        if (!migration) {
          throw new Error(`No migration found for version ${version}`);
        }
        current = migration(current);
        version++;
      }

      return current as T;
    },
  };
}

// Note: SCHEMA_URIS and SCHEMA_VERSION are exported from ./constants
// Do not re-export here to avoid duplicate export errors
