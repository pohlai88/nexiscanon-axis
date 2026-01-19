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

  // Gate 1: Output schema must be explicit (no `any`)
  // Find kernel({ blocks and check for output: key using brace-counting
  const kernelStarts: number[] = [];
  const kernelRegex = /\bkernel\s*\(\s*\{/g;
  let match: RegExpExecArray | null;
  
  while ((match = kernelRegex.exec(content))) {
    kernelStarts.push(match.index + match[0].length - 1); // Position of opening {
  }
  
  for (const startPos of kernelStarts) {
    // Extract kernel config block using brace counting (string-aware)
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
    
    // Check for output: key at property level (not nested in objects)
    // Look for output: at start of line or after comma/semicolon
    const hasOutput = /(?:^|[,;])\s*output\s*:/m.test(withoutComments);
    
    if (!hasOutput) {
      findings.push({
        file,
        problem: "Missing explicit output schema in kernel call",
        hint: "All kernel handlers must specify output: ZodSchema for type safety",
      });
    }
  }

  // Gate 2: No direct service instantiation (must use container tokens)
  // Check for direct `new ServiceImpl()` patterns in ERP routes
  if (file.includes("/api/erp/")) {
    const hasDirectInstantiation = /new\s+\w+Service(?:Impl)?\s*\(/.test(content);
    if (hasDirectInstantiation) {
      findings.push({
        file,
        problem: "Direct service instantiation detected",
        hint: "ERP routes must use container.get(ERP_BASE_TOKENS.ServiceName) instead of new ServiceImpl()",
      });
    }

    // Must use getDomainContainer() for service access
    const usesContainer = content.includes("getDomainContainer()") || content.includes("container.get(");
    const callsService = /\w+Service\./.test(content) || content.includes("Service(");
    
    if (callsService && !usesContainer) {
      findings.push({
        file,
        problem: "Service usage without container",
        hint: "Must use: const container = await getDomainContainer(); const service = container.get(TOKEN);",
      });
    }
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
