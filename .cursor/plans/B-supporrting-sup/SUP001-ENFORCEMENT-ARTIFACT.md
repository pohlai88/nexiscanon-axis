> **Status: SUPPORTING (SUP)**  
> Context only. If anything conflicts with **CANONICAL (CAN)** docs, the CAN docs win.  
> Entry point: `A-canonical-can/CAN000-CANON-MAP.md`

---

Absolutely — here are the **two paste-ready enforcement artifacts**.

---

## 1) ESLint 9 override snippet (for `apps/**/app/api/**/route.ts`)

Add this to your **ESLint flat config** (e.g. `eslint.config.js` / `eslint.config.mjs`).
This override does 4 things:

- ✅ forbids `NextResponse.json(...)` and `new Response(...)` inside route handlers
- ✅ forbids `console.*`
- ✅ discourages bypassing the kernel by importing from `next/server` (optional strict mode)
- ✅ optionally restricts imports to only allow your kernel/contracts/domain (recommended once stable)

```js
// eslint.config.mjs (or eslint.config.js)
export default [
  // ... your existing config

  {
    files: ['apps/**/app/api/**/route.{ts,tsx}'],
    rules: {
      // 1) No console in production server paths
      'no-console': ['error', { allow: ['warn', 'error'] }],

      // 2) Hard forbid raw Response constructions in route handlers
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "NewExpression[callee.name='Response'], NewExpression[callee.name='NextResponse']",
          message:
            'Do not construct Response/NextResponse directly in route handlers. Use kernel(spec) only.',
        },
        {
          selector:
            "CallExpression[callee.object.name='NextResponse'][callee.property.name='json']",
          message:
            'Do not call NextResponse.json() in route handlers. Use kernel(spec) which returns standardized envelopes.',
        },
      ],

      // 3) Optional: discourage importing NextResponse in routes (kernel should be the only place)
      // If this is too strict early on, change to 'warn' or remove.
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'next/server',
              importNames: ['NextResponse'],
              message:
                'Do not import NextResponse in route handlers. Use kernel(spec) only.',
            },
          ],
          patterns: [],
        },
      ],

      // 4) Optional: enforce kernel usage by forcing at least one identifier import
      // (Not perfect enforcement, CI script below is the real gate.)
      // You can remove this if it causes friction.
      // "no-restricted-imports": ... already used above; keep CI script as canonical gate.
    },
  },
];
```

> Note: ESLint can’t perfectly prove “you exported GET = kernel(spec)” in all cases.
> That’s why the CI script below is the **deterministic hard gate**.

---

## 2) `scripts/check-api-kernel.ts` (CI drift gate)

Create this file: `scripts/check-api-kernel.ts`

What it enforces:

- Every `apps/**/app/api/**/route.ts(x)` must contain `= kernel(` (or `kernel(` call)
- No `NextResponse.json(` or `new Response(` inside those route files
- No `NextResponse` construction/import patterns (configurable)
- Prints exact file paths and exits non-zero on failure

```ts
// scripts/check-api-kernel.ts
import fs from 'node:fs';
import path from 'node:path';

type Finding = { file: string; problem: string; hint?: string };

const ROOT = process.cwd();

// Adjust if your apps folder name differs
const API_ROOT = path.join(ROOT, 'apps');

const ROUTE_FILE_REGEX = /\/app\/api\/.*\/route\.(ts|tsx)$/;

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

function scanFile(file: string, content: string): Finding[] {
  const findings: Finding[] = [];

  const mustContainKernel =
    /\b(kernel)\s*\(/.test(content) || /=\s*kernel\s*\(/.test(content);

  if (!mustContainKernel) {
    findings.push({
      file,
      problem: 'Missing kernel(spec) usage',
      hint: 'Route files must export handlers as: export const GET = kernel({ ... })',
    });
  }

  // Hard forbidden patterns that bypass the kernel envelopes
  const forbidden: Array<{ re: RegExp; msg: string; hint?: string }> = [
    {
      re: /\bNextResponse\.json\s*\(/,
      msg: 'Forbidden: NextResponse.json(...) used in route handler',
      hint: 'Use kernel(spec) and return data from handler; kernel builds the envelope.',
    },
    {
      re: /\bnew\s+Response\s*\(/,
      msg: 'Forbidden: new Response(...) used in route handler',
      hint: 'Use kernel(spec) only. If you need custom headers, extend kernel.http helpers.',
    },
    {
      re: /\bnew\s+NextResponse\s*\(/,
      msg: 'Forbidden: new NextResponse(...) used in route handler',
      hint: 'Use kernel(spec) only.',
    },
    {
      re: /\bconsole\.(log|debug|info)\s*\(/,
      msg: 'Forbidden: console logging in route handler',
      hint: 'Use Pino via @workspace/observability/logger (kernel does this automatically).',
    },
  ];

  for (const f of forbidden) {
    if (f.re.test(content)) {
      findings.push({ file, problem: f.msg, hint: f.hint });
    }
  }

  // Optional stricter checks: discourage importing NextResponse in route files
  // (Allowed if you need NextRequest/headers; this flags only NextResponse import.)
  const nextServerImport = /from\s+["']next\/server["']/;
  if (nextServerImport.test(content)) {
    // If importing NextResponse explicitly, flag it
    const importsNextResponse =
      /import\s*{[^}]*\bNextResponse\b[^}]*}\s*from\s*["']next\/server["']/.test(
        content,
      );

    if (importsNextResponse) {
      findings.push({
        file,
        problem:
          'Forbidden: importing NextResponse from next/server in route handler',
        hint: 'Kernel is the only layer allowed to use NextResponse.',
      });
    }
  }

  return findings;
}

function main() {
  if (!fs.existsSync(API_ROOT)) {
    console.error(`ERROR: apps folder not found at: ${API_ROOT}`);
    process.exit(2);
  }

  const allFiles = walk(API_ROOT);
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

    console.error(
      'Fix: refactor route handlers to export `GET/POST = kernel({ ... })` and remove raw NextResponse/Response usage.\n',
    );
    process.exit(1);
  }

  console.log(
    `✅ check-api-kernel: OK (${routeFiles.length} route files checked)`,
  );
}

main();
```

### Add it to package scripts

In your root `package.json`:

```json
{
  "scripts": {
    "check:api-kernel": "node --loader ts-node/esm scripts/check-api-kernel.ts"
  }
}
```

If you don’t want `ts-node`, compile it via `tsc` or use `tsx`:

```json
{
  "scripts": {
    "check:api-kernel": "tsx scripts/check-api-kernel.ts"
  }
}
```

### Add to CI

Run it after install:

```bash
pnpm check:api-kernel
```
