````md
# ARCHITECTURE-SPEC-v3.md

**Status:** Ratification-Ready (Anti-Drift Enforcement Spec)  
**Scope:** Public-facing multi-tenant SaaS (Next.js + Neon + Cloudflare)  
**Prime Doctrine:** DRY + KISS, Contract-First, Observability-Stitched, Minimal Stack (No Overbloat)  
**Key Objective:** **Zero pattern drift** in Next.js Route Handlers via a single mandatory kernel pattern.

---

## 0) Locked Stack (Confirmed)

> **Workspace aliasing:** All internal imports use `@workspace/*` only.

### Core

- **Framework / Routing:** Next.js v16 (App Router) + **Route Handlers** for REST API
- **API Type:** **REST**
- **Language:** TypeScript v5 (`strict`)
- **Validation:** **Zod v4** (SSOT runtime validation)
- **UI:** shadcn/ui (Radix)
- **CSS:** Tailwind v4 (tokens SSOT in `globals.css`)
- **DB:** Neon Postgres
- **Migrations:** Drizzle migrations
- **Auth:** Neon Auth

### Observability (Stitched)

- **Logging:** Pino (JSON structured)
- **Request correlation:** AsyncLocalStorage (ALS)
- **Tracing:** OpenTelemetry → self-hosted Grafana Tempo
- **Error Tracking:** GlitchTip (Sentry-compatible SDK)

### Async + Files

- **Background Jobs:** Graphile Worker (Postgres-backed)
- **File Pipeline:** Cloudflare R2 + Workers (server-side conversion mandatory)

### Quality

- **Lint:** ESLint 9 (flat config + boundary rules)
- **Testing:** Vitest + Playwright

---

## 1) Anti-Drift Policy (Non-Negotiable)

### 1.1 Single Handler Pattern

**All** Route Handlers under `app/api/**/route.ts` MUST be declared as:

```ts
export const GET = kernel(spec);
export const POST = kernel(spec);
```
````

No exceptions.

### 1.2 No Raw Responses in API Routes

In `app/api/**/route.ts`, developers MUST NOT call:

- `NextResponse.json(...)`
- `new Response(...)`
- `throw new Error(...)` without kernel normalization

All responses MUST be produced by the kernel.

### 1.3 Required Pipeline (Always)

Every request MUST pass through this exact pipeline order:

1. **withContext** (ALS seed: `traceId`, `requestId`, `routeId`, `method`)
2. **withTenant** (resolve tenant, enforce required)
3. **withAuth** (Neon Auth session, role checks)
4. **withValidation** (Zod input parse + Zod output parse)
5. **withErrorEnvelope** (single error shape, correct status codes)
6. **withLogging** (Pino always has correlation keys)
7. **withTracing** (OTel span error marking + trace propagation)

This pipeline is implemented by `kernel(spec)` and is not re-implemented per-route.

---

## 2) Standard Output Shapes (SSOT)

### 2.1 Success Envelope

```json
{
  "data": "<payload>",
  "meta": { "traceId": "<traceId>" }
}
```

### 2.2 Error Envelope (Only Allowed Error Shape)

```json
{
  "error": {
    "code": "SOME_CODE",
    "message": "Human-readable message",
    "details": {},
    "fieldErrors": {},
    "traceId": "<traceId>"
  }
}
```

### 2.3 Status Code Discipline

- `200` success
- `400` validation / missing required tenant / malformed input
- `401` unauthenticated
- `403` unauthorized (role/permission)
- `404` not found (real absence)
- `409` conflict (idempotency, version conflicts)
- `429` rate limited
- `500` internal errors only

No “200 with error payload”.

---

## 3) Contracts & Zod Policy

### 3.1 Zod is SSOT

Zod schemas are authoritative for:

- API request inputs (query/params/body)
- API response outputs (runtime parsing)
- Job payloads (Graphile Worker)
- File lifecycle records (DB states)

### 3.2 Versioning Policy (Lean Default)

- **Zod v4** only (pinned in lockfile).
- No internal “v1/v2” contract folders by default.

**Trigger to version contracts:**

- External/public API consumers requiring backward compatibility, or
- Multiple shipped client versions in the wild.

If triggered:

- Version at the boundary: `/api/v1/*`, `/api/v2/*`
- Only public contracts are versioned: `@workspace/validation/v1/*`, `@workspace/validation/v2/*`
- Internal endpoints remain unversioned.

### 3.3 OpenAPI Policy (Derived Artifact)

- OpenAPI is NOT mandatory day-1.
- When needed, OpenAPI MUST be generated from Zod as a build artifact:
  - `pnpm build:openapi` → `openapi.json`

- Generator + Zod versions are pinned.
- Optional CI gate: generated OpenAPI must be up-to-date.

---

## 4) Required Module Layout (Enforcement-Friendly)

```
apps/
  web/
    app/
      api/
        .../route.ts           # MUST use kernel(spec) only

packages/
  api-kernel/
    kernel.ts                  # The single anti-drift pipeline
    types.ts                   # RouteSpec types
    http.ts                    # ok()/fail() envelope helpers
    tenant.ts                  # tenant resolver (one canonical method)
    errors.ts                  # error codes + normalization
  validation/
    *.ts                       # Zod schemas (SSOT)
  db/
    schema.ts                  # Drizzle schema
    migrations/                # Drizzle migrations
  auth/
    neon.ts                    # Neon auth adapter (session extraction)
  observability/
    context.ts                 # ALS: traceId/tenantId/actorId
    logger.ts                  # Pino child logger injection
    tracing.ts                 # OTel glue helpers
  workers/
    handlers/                  # Graphile Worker handlers (Zod payload)
```

---

## 5) The Kernel Spec (Single Method Everywhere)

### 5.1 RouteSpec (What every route must provide)

Each route MUST declare:

- `method` (GET/POST/…)
- `routeId` (stable identifier for logs/errors/metrics)
- `tenant.required` (true/false)
- `auth.mode` (public/required) + optional `roles`
- `query` Zod schema (optional)
- `body` Zod schema (optional)
- `output` Zod schema (required)
- `handler` (business logic only)

### 5.2 Route Authoring Template (Copy-Paste Canon)

```ts
import { z } from "zod";
import { kernel } from "@workspace/api-kernel/kernel";

const Query = z
  .object({
    /* ... */
  })
  .optional();
const Body = z
  .object({
    /* ... */
  })
  .optional();
const Output = z.object({
  /* ... */
});

export const GET = kernel({
  method: "GET",
  routeId: "entity.list",
  tenant: { required: true },
  auth: { mode: "required", roles: ["member"] },
  query: Query,
  output: Output,
  async handler({ query, tenantId, actorId, roles }) {
    // BUSINESS LOGIC ONLY (call domain/db)
    return /* matches Output */;
  },
});
```

**Allowed content in `route.ts`:**

- imports from `@workspace/api-kernel/*`
- imports from `@workspace/validation/*`
- calls into `@workspace/domain/*` (or similar)
- no raw NextResponse construction, no custom error shapes

---

## 6) Observability Stitch Contract (Hard Requirements)

### 6.1 Correlation Keys (Always on logs/errors)

Every log line and every captured error MUST include:

- `traceId`
- `requestId`
- `tenantId` (when known/required)
- `actorId` (when authenticated)
- `routeId`
- `method`

### 6.2 Stitch Guarantee

- GlitchTip issue MUST show `traceId`
- Tempo trace MUST be searchable by `traceId`
- Pino logs MUST be filterable by `traceId`

If any of the above fails → observability is considered broken.

---

## 7) Public-Facing Readiness (Minimal Must-Haves)

### 7.1 Rate Limiting (Mandatory for external endpoints)

At minimum protect:

- auth endpoints (login/signup/reset)
- invite acceptance
- webhook endpoints
- any unauthenticated endpoints

### 7.2 Minimal Metrics (Must-have KPI set)

API:

- request count by route/method/status
- duration histogram (p95/p99)
- 5xx count by route
- rate-limited count

Auth:

- login success/failure counters

Jobs:

- job success/fail/retry counters
- queue latency histogram

Files:

- conversion success/fail counters
- processing duration histogram

### 7.3 Starting SLO targets

- Uptime: 99.9% monthly
- Latency: p95 300–500ms, p99 1–2s
- API error rate: < 1% overall (track 5xx separately)

---

## 8) Enforcement Mechanisms (How drift is prevented)

### 8.1 ESLint 9 Overrides (Route Handler Guard Rails)

Add an ESLint override for `apps/**/app/api/**/route.ts` enforcing:

- **No `NextResponse.json` usage**
- **No `new Response()` usage**
- **No `console.*` usage**
- **Optional:** restrict imports to only allow `@workspace/api-kernel/*`, `@workspace/validation/*`, and `@workspace/domain/*`

(Exact rule config may vary; intent is mandatory.)

### 8.2 CI Check (Deterministic “Kernel-only” Gate)

CI MUST run a simple check:

- every `apps/**/app/api/**/route.ts` must contain `= kernel({`
- no occurrences of `NextResponse.json(` or `new Response(` inside those files

If violated → fail build.

### 8.3 Code Review Rule (Human Gate)

Reviewers reject any route that:

- bypasses kernel
- returns a non-standard envelope
- fails to validate output

---

## 9) Background Jobs + File Pipeline (Anti-Drift Parity)

### 9.1 Jobs (Graphile Worker)

- Each job handler MUST:
  - validate payload with Zod
  - include `tenantId`
  - log using Pino (ALS-like correlation where applicable)
  - record failures and retries deterministically

### 9.2 Files (Cloudflare)

- Mandatory conversion: `docx/xlsx/pptx → pdf`
- Conversion failure = upload failure (no fallback)
- File status transitions are standardized and audited

---

## 10) Final Notes (Lean Defaults that Scale)

- Keep API in Next Route Handlers until API becomes a separate product.
- Keep OpenAPI as optional derived artifact until required externally.
- Keep contract versioning OFF until backward compatibility is real.
- Prefer Postgres-native primitives (Graphile Worker) to avoid infra bloat.

---

**End of Spec**

```

```
