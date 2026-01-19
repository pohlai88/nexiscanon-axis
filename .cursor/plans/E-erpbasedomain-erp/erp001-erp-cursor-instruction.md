# Cursor Task: Non-Negotiable ERP Domain Governance (AXIS ERP Lane)

**Status:** CANONICAL (ERP Lane)  
**Scope:** ERP-domain modules ONLY. Must obey Platform/Foundation canon (CAN001–CAN004).

You are working in the same Turborepo monorepo using the locked stack:

- Next.js App Router (Route Handlers)
- TypeScript strict
- Zod v4 in `@workspace/validation` (SSOT)
- Neon Postgres + Drizzle migrations
- Domain Addons system (`@workspace/domain`)
- API Kernel (`@workspace/api-kernel`) with spec-only routes
- Observability via `@workspace/observability`

---

## Objective (Non-Negotiable)

Start ERP implementation **without drift** by enforcing a single ERP module pattern that plugs into the existing Foundation:

- **ERP is addons-only**: every ERP capability is a domain addon (Odoo-inspired), not new architecture.
- **Routes are spec-only** and must call ERP domain services.
- **Zod is SSOT** for ERP boundaries (inputs/outputs/workflow events).
- **Tenant discipline + audit** are mandatory.

---

## HARD RULES (Stop Drift)

### 1) ERP is Module/Addons Only (No architecture)

- ERP lives as domain addons under:
  - `packages/domain/src/addons/erp.*/*`
- Every addon MUST have `manifest.ts` and MUST declare `dependsOn`.
- No "ERP framework" layer, no parallel DI container, no second module loader.

### 2) Route handlers remain spec-only (Inherited from Platform)

All route files under `apps/**/app/api/**/route.ts(x)` MUST follow:

- `export const METHOD = kernel({ ... })`
- Allowed imports are platform allowlist only.
- No raw responses, no NextResponse, no relative imports.

ERP work MUST NOT introduce new route conventions.

### 3) Zod is SSOT for ERP boundaries

For every ERP endpoint or workflow boundary:

- **Input schema**: query/params/body as applicable
- **Output schema**: required
- **Workflow event schema**: required for every state transition

No unvalidated payloads crossing boundaries.

### 4) Tenant discipline is mandatory

- Every multi-tenant ERP table MUST have `tenant_id`.
- Every service method MUST be tenant-scoped by input (`tenantId` required in service ctx).
- No service may accept a raw DB client without tenant context.

### 5) Audit is mandatory for lifecycle entities

If an ERP entity has a lifecycle status (e.g. DRAFT/SUBMITTED/APPROVED/POSTED/VOID):

- Transitions MUST be explicit (no ad-hoc if/else).
- Every transition MUST emit an audit event via `AuditService`.

### 6) Keep it lean (Strictness budget)

- No OpenAPI generation added by ERP.
- No contract version folders (v1/v2) added by ERP.
- No new infra tools introduced by ERP.

---

## REQUIRED ERP MODULE ANATOMY (One pattern)

Each ERP addon `erp.<module>` MUST include:

1) **Manifest**
- `packages/domain/src/addons/erp.<module>/manifest.ts`

2) **Contracts (Zod SSOT)**
- `packages/validation/src/erp/<module>/*.ts`

3) **DB (Drizzle)**
- `packages/db/src/erp/<module>/*.ts` (schema composition)
- migrations generated into `packages/db/drizzle/` ONLY

4) **Domain services**
- `packages/domain/src/addons/erp.<module>/services/*.ts`
- services accept a typed ctx: `{ tenantId, actorId?, roles?, db, audit, id }`

5) **Policies (Authorization)**
- `packages/domain/src/addons/erp.<module>/policies/*.ts`
- policy checks happen in services (routes stay spec-only)

6) **Routes (Spec-only)**
- `apps/web/app/api/erp/<module>/**/route.ts`

7) **UI (optional for early phase, but recommended)**
- `apps/web/app/(erp)/<module>/*`

---

## DELIVERABLES (ERP Lane)

### A) Create ERP-BASE module first (non-negotiable ordering)

The first ERP addon MUST be:

- `erp.base`

It provides shared primitives for all ERP modules:

- Partner (customer/vendor)
- Product + UoM
- Document Sequence (numbering)
- Money types (currency code, decimal discipline)

### B) Provide a stable workflow template (shared)

Implement a single reusable workflow pattern for ERP lifecycles:

- status enum
- transition map
- transition audit emission

All ERP modules reuse this pattern.

### C) Provide ERP permission namespace (lean)

ERP permissions MUST follow:

- `erp.<module>.<entity>.<action>`

Examples:
- `erp.sales.order.create`
- `erp.sales.order.submit`
- `erp.sales.order.approve`

### D) Provide ERP done gates (module-level)

Add `pnpm check:erp-modules` drift gate (ERP-only) that enforces:

- every `erp.*` addon has `manifest.ts`
- every route references Zod schemas from `@workspace/validation`
- every ERP table includes `tenant_id`
- no cycles among `erp.*` addons (dependsOn topo check)

**Important:** This ERP gate must not duplicate/replace platform gates.

---

## OUTPUT FORMAT (When implementing ERP work)

1) Provide a short summary of changes.
2) List new/modified files with paths.
3) Show proof outputs for:
   - `pnpm check:db-migrations`
   - `pnpm check:api-kernel`
   - `pnpm check:erp-modules`
4) If anything is NOT proven, mark it explicitly as **NOT PROVEN**.

---

## APPROVAL TRIGGER (Ask before deviating)

If you need to do ANY of the following, you MUST ask for approval first:

- introduce a new folder pattern for ERP modules
- add versioning folders (v1/v2) for ERP contracts
- add OpenAPI generation
- add new infra/tooling
- change route handler pattern or import allowlist

