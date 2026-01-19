# help001-erp-module-standard.md

**Status:** SUPPORTING (Help)
**Scope:** ERP-lane module standardization

## Non-negotiable principle
An ERP feature is **a module/addon**, not a folder of random code.

If a change requires altering platform route conventions, workspace boundaries, or foundation gates, it is **not ERP work**.

## 1) ERP module naming
Use the prefix `erp.` for addon IDs and folder names.

- Addon id: `erp.base`, `erp.sales`, `erp.inventory`, `erp.purchase`, `erp.invoice`, `erp.accounting`
- Folder: `packages/domain/src/addons/erp.base/`

## 2) Required module anatomy
Every ERP module MUST have these pieces.

### 2.1 Domain addon (runtime)
`packages/domain/src/addons/erp.<module>/`
- `manifest.ts` (required)
- `services/` (required)
- `policies/` (required)
- `events/` (required if any lifecycle exists)
- `index.ts` (re-exports)

### 2.2 Contracts (Zod SSOT)
`packages/validation/src/erp/<module>/`
- `dto.ts` (create/update/read DTOs)
- `workflow.ts` (statuses + transitions + event schemas)
- `permissions.ts` (permission names used by this module)

### 2.3 Database
`packages/db/src/erp/<module>/`
- `schema.ts` (tables)
- `queries.ts` (optional: shared query helpers)

Migrations:
- **Only** under `packages/db/drizzle/` (or whatever your platform canon mandates)

### 2.4 API (spec-only routes)
`apps/*/app/api/erp/<module>/**/route.ts`
- Must be `export const METHOD = kernel({ ... })`
- Must call domain services only

### 2.5 UI
`apps/web/app/(erp)/<module>/`
- list page
- detail page
- create/edit flow (dialog or page)

## 3) Required manifest fields
`manifest.ts` must export an object that is deterministic and serializable.

Minimum:
- `id` (string, `erp.<module>`)
- `version` (string)
- `dependsOn` (string[])
- `register(api)` (function)

Rules:
- No runtime discovery of deps.
- No environment-based deps.

## 4) Dependency direction rules
- `erp.base` is the only allowed “foundation ERP” module.
- All other ERP modules may depend on `erp.base`.
- No ERP module may depend on another ERP module unless explicitly justified.
  - Example allowed: `erp.invoice` depends on `erp.sales` if invoices are generated from sales orders.

Absolute rule:
- **No cycles**. Cycles are a hard fail.

## 5) “Module Done” minimums
A module is not shippable unless:
- Contracts exist (input + output + workflow schemas)
- DB schema exists and migration exists
- Tenant scoping is enforced
- Permissions are declared and checked in services
- Audit events exist for lifecycle transitions
- At least 2 invariants tested

## 6) Recommended start order
1) `erp.base`
2) `erp.sales`
3) `erp.inventory`
4) `erp.purchase`
5) `erp.invoice`
6) `erp.accounting` (last)
