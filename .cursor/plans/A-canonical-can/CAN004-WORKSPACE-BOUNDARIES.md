## 1) ESLint 9 Super-Strict Override (tailored to `@workspace/*`)

Paste this into `eslint.config.mjs/js`.

This version:

- bans raw responses (`NextResponse.json`, `new Response`)
- bans `console.log/info/debug`
- bans importing `NextResponse` or `next/*` in route files
- **forces route files to be spec-only**: no relative imports, and only allowlisted packages

```js
// eslint.config.mjs (or eslint.config.js)
export default [
  // ... your existing config

  {
    files: ['apps/**/app/api/**/route.{ts,tsx}'],
    rules: {
      // No console noise (keep warn/error allowed)
      'no-console': ['error', { allow: ['warn', 'error'] }],

      // No raw response construction in route handlers
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "NewExpression[callee.name='Response'], NewExpression[callee.name='NextResponse']",
          message:
            'Route handlers MUST NOT construct Response/NextResponse. Use kernel(spec) only.',
        },
        {
          selector:
            "CallExpression[callee.object.name='NextResponse'][callee.property.name='json']",
          message:
            'Route handlers MUST NOT call NextResponse.json(). Use kernel(spec) only.',
        },
      ],

      // Ban NextResponse import and all next/* imports in route files
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'next/server',
              importNames: ['NextResponse'],
              message:
                'Do not import NextResponse in route files. Kernel is the only allowed layer to use NextResponse.',
            },
          ],
          patterns: [
            {
              group: ['next/*'],
              message:
                'Do not import from next/* in route files. Route files are spec-only; kernel owns runtime concerns.',
            },

            // Ban relative imports entirely in route files
            {
              group: ['./*', '../*'],
              message:
                'Route files MUST NOT use relative imports. Use @workspace/* packages only.',
            },

            // Optional: if you want to prevent any other workspace imports except the allowlist,
            // keep this broad deny and rely on the CI script for exact allowlist.
            // If too strict, comment out.
            // {
            //   group: ["@workspace/*"],
            //   message:
            //     "Route files may only import from @workspace/api-kernel, @workspace/validation, @workspace/domain.",
            // },
          ],
        },
      ],
    },
  },
];
```

> ESLint alone can’t perfectly express an allowlist for `@workspace/*` without extra plugins.
> The **CI script below is the deterministic gate** that enforces the exact allowlist.

---

## 2) `scripts/check-api-kernel.ts` (tailored allowlist to `@workspace/*`)

Create/replace: `scripts/check-api-kernel.ts`

This enforces:

- must use `kernel(...)`
- must export `export const GET/POST/... = kernel(...)`
- no `NextResponse.json`, `new Response`, `console.log/info/debug`
- **imports allowlist only**, no relative imports, no `next/*`

```ts
import fs from 'node:fs';
import path from 'node:path';

type Finding = { file: string; problem: string; hint?: string };

const ROOT = process.cwd();
const APPS_ROOT = path.join(ROOT, 'apps');
const ROUTE_FILE_REGEX = /\/app\/api\/.*\/route\.(ts|tsx)$/;

const ALLOW_ZOD_IN_ROUTES = true;

// ✅ Exact allowlist for route.ts imports
// IMPORTANT: Routes MUST NOT import @workspace/auth - kernel handles auth extraction/enforcement
const ALLOWED_IMPORT_PREFIXES = [
  '@workspace/api-kernel/',
  '@workspace/validation/',
  '@workspace/domain/',
];

// ✅ Also allow direct (non-slash) entry imports
const ALLOWED_EXACT = new Set<string>([
  '@workspace/api-kernel',
  '@workspace/validation',
  '@workspace/domain',
  ...(ALLOW_ZOD_IN_ROUTES ? ['zod'] : []),
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
  return fs.readFileSync(file, 'utf8');
}

function isAllowedImport(source: string) {
  if (ALLOWED_EXACT.has(source)) return true;
  return ALLOWED_IMPORT_PREFIXES.some((p) => source.startsWith(p));
}

function scanImports(file: string, content: string): Finding[] {
  const findings: Finding[] = [];

  // import ... from "source"
  // import "source"
  const importRe =
    /import\s+(?:type\s+)?(?:[^"']+\s+from\s+)?["']([^"']+)["'];?/g;

  let m: RegExpExecArray | null;
  while ((m = importRe.exec(content))) {
    const source = m[1];

    // Forbid relative imports
    if (source.startsWith('./') || source.startsWith('../')) {
      findings.push({
        file,
        problem: `Forbidden import (relative): "${source}"`,
        hint: 'Route files are spec-only. Import only from @workspace/api-kernel, @workspace/validation, @workspace/domain (and optionally zod).',
      });
      continue;
    }

    // Forbid Next runtime imports
    if (source === 'next' || source.startsWith('next/')) {
      findings.push({
        file,
        problem: `Forbidden import (Next runtime): "${source}"`,
        hint: 'Route files must not import next/* directly. Kernel owns NextRequest/NextResponse and runtime concerns.',
      });
      continue;
    }

    // Allowlist check
    if (!isAllowedImport(source)) {
      findings.push({
        file,
        problem: `Import not in allowlist: "${source}"`,
        hint: `Allowed: ${[
          ...ALLOWED_EXACT,
          ...ALLOWED_IMPORT_PREFIXES.map((p) => `${p}...`),
        ].join(', ')}`,
      });
    }
  }

  return findings;
}

function scanFile(file: string, content: string): Finding[] {
  const findings: Finding[] = [];

  // Kernel presence
  const hasKernel =
    /\b(kernel)\s*\(/.test(content) || /=\s*kernel\s*\(/.test(content);

  if (!hasKernel) {
    findings.push({
      file,
      problem: 'Missing kernel(spec) usage',
      hint: 'Route files must export handlers as: export const GET/POST = kernel({ ... })',
    });
  }

  // Must export at least one HTTP method with kernel
  const exportsKernelMethod =
    /export\s+const\s+(GET|POST|PUT|PATCH|DELETE)\s*=\s*kernel\s*\(/.test(
      content,
    );

  if (!exportsKernelMethod) {
    findings.push({
      file,
      problem: 'Missing `export const METHOD = kernel(...)` pattern',
      hint: 'Use: export const GET = kernel({ ... }) (same for POST/PUT/PATCH/DELETE).',
    });
  }

  // Forbidden bypass patterns
  const forbidden: Array<{ re: RegExp; msg: string; hint?: string }> = [
    {
      re: /\bNextResponse\.json\s*\(/,
      msg: 'Forbidden: NextResponse.json(...) used',
      hint: 'Kernel returns standardized envelopes. Do not bypass.',
    },
    {
      re: /\bnew\s+Response\s*\(/,
      msg: 'Forbidden: new Response(...) used',
      hint: 'Extend kernel helpers if you need special headers/cookies.',
    },
    {
      re: /\bnew\s+NextResponse\s*\(/,
      msg: 'Forbidden: new NextResponse(...) used',
      hint: 'Kernel is the only allowed layer to touch NextResponse.',
    },
    {
      re: /\bconsole\.(log|debug|info)\s*\(/,
      msg: 'Forbidden: console logging used',
      hint: 'Use Pino via kernel (correlation keys injected).',
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
    ROUTE_FILE_REGEX.test(f.replace(/\\/g, '/')),
  );

  if (routeFiles.length === 0) {
    console.log('check-api-kernel: No route files found. OK.');
    process.exit(0);
  }

  const findings: Finding[] = [];
  for (const file of routeFiles) {
    const content = read(file);
    findings.push(...scanFile(file, content));
  }

  if (findings.length > 0) {
    console.error('\n❌ API Kernel Drift Check FAILED\n');

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
      console.error('');
    }

    process.exit(1);
  }

  console.log(
    `✅ check-api-kernel: OK (${routeFiles.length} route files checked; allowlist enforced)`,
  );
}

main();
```

### Add script to `package.json`

Use `tsx` (simple + fast):

```json
{
  "scripts": {
    "check:api-kernel": "tsx scripts/check-api-kernel.ts"
  }
}
```

Then in CI:

```bash
pnpm check:api-kernel
```

---

## Temporary fallback (if you haven't created `@workspace/api-kernel` and `@workspace/domain` yet)

Change the allowlist to permit only what you currently have **without leaking auth into routes**.
**Canonical rule:** Routes MUST NOT import `@workspace/auth` — **kernel owns auth extraction/enforcement**.

```ts
const ALLOWED_IMPORT_PREFIXES = [
  '@workspace/validation/',
  // NOTE: Do NOT allow @workspace/auth in route files.
  // Kernel handles auth extraction/enforcement.
  // Do NOT allow design-system in route files (UI never belongs in API routes).
];
const ALLOWED_EXACT = new Set<string>([
  '@workspace/validation',
  ...(ALLOW_ZOD_IN_ROUTES ? ['zod'] : []),
]);
```

Best practice: route handlers stay spec-only and import ONLY:
`@workspace/api-kernel/*`, `@workspace/validation/*`, `@workspace/domain/*` (and optionally zod).

---
