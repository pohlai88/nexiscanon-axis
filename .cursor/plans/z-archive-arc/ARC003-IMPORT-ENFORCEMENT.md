> **🚫 Status: ARCHIVED (ARC) — DO NOT USE**  
> Superseded by: `A-canonical-can/CAN004-WORKSPACE-BOUNDARIES.md`  
> Kept for historical reference only.

---

**🚫 ARCHIVED - DO NOT USE**

**Superseded by:** `A-canonical-can/CAN004-WORKSPACE-BOUNDARIES.md`  
**Reason:** Contains outdated `@repo/*` references. Canonical enforcement uses `@workspace/*`.  
**Date Archived:** 2026-01-19

This file is kept for historical reference only.

---

## Historical Content (Do Not Follow)

The content below represents an earlier iteration that used incorrect workspace aliases. Do NOT copy/paste this code.

---

## 1) ESLint 9 Super-Strict Override (Spec-only Route Files)

Paste into `eslint.config.mjs/js`.

> **Note:** This workspace uses `@workspace/*` aliasing. Examples below show `@repo/*` for historical reference only.

```js
// eslint.config.mjs (or eslint.config.js)
export default [
  // ... your existing config

  {
    files: ["apps/**/app/api/**/route.{ts,tsx}"],
    rules: {
      /**
       * 0) No console noise
       */
      "no-console": ["error", { allow: ["warn", "error"] }],

      /**
       * 1) Absolute ban: raw response construction
       */
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "NewExpression[callee.name='Response'], NewExpression[callee.name='NextResponse']",
          message:
            "Route handlers MUST NOT construct Response/NextResponse. Use kernel(spec) only.",
        },
        {
          selector:
            "CallExpression[callee.object.name='NextResponse'][callee.property.name='json']",
          message:
            "Route handlers MUST NOT call NextResponse.json(). Use kernel(spec) only.",
        },
      ],

      /**
       * 2) Import allowlist: ONLY these imports are permitted in route.ts(x)
       *    - kernel
       *    - contracts
       *    - domain (business logic)
       *    - zod (optional; remove if you want contracts-only schemas)
       *
       * Everything else becomes a lint error.
       */
      "no-restricted-imports": [
        "error",
        {
          // Deny common drift imports explicitly (clear error messages)
          paths: [
            {
              name: "next/server",
              message:
                "Do not import from next/server in route files. Route files are spec-only; kernel owns NextRequest/NextResponse handling.",
            },
            {
              name: "next/headers",
              message:
                "Do not import next/headers in route files. Kernel resolves tenant/auth/context.",
            },
            {
              name: "next/navigation",
              message: "Do not import next/navigation in route files.",
            },
          ],

          // Deny everything except allowlisted patterns:
          patterns: [
            // ❌ Block all relative imports (route files should not reach sideways)
            {
              group: ["./*", "../*", "**/*"],
              message:
                "Route files MUST NOT use relative imports. Only import from @workspace/api-kernel, @workspace/validation, @workspace/domain (and optionally zod).",
            },

            // ✅ Allowlist exceptions: put negated patterns first
            // NOTE: no-restricted-imports uses "ignore" via negation only in some ESLint versions;
            // so we implement allowlist by blocking known-bad + relative imports,
            // and rely on the CI script (below) for deterministic enforcement.
            //
            // If you want a pure allowlist enforced by ESLint alone, use eslint-plugin-import with import/no-restricted-paths.
          ],
        },
      ],
    },
  },
];
```

### If you want "validation-only schemas" (even stricter)

Remove `zod` usage from route files by policy:

- Don't write inline schemas in routes
- Only import schemas from `@workspace/validation/*`

This prevents schema duplication.

---

## 2) Super-Strict CI Drift Gate (Allowlist + Kernel-only)

Replace your `scripts/check-api-kernel.ts` with this stricter version (or add as `check-api-kernel-strict.ts`).

What it enforces:

- Must export at least one handler using `kernel({ ... })`
- No `NextResponse.json` / `new Response`
- No `next/server` imports in route files
- **Only allowed imports**:
  - `@workspace/api-kernel/*`
  - `@workspace/validation/*`
  - `@workspace/domain/*`
  - `zod` (optional toggle)

- No relative imports (`./` or `../`)

```ts
// scripts/check-api-kernel.ts
import fs from "node:fs";
import path from "node:path";

type Finding = { file: string; problem: string; hint?: string };

const ROOT = process.cwd();
const APPS_ROOT = path.join(ROOT, "apps");
const ROUTE_FILE_REGEX = /\/app\/api\/.*\/route\.(ts|tsx)$/;

const ALLOW_ZOD_IN_ROUTES = true;

// Allowlist patterns (edit to match your aliasing)
const ALLOWED_IMPORT_PREFIXES = [
  "@workspace/api-kernel/",
  "@workspace/validation/",
  "@workspace/domain/",
];

const ALLOWED_EXACT = new Set<string>([
  ...(ALLOW_ZOD_IN_ROUTES ? ["zod"] : []),
]);

function walk(dir: string, out: string[] = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

function read(file: string) {
  return fs.readFileSync(file, "utf8");
}

function isAllowedImport(source: string) {
  if (ALLOWED_EXACT.has(source)) return true;
  return ALLOWED_IMPORT_PREFIXES.some((p) => source.startsWith(p));
}

function scanImports(file: string, content: string): Finding[] {
  const findings: Finding[] = [];

  // Matches:
  // import ... from "source"
  // import "source"
  const importRe =
    /import\s+(?:type\s+)?(?:[^"']+\s+from\s+)?["']([^"']+)["'];?/g;

  let m: RegExpExecArray | null;
  while ((m = importRe.exec(content))) {
    const source = m[1];

    // forbid relative
    if (source.startsWith("./") || source.startsWith("../")) {
      findings.push({
        file,
        problem: `Forbidden import (relative): "${source}"`,
        hint: "Route files are spec-only. Import only from @workspace/api-kernel, @workspace/validation, @workspace/domain (and optionally zod).",
      });
      continue;
    }

    // forbid next/*
    if (source.startsWith("next/") || source === "next") {
      findings.push({
        file,
        problem: `Forbidden import (Next runtime): "${source}"`,
        hint: "Kernel owns NextRequest/NextResponse, headers, and auth/tenant resolution.",
      });
      continue;
    }

    // allowlist check
    if (!isAllowedImport(source)) {
      findings.push({
        file,
        problem: `Import not in allowlist: "${source}"`,
        hint: `Allowed: ${ALLOWED_IMPORT_PREFIXES.join(", ")}${ALLOW_ZOD_IN_ROUTES ? ", zod" : ""}`,
      });
    }
  }

  return findings;
}

function scanFile(file: string, content: string): Finding[] {
  const findings: Finding[] = [];

  // Must contain kernel usage
  const hasKernel =
    /\b(kernel)\s*\(/.test(content) || /=\s*kernel\s*\(/.test(content);

  if (!hasKernel) {
    findings.push({
      file,
      problem: "Missing kernel(spec) usage",
      hint: "Route files must export handlers as: export const GET/POST = kernel({ ... })",
    });
  }

  // Must export at least one HTTP method using kernel
  const exportsKernelMethod =
    /export\s+const\s+(GET|POST|PUT|PATCH|DELETE)\s*=\s*kernel\s*\(/.test(
      content
    );

  if (!exportsKernelMethod) {
    findings.push({
      file,
      problem: "Missing `export const METHOD = kernel(...)` pattern",
      hint: "Use: export const GET = kernel({ ... }) (same for POST/PUT/PATCH/DELETE).",
    });
  }

  // Forbidden response patterns
  const forbidden: Array<{ re: RegExp; msg: string; hint?: string }> = [
    {
      re: /\bNextResponse\.json\s*\(/,
      msg: "Forbidden: NextResponse.json(...) used",
      hint: "Kernel returns standardized envelopes. Do not bypass.",
    },
    {
      re: /\bnew\s+Response\s*\(/,
      msg: "Forbidden: new Response(...) used",
      hint: "If you need custom headers/cookies, extend kernel helpers—not route files.",
    },
    {
      re: /\bnew\s+NextResponse\s*\(/,
      msg: "Forbidden: new NextResponse(...) used",
      hint: "Kernel is the only allowed layer to touch NextResponse.",
    },
    {
      re: /\bconsole\.(log|debug|info)\s*\(/,
      msg: "Forbidden: console logging used",
      hint: "Use Pino logger via kernel (correlation keys injected).",
    },
  ];

  for (const f of forbidden) {
    if (f.re.test(content))
      findings.push({ file, problem: f.msg, hint: f.hint });
  }

  // Import allowlist enforcement
  findings.push(...scanImports(file, content));

  return findings;
}

function main() {
  if (!fs.existsSync(APPS_ROOT)) {
    console.error(`ERROR: apps folder not found at: ${APPS_ROOT}`);
    process.exit(2);
  }

  const allFiles = walk(APPS_ROOT);
  const routeFiles = allFiles.filter((f) =>
    ROUTE_FILE_REGEX.test(f.replace(/\\/g, "/"))
  );

  if (routeFiles.length === 0) {
    console.log("check-api-kernel: No route files found. OK.");
    process.exit(0);
  }

  const findings: Finding[] = [];
  for (const file of routeFiles) {
    const content = read(file);
    findings.push(...scanFile(file, content));
  }

  if (findings.length > 0) {
    console.error("\n❌ API Kernel Drift Check FAILED\n");

    const byFile = new Map<string, Finding[]>();
    for (const f of findings) {
      const arr = byFile.get(f.file) ?? [];
      arr.push(f);
      byFile.set(f.file, arr);
    }

    for (const [file, issues] of byFile.entries()) {
      console.error(`- ${path.relative(ROOT, file)}`);
      for (const i of issues) {
        console.error(`   • ${i.problem}`);
        if (i.hint) console.error(`     ↳ ${i.hint}`);
      }
      console.error("");
    }

    console.error(
      "Fix: route files must be spec-only and export METHOD = kernel({ ... }).\n"
    );
    process.exit(1);
  }

  console.log(
    `✅ check-api-kernel: OK (${routeFiles.length} route files checked, strict allowlist enabled)`
  );
}

main();
```

### Package script (recommended)

Use `tsx` for zero-setup execution:

```json
{
  "scripts": {
    "check:api-kernel": "tsx scripts/check-api-kernel.ts"
  }
}
```

### CI step

Run in your pipeline:

```bash
pnpm check:api-kernel
```
