#!/usr/bin/env tsx
/**
 * validate-semantic-tokens.ts
 * Validates that all colors use semantic tokens (no hardcoded Tailwind colors)
 */

import { readFileSync } from "fs"
import { glob } from "glob"

// Hardcoded color pattern (bg|text|border followed by color-number)
const HARDCODED_COLOR_PATTERN =
  /\b(bg|text|border|ring|divide|outline|shadow|from|via|to|decoration)-(red|blue|green|yellow|purple|pink|indigo|gray|slate|zinc|neutral|stone|orange|amber|lime|emerald|teal|cyan|sky|violet|fuchsia|rose)-\d{2,3}\b/g

// Allowed semantic tokens
const SEMANTIC_TOKENS = [
  "background",
  "foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "destructive-foreground",
  "border",
  "input",
  "ring",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
]

interface ColorViolation {
  file: string
  line: number
  match: string
  context: string
}

async function validateFile(filePath: string): Promise<ColorViolation[]> {
  const content = readFileSync(filePath, "utf-8")
  const violations: ColorViolation[] = []
  const lines = content.split("\n")

  lines.forEach((line, index) => {
    // Skip if line contains semantic token usage
    const hasSemantic = SEMANTIC_TOKENS.some((token) => line.includes(token))
    
    // Check for hardcoded colors
    const matches = Array.from(line.matchAll(HARDCODED_COLOR_PATTERN))
    
    if (matches.length > 0) {
      matches.forEach((match) => {
        violations.push({
          file: filePath,
          line: index + 1,
          match: match[0],
          context: line.trim(),
        })
      })
    }
  })

  return violations
}

async function main() {
  console.log("🔍 Validating semantic token usage...")

  const files = await glob("apps/**/*.{tsx,ts,jsx,js}", {
    ignore: ["**/node_modules/**", "**/dist/**", "**/.next/**"],
  })

  if (files.length === 0) {
    console.log("⚠️  No files found to validate")
    process.exit(0)
  }

  console.log(`📁 Checking ${files.length} files...`)

  let totalViolations = 0
  const violationsByFile: Record<string, ColorViolation[]> = {}

  for (const file of files) {
    const violations = await validateFile(file)
    if (violations.length > 0) {
      violationsByFile[file] = violations
      totalViolations += violations.length
    }
  }

  if (totalViolations > 0) {
    console.error(`\n❌ ${totalViolations} hardcoded color violation(s) found:\n`)

    Object.entries(violationsByFile).forEach(([file, violations]) => {
      console.error(`📄 ${file}:`)
      violations.forEach(({ line, match, context }) => {
        console.error(`   Line ${line}: Hardcoded color '${match}'`)
        console.error(`   Context: ${context}`)
        console.error("")
      })
    })

    console.error("Fix: Use semantic tokens instead of hardcoded colors")
    console.error("Semantic tokens:")
    console.error("  - bg-primary, bg-secondary, bg-muted, bg-accent, bg-destructive")
    console.error("  - text-foreground, text-muted-foreground, text-primary-foreground")
    console.error("  - border, ring, input")
    console.error("")
    console.error("Example:")
    console.error('  ❌ className="bg-blue-500 text-white"')
    console.error('  ✅ className="bg-primary text-primary-foreground"')
    process.exit(1)
  }

  console.log("✅ All colors use semantic tokens")
  console.log(`✅ Checked ${files.length} files`)
}

main().catch((error) => {
  console.error("❌ Validation script failed:", error)
  process.exit(1)
})
