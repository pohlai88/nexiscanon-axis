#!/usr/bin/env tsx
/**
 * generate-design-system-report.ts
 * Generates health metrics for the design system
 */

import { execSync } from "child_process"
import { glob } from "glob"
import { readFileSync, statSync } from "fs"
import { join } from "path"

interface DesignSystemMetrics {
  componentReuse: number
  importCompliance: number
  semanticTokenUsage: number
  typeScriptErrors: number
  eslintViolations: number
  bundleSize: number | null
  buildTime: number | null
  filesChecked: number
  timestamp: string
}

async function calculateComponentReuse(): Promise<number> {
  // Count files using @workspace/design-system imports
  const files = await glob("apps/**/*.{tsx,ts,jsx,js}", {
    ignore: ["**/node_modules/**", "**/dist/**", "**/.next/**"],
  })

  let filesUsingDesignSystem = 0
  let totalFilesWithComponents = 0

  for (const file of files) {
    const content = readFileSync(file, "utf-8")
    
    // Check if file has any React component imports
    if (content.includes("import") && content.includes("from")) {
      totalFilesWithComponents++
      
      // Check if using @workspace/design-system
      if (content.includes("@workspace/design-system")) {
        filesUsingDesignSystem++
      }
    }
  }

  if (totalFilesWithComponents === 0) return 100
  return Math.round((filesUsingDesignSystem / totalFilesWithComponents) * 100)
}

async function calculateImportCompliance(): Promise<number> {
  try {
    execSync("tsx scripts/validate-imports.ts", { stdio: "pipe" })
    return 100 // No violations
  } catch (error) {
    // Parse violations from error output
    return 0 // Has violations
  }
}

async function calculateSemanticTokenUsage(): Promise<number> {
  try {
    execSync("tsx scripts/validate-semantic-tokens.ts", { stdio: "pipe" })
    return 100 // No violations
  } catch (error) {
    return 0 // Has violations
  }
}

async function countTypeScriptErrors(): Promise<number> {
  try {
    execSync("pnpm check-types", { stdio: "pipe" })
    return 0 // No errors
  } catch (error) {
    // Try to parse error count from output
    const output = (error as any).stdout?.toString() || ""
    const match = output.match(/(\d+)\s+error/)
    return match ? parseInt(match[1]) : 1
  }
}

async function countEslintViolations(): Promise<number> {
  try {
    execSync("pnpm lint", { stdio: "pipe" })
    return 0 // No violations
  } catch (error) {
    // Try to parse violation count
    const output = (error as any).stdout?.toString() || ""
    const match = output.match(/(\d+)\s+problem/)
    return match ? parseInt(match[1]) : 1
  }
}

async function measureBundleSize(): Promise<number | null> {
  try {
    const distPath = join(process.cwd(), "packages/design-system/dist/output.css")
    const stats = statSync(distPath)
    return Math.round(stats.size / 1024) // KB
  } catch (error) {
    return null // CSS not built
  }
}

async function measureBuildTime(): Promise<number | null> {
  try {
    const start = Date.now()
    execSync("pnpm --filter @workspace/design-system check-types", { stdio: "pipe" })
    const end = Date.now()
    return Math.round((end - start) / 1000) // seconds
  } catch (error) {
    return null
  }
}

async function generateReport(): Promise<DesignSystemMetrics> {
  console.log("📊 Generating Design System Health Report...")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")

  const files = await glob("apps/**/*.{tsx,ts,jsx,js}", {
    ignore: ["**/node_modules/**", "**/dist/**", "**/.next/**"],
  })

  // Collect metrics
  console.log("🔍 Collecting metrics...")
  
  const componentReuse = await calculateComponentReuse()
  console.log(`   ✓ Component reuse calculated: ${componentReuse}%`)
  
  const importCompliance = await calculateImportCompliance()
  console.log(`   ✓ Import compliance calculated: ${importCompliance}%`)
  
  const semanticTokenUsage = await calculateSemanticTokenUsage()
  console.log(`   ✓ Semantic token usage calculated: ${semanticTokenUsage}%`)
  
  const typeScriptErrors = await countTypeScriptErrors()
  console.log(`   ✓ TypeScript errors counted: ${typeScriptErrors}`)
  
  const eslintViolations = await countEslintViolations()
  console.log(`   ✓ ESLint violations counted: ${eslintViolations}`)
  
  const bundleSize = await measureBundleSize()
  console.log(`   ✓ Bundle size measured: ${bundleSize ? bundleSize + "KB" : "N/A"}`)
  
  const buildTime = await measureBuildTime()
  console.log(`   ✓ Build time measured: ${buildTime ? buildTime + "s" : "N/A"}`)

  const metrics: DesignSystemMetrics = {
    componentReuse,
    importCompliance,
    semanticTokenUsage,
    typeScriptErrors,
    eslintViolations,
    bundleSize,
    buildTime,
    filesChecked: files.length,
    timestamp: new Date().toISOString(),
  }

  // Display report
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log("📊 DESIGN SYSTEM HEALTH REPORT")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")
  console.log(`📅 Generated: ${new Date().toLocaleString()}`)
  console.log(`📁 Files Checked: ${metrics.filesChecked}`)
  console.log("")
  console.log("🎯 METRICS:")
  console.log(`   Component Reuse:      ${formatMetric(metrics.componentReuse, 90, "%")}`)
  console.log(`   Import Compliance:    ${formatMetric(metrics.importCompliance, 100, "%")}`)
  console.log(`   Semantic Token Usage: ${formatMetric(metrics.semanticTokenUsage, 100, "%")}`)
  console.log(`   TypeScript Errors:    ${formatMetric(metrics.typeScriptErrors, 0, "", true)}`)
  console.log(`   ESLint Violations:    ${formatMetric(metrics.eslintViolations, 0, "", true)}`)
  console.log(`   Bundle Size:          ${metrics.bundleSize ? formatMetric(metrics.bundleSize, 500, "KB", true) : "N/A"}`)
  console.log(`   Build Time:           ${metrics.buildTime ? formatMetric(metrics.buildTime, 30, "s", true) : "N/A"}`)

  // Check targets
  const allTargetsMet =
    metrics.componentReuse >= 90 &&
    metrics.importCompliance === 100 &&
    metrics.semanticTokenUsage === 100 &&
    metrics.typeScriptErrors === 0 &&
    metrics.eslintViolations === 0 &&
    (metrics.bundleSize === null || metrics.bundleSize < 500) &&
    (metrics.buildTime === null || metrics.buildTime < 30)

  console.log("")
  if (allTargetsMet) {
    console.log("✅ ALL DESIGN SYSTEM TARGETS MET!")
  } else {
    console.log("⚠️  SOME TARGETS NOT MET - REVIEW METRICS ABOVE")
  }
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")

  return metrics
}

function formatMetric(
  value: number,
  target: number,
  suffix: string = "",
  inverse: boolean = false
): string {
  const meetsTarget = inverse
    ? value <= target
    : value >= target
  
  const icon = meetsTarget ? "✅" : "❌"
  const formatted = `${value}${suffix}`
  const targetText = inverse ? `≤${target}` : `≥${target}`
  
  return `${formatted.padEnd(8)} ${icon} (target: ${targetText}${suffix})`
}

// Run the report
generateReport().catch((error) => {
  console.error("❌ Report generation failed:", error)
  process.exit(1)
})
