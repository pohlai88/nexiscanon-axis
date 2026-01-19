// scripts/check-api-kernel.ts
// CI drift gate: ensures all route files use kernel pattern only

import fs from "node:fs";
import path from "node:path";

type Finding = { file: string; problem: string; hint?: string };

const ROOT = process.cwd();
const APPS_ROOT = path.join(ROOT, "apps");
const ROUTE_FILE_REGEX = /\/app\/api\/.*\/route\.(ts|tsx)$/;

const ALLOW_ZOD_IN_ROUTES = true;

// ✅ Exact allowlist for route.ts imports
const ALLOWED_IMPORT_PREFIXES = [
  "@workspace/api-kernel/",
  "@workspace/validation/",
  "@workspace/domain/",
  "@workspace/jobs/", // Background jobs package
];

// ✅ Also allow direct (non-slash) entry imports
const ALLOWED_EXACT = new Set<string>([
  "@workspace/api-kernel",
  "@workspace/validation",
  "@workspace/domain",
  "@workspace/app-runtime",
  "@workspace/jobs", // Background jobs package
  ...(ALLOW_ZOD_IN_ROUTES ? ["zod"] : []),
]);

function walk(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip node_modules and hidden directories
      if (entry.name !== "node_modules" && !entry.name.startsWith(".")) {
        walk(fullPath, out);
      }
    } else {
      out.push(fullPath);
    }
  }
  return out;
}

function read(file: string): string {
  return fs.readFileSync(file, "utf8");
}

function isAllowedImport(source: string): boolean {
  if (ALLOWED_EXACT.has(source)) return true;
  return ALLOWED_IMPORT_PREFIXES.some((prefix) => source.startsWith(prefix));
}

function scanImports(file: string, content: string): Finding[] {
  const findings: Finding[] = [];

  // Match: import ... from "source" or import "source"
  const importRe =
    /import\s+(?:type\s+)?(?:[^"']+\s+from\s+)?["']([^"']+)["'];?/g;

  let match: RegExpExecArray | null;
  while ((match = importRe.exec(content))) {
    const source = match[1];

    // Forbid relative imports
    if (source.startsWith("./") || source.startsWith("../")) {
      findings.push({
        file,
        problem: `Forbidden import (relative): "${source}"`,
        hint: "Route files are spec-only. Import only from @workspace/api-kernel, @workspace/validation, @workspace/domain (and optionally zod).",
      });
      continue;
    }

    // Forbid Next runtime imports
    if (source === "next" || source.startsWith("next/")) {
      findings.push({
        file,
        problem: `Forbidden import (Next runtime): "${source}"`,
        hint: "Route files must not import next/* directly. Kernel owns NextRequest/NextResponse.",
      });
      continue;
    }

    // Forbid direct DB imports (routes must use @workspace/app-runtime)
    if (source === "@workspace/db" || source.startsWith("@workspace/db/")) {
      findings.push({
        file,
        problem: `Forbidden import (direct DB): "${source}"`,
        hint: "Route files must not import @workspace/db. Use @workspace/app-runtime to get the wired domain container.",
      });
      continue;
    }

    // Allowlist check
    if (!isAllowedImport(source)) {
      findings.push({
        file,
        problem: `Import not in allowlist: "${source}"`,
        hint: `Allowed: ${[...ALLOWED_EXACT, ...ALLOWED_IMPORT_PREFIXES.map((p) => `${p}...`)].join(", ")}`,
      });
    }
  }

  return findings;
}

function scanFile(file: string, content: string): Finding[] {
  const findings: Finding[] = [];

  // Must contain kernel usage
  const hasKernel =
    /\bkernel\s*\(/.test(content) || /=\s*kernel\s*\(/.test(content);

  if (!hasKernel) {
    findings.push({
      file,
      problem: "Missing kernel(spec) usage",
      hint: "Route files must export handlers as: export const GET/POST = kernel({ ... })",
    });
  }

  // Must export at least one HTTP method with kernel
  const exportsKernelMethod =
    /export\s+const\s+(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s*=\s*kernel\s*\(/.test(
      content
    );

  if (!exportsKernelMethod) {
    findings.push({
      file,
      problem: "Missing `export const METHOD = kernel(...)` pattern",
      hint: "Use: export const GET = kernel({ ... }) (same for POST/PUT/PATCH/DELETE).",
    });
  }

  // Forbidden bypass patterns
  const forbidden: Array<{ re: RegExp; msg: string; hint?: string }> = [
    {
      re: /\bNextResponse\.json\s*\(/,
      msg: "Forbidden: NextResponse.json(...) used",
      hint: "Kernel returns standardized envelopes. Do not bypass.",
    },
    {
      re: /\bnew\s+Response\s*\(/,
      msg: "Forbidden: new Response(...) used",
      hint: "Extend kernel helpers if you need special headers/cookies.",
    },
    {
      re: /\bnew\s+NextResponse\s*\(/,
      msg: "Forbidden: new NextResponse(...) used",
      hint: "Kernel is the only allowed layer to touch NextResponse.",
    },
    {
      re: /\bconsole\.(log|debug|info)\s*\(/,
      msg: "Forbidden: console logging used",
      hint: "Use Pino via kernel (correlation keys injected).",
    },
  ];

  for (const f of forbidden) {
    if (f.re.test(content)) {
      findings.push({ file, problem: f.msg, hint: f.hint });
    }
  }

  // Import allowlist enforcement
  findings.push(...scanImports(file, content));

  return findings;
}

function main(): void {
  console.log("🔍 Checking API kernel compliance...\n");

  if (!fs.existsSync(APPS_ROOT)) {
    console.log("⚠️  apps folder not found. Skipping check.");
    process.exit(0);
  }

  const allFiles = walk(APPS_ROOT);
  const routeFiles = allFiles.filter((f) =>
    ROUTE_FILE_REGEX.test(f.replace(/\\/g, "/"))
  );

  if (routeFiles.length === 0) {
    console.log("✅ No route files found. OK.");
    process.exit(0);
  }

  console.log(`Found ${routeFiles.length} route file(s) to check:\n`);

  const findings: Finding[] = [];
  for (const file of routeFiles) {
    const relativePath = path.relative(ROOT, file);
    console.log(`  - ${relativePath}`);
    const content = read(file);
    findings.push(...scanFile(file, content));
  }

  console.log("");

  if (findings.length > 0) {
    console.error("❌ API Kernel Drift Check FAILED\n");

    const byFile = new Map<string, Finding[]>();
    for (const f of findings) {
      const arr = byFile.get(f.file) ?? [];
      arr.push(f);
      byFile.set(f.file, arr);
    }

    for (const [file, issues] of byFile.entries()) {
      console.error(`${path.relative(ROOT, file)}:`);
      for (const issue of issues) {
        console.error(`   • ${issue.problem}`);
        if (issue.hint) {
          console.error(`     ↳ ${issue.hint}`);
        }
      }
      console.error("");
    }

    console.error(
      "Fix: route files must be spec-only and export METHOD = kernel({ ... }).\n"
    );
    process.exit(1);
  }

  console.log(
    `✅ check-api-kernel: OK (${routeFiles.length} route file(s) checked; allowlist enforced)\n`
  );
}

main();
