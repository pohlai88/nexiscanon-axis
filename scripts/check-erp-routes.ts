// scripts/check-erp-routes.ts
// ERP Route Contract Snapshot: verify routeId uniqueness and naming convention
//
// Prevents:
// - Accidental routeId renames that break clients
// - Duplicate routeIds across modules
// - Naming convention drift

import fs from "node:fs";
import path from "node:path";

type Finding = { file: string; problem: string; hint?: string };

const ROOT = process.cwd();
const API_ERP = path.join(ROOT, "apps/web/app/api/erp");
const SNAPSHOT_FILE = path.join(ROOT, ".cursor/snapshots/erp-routes.txt");

function exists(p: string): boolean {
  return fs.existsSync(p);
}

function read(file: string): string {
  return fs.readFileSync(file, "utf8");
}

function walkFiles(dir: string, ext: string, out: string[] = []): string[] {
  if (!exists(dir)) return out;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith(".")) {
      walkFiles(fullPath, ext, out);
    } else if (entry.isFile() && entry.name.endsWith(ext)) {
      out.push(fullPath);
    }
  }
  return out;
}

interface RouteInfo {
  routeId: string;
  method: string;
  file: string;
}

function extractRouteIds(file: string, content: string): RouteInfo[] {
  const routes: RouteInfo[] = [];
  const relativePath = path.relative(ROOT, file);

  // Match: export const METHOD = kernel({ ... })
  const exportRegex = /export\s+const\s+(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s*=\s*kernel\s*\(\s*\{/g;

  let match: RegExpExecArray | null;
  while ((match = exportRegex.exec(content))) {
    const method = match[1];
    const startPos = match.index + match[0].length - 1; // Position of opening {

    // Use brace counting to find matching } (string-aware)
    let braceCount = 1;
    let endPos = startPos + 1;
    let inString: string | null = null; // Track if inside string: ", ', or `
    let escaped = false;

    while (endPos < content.length && braceCount > 0) {
      const char = content[endPos];
      
      // Handle escape sequences
      if (escaped) {
        escaped = false;
        endPos++;
        continue;
      }
      
      if (char === '\\') {
        escaped = true;
        endPos++;
        continue;
      }
      
      // Track string boundaries
      if (inString) {
        if (char === inString) inString = null; // Exit string
      } else {
        if (char === '"' || char === "'" || char === '`') {
          inString = char; // Enter string
        } else {
          // Only count braces outside strings
          if (char === '{') braceCount++;
          if (char === '}') braceCount--;
        }
      }
      
      endPos++;
    }

    const configBlock = content.slice(startPos, endPos);

    // Remove comments to avoid false positives
    const withoutComments = configBlock
      .replace(/\/\*[\s\S]*?\*\//g, '') // Block comments
      .replace(/\/\/.*$/gm, '');        // Line comments

    // Extract routeId from config block
    const routeIdMatch = withoutComments.match(/routeId\s*:\s*["']([^"']+)["']/);
    if (routeIdMatch) {
      routes.push({
        routeId: routeIdMatch[1],
        method,
        file: relativePath,
      });
    }
  }

  return routes;
}

function checkRouteConventions(routes: RouteInfo[]): Finding[] {
  const findings: Finding[] = [];
  const seenIds = new Map<string, RouteInfo>();

  for (const route of routes) {
    // Check 1: Must follow erp.{module}.{entity}.{action} pattern
    const parts = route.routeId.split(".");
    if (parts.length !== 4 || parts[0] !== "erp") {
      findings.push({
        file: route.file,
        problem: `Invalid routeId format: "${route.routeId}"`,
        hint: 'Must follow pattern: erp.{module}.{entity}.{action} (e.g., "erp.base.uoms.create")',
      });
    }

    // Check 2: Must be unique
    const existing = seenIds.get(route.routeId);
    if (existing) {
      findings.push({
        file: route.file,
        problem: `Duplicate routeId: "${route.routeId}" (also in ${existing.file})`,
        hint: "Route IDs must be globally unique across all ERP modules",
      });
    } else {
      seenIds.set(route.routeId, route);
    }

    // Check 3: Entity part must be plural (convention)
    const entity = parts[2];
    if (entity && !entity.endsWith("s") && entity !== "inventory") {
      findings.push({
        file: route.file,
        problem: `Entity "${entity}" in routeId should be plural: "${route.routeId}"`,
        hint: 'Use plural entity names (e.g., "uoms", "partners", "products")',
      });
    }
  }

  return findings;
}

function generateSnapshot(routes: RouteInfo[]): string {
  // Sort by routeId for stable diff
  const sorted = routes.slice().sort((a, b) => a.routeId.localeCompare(b.routeId));

  const lines = sorted.map((r) => `${r.routeId} | ${r.method} | ${r.file}`);
  return lines.join("\n") + "\n";
}

function main(): void {
  console.log("🔍 Checking ERP route contracts...\n");

  if (!exists(API_ERP)) {
    console.log("ℹ️  No ERP routes found (apps/web/app/api/erp)");
    console.log("   This is OK for Phase 0 infrastructure setup.");
    console.log("\n✅ check:erp-routes: OK (no routes to check)\n");
    process.exit(0);
  }

  const routeFiles = walkFiles(API_ERP, "route.ts");

  if (routeFiles.length === 0) {
    console.log("ℹ️  No ERP route files found");
    console.log("\n✅ check:erp-routes: OK (no routes to check)\n");
    process.exit(0);
  }

  console.log(`Found ${routeFiles.length} ERP route file(s):\n`);

  const allRoutes: RouteInfo[] = [];
  for (const file of routeFiles) {
    const relativePath = path.relative(ROOT, file);
    console.log(`  - ${relativePath}`);
    const content = read(file);
    const routes = extractRouteIds(file, content);
    allRoutes.push(...routes);
  }

  console.log(`\nExtracted ${allRoutes.length} route(s)\n`);

  // Check conventions
  const findings = checkRouteConventions(allRoutes);

  if (findings.length > 0) {
    console.error("❌ ERP Route Contract Check FAILED\n");

    const byFile = new Map<string, Finding[]>();
    for (const f of findings) {
      const arr = byFile.get(f.file) ?? [];
      arr.push(f);
      byFile.set(f.file, arr);
    }

    for (const [file, issues] of byFile.entries()) {
      console.error(`${file}:`);
      for (const issue of issues) {
        console.error(`   • ${issue.problem}`);
        if (issue.hint) {
          console.error(`     ↳ ${issue.hint}`);
        }
      }
      console.error("");
    }

    process.exit(1);
  }

  // Generate snapshot
  const snapshot = generateSnapshot(allRoutes);
  const snapshotDir = path.dirname(SNAPSHOT_FILE);

  if (!exists(snapshotDir)) {
    fs.mkdirSync(snapshotDir, { recursive: true });
  }

  // Check if snapshot exists and compare
  if (exists(SNAPSHOT_FILE)) {
    const existingSnapshot = read(SNAPSHOT_FILE);
    if (existingSnapshot !== snapshot) {
      console.error("❌ ERP Route Contract CHANGED\n");
      console.error("Route IDs have been added, removed, or modified.");
      console.error("This is a breaking change that may affect API clients.\n");
      console.error("If this change is intentional, update the snapshot:\n");
      console.error(`  pnpm check:erp-routes --update-snapshot\n`);
      console.error("Diff:\n");
      console.error("Expected (snapshot):");
      console.error(existingSnapshot);
      console.error("\nActual (current):");
      console.error(snapshot);
      process.exit(1);
    }
  } else {
    // Create initial snapshot
    fs.writeFileSync(SNAPSHOT_FILE, snapshot, "utf8");
    console.log(`📸 Created initial snapshot: ${path.relative(ROOT, SNAPSHOT_FILE)}\n`);
  }

  console.log(`✅ check:erp-routes: OK (${allRoutes.length} route(s) checked)\n`);
  console.log("Route contract snapshot:");
  console.log(snapshot);
}

// Handle --update-snapshot flag
if (process.argv.includes("--update-snapshot")) {
  console.log("🔄 Updating ERP route snapshot...\n");
  
  if (exists(API_ERP)) {
    const routeFiles = walkFiles(API_ERP, "route.ts");
    const allRoutes: RouteInfo[] = [];
    
    for (const file of routeFiles) {
      const content = read(file);
      const routes = extractRouteIds(file, content);
      allRoutes.push(...routes);
    }

    const snapshot = generateSnapshot(allRoutes);
    const snapshotDir = path.dirname(SNAPSHOT_FILE);
    
    if (!exists(snapshotDir)) {
      fs.mkdirSync(snapshotDir, { recursive: true });
    }
    
    fs.writeFileSync(SNAPSHOT_FILE, snapshot, "utf8");
    console.log(`✅ Updated snapshot: ${path.relative(ROOT, SNAPSHOT_FILE)}`);
    console.log(`   ${allRoutes.length} route(s) recorded\n`);
  }
  
  process.exit(0);
}

main();
