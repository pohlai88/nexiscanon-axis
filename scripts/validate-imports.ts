#!/usr/bin/env tsx
/**
 * validate-imports.ts
 * Validates that all UI component imports use @workspace/design-system
 */

import { readFileSync, existsSync } from "fs"
import { join } from "path"
import { glob } from "glob"

// Forbidden import patterns
const FORBIDDEN_PATTERNS = [
  // Relative imports to design-system package
  {
    pattern: /from ['"]\.\.\/\.\.\/\.\.\/packages\/design-system/,
    message: "Use workspace import @workspace/design-system instead of relative paths",
  },
  // Local UI component imports
  {
    pattern: /from ['"].*\/components\/ui\//,
    message: "Import from @workspace/design-system instead of local ui components",
  },
  // Direct src imports
  {
    pattern: /from ['"].*packages\/design-system\/src/,
    message: "Use workspace import @workspace/design-system instead of src paths",
  },
]

// Required pattern for UI components
const REQUIRED_WORKSPACE_IMPORT = /@workspace\/design-system/

// UI component names that should come from design-system
const UI_COMPONENTS = [
  "Button",
  "Card",
  "Input",
  "Table",
  "Dialog",
  "Select",
  "Label",
  "Form",
  "Badge",
  "Avatar",
  "Checkbox",
  "Switch",
]

interface ValidationError {
  file: string
  line: number
  error: string
}

async function validateFile(filePath: string): Promise<ValidationError[]> {
  const content = readFileSync(filePath, "utf-8")
  const errors: ValidationError[] = []
  const lines = content.split("\n")

  lines.forEach((line, index) => {
    // Check for forbidden imports
    FORBIDDEN_PATTERNS.forEach(({ pattern, message }) => {
      if (pattern.test(line)) {
        errors.push({
          file: filePath,
          line: index + 1,
          error: `${message}\n   Found: ${line.trim()}`,
        })
      }
    })

    // Check if file imports UI components but not from workspace
    if (line.includes("import {") && line.includes("from")) {
      const hasUIComponent = UI_COMPONENTS.some((comp) => line.includes(comp))
      
      if (hasUIComponent && !REQUIRED_WORKSPACE_IMPORT.test(line)) {
        // Check if it's importing from design-system
        if (!line.includes("@workspace/design-system")) {
          errors.push({
            file: filePath,
            line: index + 1,
            error: `UI component imported but not from @workspace/design-system\n   Found: ${line.trim()}`,
          })
        }
      }
    }
  })

  return errors
}

async function main() {
  console.log("🔍 Validating imports...")

  const files = await glob("apps/**/*.{tsx,ts,jsx,js}", {
    ignore: ["**/node_modules/**", "**/dist/**", "**/.next/**"],
  })

  if (files.length === 0) {
    console.log("⚠️  No files found to validate")
    process.exit(0)
  }

  console.log(`📁 Checking ${files.length} files...`)

  let totalErrors = 0
  const errorsByFile: Record<string, ValidationError[]> = {}

  for (const file of files) {
    const errors = await validateFile(file)
    if (errors.length > 0) {
      errorsByFile[file] = errors
      totalErrors += errors.length
    }
  }

  if (totalErrors > 0) {
    console.error(`\n❌ ${totalErrors} import violation(s) found:\n`)

    Object.entries(errorsByFile).forEach(([file, errors]) => {
      console.error(`📄 ${file}:`)
      errors.forEach(({ line, error }) => {
        console.error(`   Line ${line}: ${error}`)
      })
      console.error("")
    })

    console.error("Fix: Use @workspace/design-system for all UI component imports")
    console.error('Example: import { Button, Card } from "@workspace/design-system"')
    process.exit(1)
  }

  console.log("✅ All imports are valid")
  console.log("✅ All UI components imported from @workspace/design-system")
}

main().catch((error) => {
  console.error("❌ Validation script failed:", error)
  process.exit(1)
})
