# Cursor Task: Zero-Drift API Kernel + Odoo-Inspired Domain Addons (Foundation Extraction)

You are working in a Turborepo monorepo using:

- Next.js App Router (Route Handlers)
- TypeScript strict
- Zod v4 in @workspace/validation (SSOT)
- Neon Postgres
- Neon Auth (@workspace/auth)
- Pino logging
- OpenTelemetry tracing (Tempo)
- GlitchTip (Sentry-compatible)
- Graphile Worker (later)
- Cloudflare R2/Workers (later)

## Objective (Non-Negotiable)

Refactor/extract the repo so ALL Next.js API routes under `apps/**/app/api/**/route.ts(x)` follow ONE pattern ONLY:
`export const METHOD = kernel({ ... })`

Prevent pattern drift permanently by adding:

1. ESLint override for route files
2. CI drift script `scripts/check-api-kernel.ts`

Also scaffold a minimal Odoo-inspired domain foundation (addons + manifest + dependsOn + extension points),
BUT do NOT implement full Odoo (no view engine, no XML, no runtime module install/uninstall).

---

## HARD RULES (Stop Drift)

1. Route files are **spec-only**:
   - Allowed imports ONLY:
     - `@workspace/api-kernel/*`
     - `@workspace/validation/*`
     - `@workspace/domain/*`
     - `zod` (optional, but prefer schemas from @workspace/validation)
   - FORBIDDEN:
     - `NextResponse.json(...)`
     - `new Response(...)`
     - importing `NextResponse` from `next/server`
     - relative imports (`./` or `../`)
     - `console.log/info/debug`
2. Kernel MUST enforce:
   - ALS context: traceId, requestId, tenantId, actorId, routeId, method
   - Tenant enforcement (required/optional)
   - Neon Auth enforcement (required/optional) + role checks
   - Zod input parse (query/body) and Zod output parse
   - Standard envelopes:
     - success: `{ data, meta:{traceId} }`
     - error: `{ error:{code,message,details?,fieldErrors?,traceId} }`
   - Correct HTTP status codes (no 200 with error payload)
   - Logging via Pino with correlation keys
   - Tracing: mark span error on exceptions
3. Domain MUST be Odoo-inspired:
   - `packages/domain/src/addons/<module>/manifest.ts`
   - topological loading by `dependsOn`
   - extension points via `container.extend(token, fn)`
   - include only a `core` addon initially (IdService + AuditService)
4. Keep it lean:
   - No OpenAPI generation unless already present
   - No contract versioning v1/v2
   - No new infra beyond the packages requested

---

## DELIVERABLES (Create/Refactor)

### A) Create packages (if missing)

Create these packages under `packages/` with `src/index.ts` exports:

1. `@workspace/observability`
   - `src/context.ts` (AsyncLocalStorage)
   - `src/logger.ts` (Pino child logger auto-inject correlation keys)
   - `src/tracing.ts` (OTel helper: getActiveTraceId(), markSpanError())
2. `@workspace/api-kernel`
   - `src/types.ts` (RouteSpec types)
   - `src/http.ts` (ok/fail envelopes)
   - `src/errors.ts` (error codes + normalization)
   - `src/tenant.ts` (single canonical tenant resolver)
   - `src/kernel.ts` (the pipeline wrapper)
3. `@workspace/domain`
   - `src/types.ts` (AddonManifest, Container, Token, JobRegistry, EventBus)
   - `src/container.ts` (provide/provideValue/get/extend)
   - `src/bootstrap.ts` (topo sort by dependsOn; load addons)
   - `src/addons/core/manifest.ts` (IdService + AuditService)
   - `src/addons/index.ts` (explicit addons list; like Odoo addons-path)
   - `src/index.ts` exports
4. `@workspace/db` (minimal skeleton only; do not overbuild)
   - `src/client.ts` (Neon+Drizzle connection placeholder)
   - `src/schema.ts` (placeholder + tenant discipline comment)
   - `src/index.ts`

### B) Update tsconfig paths

Update root `tsconfig.json` to add path aliases for new packages:

- `@workspace/api-kernel`, `@workspace/api-kernel/*`
- `@workspace/observability`, `@workspace/observability/*`
- `@workspace/domain`, `@workspace/domain/*`
- `@workspace/db`, `@workspace/db/*`

### C) Migrate 2 routes as proof (minimum)

Find and convert:

- `/api/health`
- `/api/echo`
  From raw handlers to kernel(spec) pattern using Zod schemas from @workspace/validation.
  If these routes do not exist, create minimal examples under `apps/web/app/api/health/route.ts` and `apps/web/app/api/echo/route.ts`.

### D) Add enforcement gates

1. Add ESLint override in root ESLint flat config (or apps/web ESLint config if that’s how repo is set):
   - ban NextResponse.json, new Response, console.log/info/debug
   - ban next/\* imports in route files
   - ban relative imports in route files
2. Add `scripts/check-api-kernel.ts` drift script that enforces:
   - every route file contains `export const (GET|POST|PUT|PATCH|DELETE) = kernel(`
   - no NextResponse.json / new Response / console.log/info/debug
   - imports allowlist only: @workspace/api-kernel, @workspace/validation, @workspace/domain, zod (optional)
   - no next/\* imports
3. Add package.json script:
   - `"check:api-kernel": "tsx scripts/check-api-kernel.ts"`

---

## IMPLEMENTATION NOTES (Important)

- Keep route files tiny: only spec + call to domain service.
- Kernel builds envelopes; handler returns raw data object matching output schema.
- Use ALS in kernel: seed traceId from active OTel trace if available; else uuid.
- Ensure the domain bootstrap returns `addonOrder` and `addonVersions` for governance visibility.
- Do not add any extra tools. Do not add OpenAPI. Do not add contract versioning.

---

## OUTPUT FORMAT

1. Provide a short summary of changes.
2. List all new/modified files with paths.
3. Confirm the two migrated routes compile and follow the rules.
4. Confirm the drift gate will fail if a developer uses NextResponse.json or bypasses kernel.

Proceed to implement now.
