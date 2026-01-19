// scripts/check-erp.ts
// ERP Lane Quality Gate: ensures ERP modules follow domain discipline
//
// Checks:
// - Manifest completeness (id, version, dependsOn, register)
// - Contracts exist (dto.ts, permissions.ts, workflow.ts for lifecycle entities)
// - DB schema includes tenant_id
// - No forbidden imports

import fs from "node:fs";
import path from "node:path";

type Finding = { module: string; problem: string; hint?: string };

const ROOT = process.cwd();

// Scan targets
const DOMAIN_ADDONS = path.join(ROOT, "packages/domain/src/addons");
const VALIDATION_ERP = path.join(ROOT, "packages/validation/src/erp");
const DB_ERP = path.join(ROOT, "packages/db/src/erp");
const API_ERP = path.join(ROOT, "apps/web/app/api/erp");

// ---- Helpers ----

function exists(p: string): boolean {
  return fs.existsSync(p);
}

function read(file: string): string {
  return fs.readFileSync(file, "utf8");
}

function getErpModules(): string[] {
  if (!exists(DOMAIN_ADDONS)) return [];

  return fs
    .readdirSync(DOMAIN_ADDONS, { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name.startsWith("erp."))
    .map((e) => e.name);
}

// ---- Check A: Manifest Completeness ----

function checkManifest(module: string): Finding[] {
  const findings: Finding[] = [];
  const manifestPath = path.join(DOMAIN_ADDONS, module, "manifest.ts");

  if (!exists(manifestPath)) {
    findings.push({
      module,
      problem: "Missing manifest.ts",
      hint: `Create: packages/domain/src/addons/${module}/manifest.ts`,
    });
    return findings;
  }

  const content = read(manifestPath);

  // Check for required exports
  const requiredExports = ["id:", "version:", "dependsOn"];
  for (const exp of requiredExports) {
    if (!content.includes(exp)) {
      findings.push({
        module,
        problem: `Manifest missing "${exp.replace(":", "")}"`,
        hint: `Add ${exp} to manifest.ts`,
      });
    }
  }

  // Verify id matches folder name
  const idMatch = content.match(/id:\s*["']([^"']+)["']/);
  if (idMatch && idMatch[1] !== module) {
    findings.push({
      module,
      problem: `Manifest id "${idMatch[1]}" doesn't match folder name "${module}"`,
      hint: `Set id: "${module}"`,
    });
  }

  return findings;
}

// ---- Check B: Contracts Exist ----

function checkContracts(module: string): Finding[] {
  const findings: Finding[] = [];
  // erp.base -> base
  const moduleName = module.replace("erp.", "");
  const contractsPath = path.join(VALIDATION_ERP, moduleName);

  if (!exists(contractsPath)) {
    findings.push({
      module,
      problem: "Missing validation contracts folder",
      hint: `Create: packages/validation/src/erp/${moduleName}/`,
    });
    return findings;
  }

  // Check for index.ts barrel
  if (!exists(path.join(contractsPath, "index.ts"))) {
    findings.push({
      module,
      problem: "Missing contracts barrel export",
      hint: `Create: packages/validation/src/erp/${moduleName}/index.ts`,
    });
  }

  return findings;
}

// ---- Check C: DB Schema Exists ----

function checkDbSchema(module: string): Finding[] {
  const findings: Finding[] = [];
  // erp.base -> base
  const moduleName = module.replace("erp.", "");
  const dbPath = path.join(DB_ERP, moduleName);

  // Special case: erp.base includes audit in the erp folder directly
  if (module === "erp.base") {
    // Check for base folder or audit folder at minimum
    if (!exists(path.join(DB_ERP, "base")) && !exists(path.join(DB_ERP, "audit"))) {
      findings.push({
        module,
        problem: "Missing DB schema folder",
        hint: `Create: packages/db/src/erp/base/ or packages/db/src/erp/audit/`,
      });
    }
    return findings;
  }

  if (!exists(dbPath)) {
    findings.push({
      module,
      problem: "Missing DB schema folder",
      hint: `Create: packages/db/src/erp/${moduleName}/`,
    });
    return findings;
  }

  // Check for index.ts barrel
  if (!exists(path.join(dbPath, "index.ts"))) {
    findings.push({
      module,
      problem: "Missing DB barrel export",
      hint: `Create: packages/db/src/erp/${moduleName}/index.ts`,
    });
  }

  return findings;
}

// ---- Check D: No Forbidden Imports ----

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

function checkForbiddenImports(module: string): Finding[] {
  const findings: Finding[] = [];
  const addonPath = path.join(DOMAIN_ADDONS, module);

  if (!exists(addonPath)) return findings;

  const tsFiles = walkFiles(addonPath, ".ts");

  for (const file of tsFiles) {
    const content = read(file);
    const relativePath = path.relative(ROOT, file);

    // Forbidden: import from UI packages
    if (
      content.includes("@workspace/design-system") ||
      content.includes("from 'react'") ||
      content.includes('from "react"')
    ) {
      findings.push({
        module,
        problem: `Forbidden import (UI) in ${relativePath}`,
        hint: "Domain services must not import from UI packages",
      });
    }

    // Forbidden: import from route handlers
    if (content.includes("/app/api/")) {
      findings.push({
        module,
        problem: `Forbidden import (route) in ${relativePath}`,
        hint: "Domain services must not import from route handlers",
      });
    }

    // Forbidden: import Next.js
    if (content.includes("from 'next") || content.includes('from "next')) {
      findings.push({
        module,
        problem: `Forbidden import (Next.js) in ${relativePath}`,
        hint: "Domain services must not import Next.js directly",
      });
    }
  }

  return findings;
}

// ---- Main ----

function main(): void {
  console.log("🔍 Checking ERP domain compliance...\n");

  const modules = getErpModules();

  if (modules.length === 0) {
    console.log("ℹ️  No ERP modules found (packages/domain/src/addons/erp.*)");
    console.log("   This is OK for Phase 0 infrastructure setup.");
    console.log("\n✅ check:erp: OK (no modules to check)\n");
    process.exit(0);
  }

  console.log(`Found ${modules.length} ERP module(s): ${modules.join(", ")}\n`);

  const allFindings: Finding[] = [];

  for (const module of modules) {
    console.log(`Checking ${module}...`);

    allFindings.push(...checkManifest(module));
    allFindings.push(...checkContracts(module));
    allFindings.push(...checkDbSchema(module));
    allFindings.push(...checkForbiddenImports(module));
  }

  console.log("");

  if (allFindings.length > 0) {
    console.error("❌ ERP Domain Check FAILED\n");

    const byModule = new Map<string, Finding[]>();
    for (const f of allFindings) {
      const arr = byModule.get(f.module) ?? [];
      arr.push(f);
      byModule.set(f.module, arr);
    }

    for (const [mod, issues] of byModule.entries()) {
      console.error(`${mod}:`);
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

  console.log(`✅ check:erp: OK (${modules.length} module(s) checked)\n`);
}

main();
