/**
 * Schema Sync Validator
 *
 * Validates that all derived schemas are in sync with the registry.
 * Run as part of CI to catch drift.
 */

import { z } from "zod";
import {
  documentRegistrySchema,
  economicEventRegistrySchema,
  ledgerPostingRegistrySchema,
  accountRegistrySchema,
} from "../schemas";

type ValidationResult = {
  valid: boolean;
  errors: string[];
  warnings: string[];
};

/**
 * Validates that a Zod schema matches expected structure
 */
function validateSchemaShape(
  name: string,
  schema: z.ZodTypeAny,
  expectedKeys: string[]
): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
  };

  // Get shape from schema if it's an object
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape;
    const actualKeys = Object.keys(shape);

    // Check for missing keys
    for (const key of expectedKeys) {
      if (!actualKeys.includes(key)) {
        result.errors.push(`${name}: Missing expected key "${key}"`);
        result.valid = false;
      }
    }

    // Check for extra keys (warning only)
    for (const key of actualKeys) {
      if (!expectedKeys.includes(key)) {
        result.warnings.push(`${name}: Extra key "${key}" not in expected list`);
      }
    }
  }

  return result;
}

/**
 * Validates all registry schemas
 */
export function validateSchemaSync(): ValidationResult {
  const results: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
  };

  // Document schema validation (all current fields)
  const docResult = validateSchemaShape("Document", documentRegistrySchema, [
    "$schema",
    "entityType",
    "version",
    "id",
    "tenantId",
    "documentType",
    "state",
    "documentNumber",
    "documentDate",
    "entityId",
    "data",
    "context6w1h",
    "dangerZone",
    "extends",
    "dependencies",
    "reversalOf",
    "reversedBy",
    "createdAt",
    "updatedAt",
    "createdBy",
    "modifiedBy",
    "postedAt",
    "postedBy",
  ]);
  results.errors.push(...docResult.errors);
  results.warnings.push(...docResult.warnings);
  if (!docResult.valid) results.valid = false;

  // Economic Event schema validation (all current fields)
  const eventResult = validateSchemaShape("EconomicEvent", economicEventRegistrySchema, [
    "$schema",
    "entityType",
    "version",
    "id",
    "tenantId",
    "documentId",
    "eventType",
    "description",
    "eventDate",
    "amount",
    "currency",
    "entityId",
    "data",
    "context6w1h",
    "dangerZone",
    "extends",
    "dependencies",
    "reversalOf",
    "reversedBy",
    "isReversal",
    "createdAt",
    "updatedAt",
    "createdBy",
    "modifiedBy",
  ]);
  results.errors.push(...eventResult.errors);
  results.warnings.push(...eventResult.warnings);
  if (!eventResult.valid) results.valid = false;

  // Ledger Posting schema validation (all current fields)
  const postingResult = validateSchemaShape("LedgerPosting", ledgerPostingRegistrySchema, [
    "$schema",
    "entityType",
    "version",
    "id",
    "tenantId",
    "economicEventId",
    "batchId",
    "accountId",
    "direction",
    "amount",
    "currency",
    "postingDate",
    "description",
    "metadata",
    "extends",
    "dependencies",
    "reversalOf",
    "reversedBy",
    "isReversal",
    "createdAt",
    "updatedAt",
    "createdBy",
    "modifiedBy",
  ]);
  results.errors.push(...postingResult.errors);
  results.warnings.push(...postingResult.warnings);
  if (!postingResult.valid) results.valid = false;

  // Account schema validation (all current fields)
  const accountResult = validateSchemaShape("Account", accountRegistrySchema, [
    "$schema",
    "entityType",
    "version",
    "id",
    "tenantId",
    "code",
    "name",
    "accountType",
    "currency",
    "metadata",
    "isActive",
    "createdAt",
    "updatedAt",
    "createdBy",
    "modifiedBy",
  ]);
  results.errors.push(...accountResult.errors);
  results.warnings.push(...accountResult.warnings);
  if (!accountResult.valid) results.valid = false;

  return results;
}

// CLI runner
if (import.meta.url === `file://${process.argv[1]}`) {
  const result = validateSchemaSync();

  console.log("Schema Validation Results:");
  console.log("==========================");

  if (result.errors.length > 0) {
    console.log("\nERRORS:");
    result.errors.forEach((e) => console.log(`  ❌ ${e}`));
  }

  if (result.warnings.length > 0) {
    console.log("\nWARNINGS:");
    result.warnings.forEach((w) => console.log(`  ⚠️  ${w}`));
  }

  if (result.valid) {
    console.log("\n✅ All schemas are in sync!");
    process.exit(0);
  } else {
    console.log("\n❌ Schema validation failed!");
    process.exit(1);
  }
}
