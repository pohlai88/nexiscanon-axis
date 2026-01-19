#!/usr/bin/env node

/**
 * Validate CSS injection files to ensure they only contain variable overrides
 * 
 * This script enforces the CSS contract:
 * - Only allows @layer app.overrides
 * - Only allows :root, .dark, :root[data-theme="..."] selectors
 * - Only allows CSS variables (--*) declarations
 * - Forbids @import, @apply, @tailwind, and other @ rules
 * 
 * Usage: node scripts/validate-css-injection.js
 * Exit codes: 0 = success, 1 = validation failed
 */

import fs from "fs";
import path from "path";
import { globSync } from "glob";

const ALLOWED_SELECTORS = /^(@layer\s+app\.overrides|:root|\.dark|:root\[data-theme="[^"]+"\](:\.dark)?)\s*\{/;
const ALLOWED_PROPERTY = /^\s*--[a-z-]+\s*:/i;

const FORBIDDEN_PATTERNS = {
  "@apply": /@apply/,
  "@import": /@import/,
  "@tailwind": /@tailwind/,
  "@media": /@media/,
  "@keyframes": /@keyframes/,
  "@font-face": /@font-face/,
  "non-variable property": /[^-]\w+\s*:(?!--)/,
  "color-scheme": /color-scheme/,
};

async function validateCSSInjection() {
  console.log("🔍 Validating CSS injection files...\n");

  // Find all injection files
  const injectionFiles = globSync("apps/*/app/axis.inject.css");

  if (injectionFiles.length === 0) {
    console.log("✅ No injection files found (OK - optional)");
    return true;
  }

  let hasErrors = false;
  const results = [];

  for (const file of injectionFiles) {
    const content = fs.readFileSync(file, "utf-8");
    const lines = content.split("\n");
    const fileErrors = [];

    let inLayer = false;
    let inBlock = false;
    let bracketCount = 0;

    for (let idx = 0; idx < lines.length; idx++) {
      const line = lines[idx];
      const trimmed = line.trim();

      // Skip comments and empty lines
      if (!trimmed || trimmed.startsWith("/*") || trimmed.startsWith("*") || trimmed.startsWith("//")) {
        continue;
      }

      // Track braces for context
      bracketCount += (trimmed.match(/\{/g) || []).length;
      bracketCount -= (trimmed.match(/\}/g) || []).length;

      // Check @layer declaration
      if (trimmed.includes("@layer")) {
        if (!trimmed.includes("@layer app.overrides")) {
          fileErrors.push({
            line: idx + 1,
            message: 'Only "@layer app.overrides" allowed',
            code: trimmed,
          });
          hasErrors = true;
        }
        inLayer = true;
        continue;
      }

      // Check selector
      if (trimmed.includes("{")) {
        if (!ALLOWED_SELECTORS.test(trimmed)) {
          fileErrors.push({
            line: idx + 1,
            message: 'Only :root, .dark, :root[data-theme="..."] allowed',
            code: trimmed,
          });
          hasErrors = true;
        }
        inBlock = true;
        continue;
      }

      // Check declarations
      if (inBlock && trimmed.includes(":") && !trimmed.startsWith("//") && trimmed !== "}") {
        if (!ALLOWED_PROPERTY.test(trimmed)) {
          fileErrors.push({
            line: idx + 1,
            message: "Only CSS variables (--*) allowed",
            code: trimmed,
          });
          hasErrors = true;
        }

        // Check forbidden patterns
        for (const [name, pattern] of Object.entries(FORBIDDEN_PATTERNS)) {
          if (pattern.test(trimmed)) {
            fileErrors.push({
              line: idx + 1,
              message: `Forbidden pattern: ${name}`,
              code: trimmed,
            });
            hasErrors = true;
            break;
          }
        }
      }

      if (trimmed === "}") {
        inBlock = false;
      }
    }

    results.push({ file, errors: fileErrors });
  }

  // Print results
  for (const { file, errors } of results) {
    if (errors.length === 0) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file}`);
      for (const error of errors) {
        console.log(`   Line ${error.line}: ${error.message}`);
        console.log(`   > ${error.code}`);
      }
      console.log();
    }
  }

  if (hasErrors) {
    console.log("\n❌ CSS validation failed! Apps can only inject CSS variables.");
    console.log("📖 See packages/design-system/README.md for valid injection pattern.\n");
    return false;
  }

  console.log("✅ All CSS injection files valid!\n");
  return true;
}

// Run validation
const valid = await validateCSSInjection();
process.exit(valid ? 0 : 1);
