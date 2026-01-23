/**
 * Main codegen entry point
 *
 * Generates all derived artifacts from the registry.
 *
 * Usage: pnpm --filter @axis/registry codegen
 */

import * as fs from "fs";
import * as path from "path";
import { generateAllDrizzleSchemas } from "./drizzle-generator";
import { generateAllSqlMigrations } from "./sql-generator";
import { validateSchemaSync } from "./validator";

const OUTPUT_DIR = path.resolve(import.meta.dirname, "../../__generated__");

async function main() {
  console.log("🔄 AXIS Registry Codegen");
  console.log("========================\n");

  // Step 1: Validate schemas
  console.log("1. Validating registry schemas...");
  const validation = validateSchemaSync();
  if (!validation.valid) {
    console.log("❌ Schema validation failed!");
    validation.errors.forEach((e) => console.log(`   ${e}`));
    process.exit(1);
  }
  console.log("   ✅ Schemas valid\n");

  // Step 2: Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Step 3: Generate Drizzle schemas
  console.log("2. Generating Drizzle schemas...");
  const drizzleSchemas = generateAllDrizzleSchemas();

  const drizzleHeader = `/**
 * AUTO-GENERATED FILE - DO NOT EDIT
 *
 * Generated from @axis/registry schemas.
 * Run \`pnpm --filter @axis/registry codegen\` to regenerate.
 *
 * @generated
 */

import { pgTable, uuid, varchar, numeric, integer, boolean, timestamp, jsonb, index, uniqueIndex } from "drizzle-orm/pg-core";
import { tenants } from "./tenant";
import { users } from "./user";

`;

  const drizzleContent =
    drizzleHeader + Object.values(drizzleSchemas).join("\n\n");
  fs.writeFileSync(path.join(OUTPUT_DIR, "drizzle-schemas.ts"), drizzleContent);
  console.log(`   ✅ Generated ${OUTPUT_DIR}/drizzle-schemas.ts\n`);

  // Step 4: Generate SQL migrations
  console.log("3. Generating SQL migrations...");
  const sqlMigrations = generateAllSqlMigrations();

  const sqlHeader = `-- AUTO-GENERATED FILE - DO NOT EDIT
--
-- Generated from @axis/registry schemas.
-- Run \`pnpm --filter @axis/registry codegen\` to regenerate.
--
-- @generated

`;

  const sqlContent = sqlHeader + sqlMigrations;
  fs.writeFileSync(path.join(OUTPUT_DIR, "b01-posting-spine.sql"), sqlContent);
  console.log(`   ✅ Generated ${OUTPUT_DIR}/b01-posting-spine.sql\n`);

  // Step 5: Generate types barrel
  console.log("4. Generating types barrel...");
  const typesContent = `/**
 * AUTO-GENERATED FILE - DO NOT EDIT
 *
 * Re-exports types from @axis/registry/types.
 * Ensures type consistency across the codebase.
 *
 * @generated
 */

export * from "@axis/registry/types";
`;
  fs.writeFileSync(path.join(OUTPUT_DIR, "types.ts"), typesContent);
  console.log(`   ✅ Generated ${OUTPUT_DIR}/types.ts\n`);

  console.log("========================");
  console.log("✅ Codegen complete!");
  console.log(`   Output: ${OUTPUT_DIR}`);
}

main().catch((err) => {
  console.error("❌ Codegen failed:", err);
  process.exit(1);
});
