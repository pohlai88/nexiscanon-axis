#!/usr/bin/env tsx
/**
 * Schema Validation CLI
 *
 * Validates all registry schemas are properly defined and in sync.
 * Run as part of CI to catch schema drift.
 *
 * Usage: pnpm --filter @axis/registry validate
 */

import { validateSchemaSync } from "./validator";

console.log("🔍 AXIS Registry Schema Validation");
console.log("===================================\n");

const result = validateSchemaSync();

if (result.errors.length > 0) {
  console.log("❌ ERRORS:");
  result.errors.forEach((e) => console.log(`   ${e}`));
  console.log();
}

if (result.warnings.length > 0) {
  console.log("⚠️  WARNINGS:");
  result.warnings.forEach((w) => console.log(`   ${w}`));
  console.log();
}

if (result.valid) {
  console.log("✅ All schemas validated successfully!");
  process.exit(0);
} else {
  console.log("❌ Schema validation failed!");
  process.exit(1);
}
