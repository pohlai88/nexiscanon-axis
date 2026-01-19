# ERP-WORKSPACE-BOUNDARIES.md (ERP Lane)

**Status:** CANONICAL (ERP Lane Boundary + Enforcement Spec)  
**Scope:** Boundaries and coupling rules for ERP modules.

This document MUST be consistent with platform boundaries and enforcement.

---

## 0) Conflict Rule

If any rule here conflicts with platform canon or platform enforcement, platform wins.

---

## 1) Allowed Locations (Hard)

ERP code MUST live only in:

- `packages/domain/src/addons/erp.*`  (domain services, policies, workflow)
- `packages/validation/src/erp/**`    (Zod contracts SSOT)
- `packages/db/src/erp/**`            (Drizzle schema composition)
- `apps/web/app/(erp)/**`             (UI pages)
- `apps/web/app/api/erp/**/route.ts`  (API routes, spec-only)

Any ERP code found outside these locations is a boundary violation.

---

## 2) ERP Dependency Direction (No Cycles)

### 2.1 Layering

Top to bottom only:

1. `apps/*` (routes and UI)
2. `@workspace/domain` (ERP addon services)
3. `@workspace/db` (persistence)
4. `@workspace/validation` (contracts)

### 2.2 Golden rule

- UI and API may call domain services.
- Domain services may call db.
- Everything uses validation schemas.
- No layer may import upward.

---

## 3) Import Rules (ERP Lane)

### 3.1 API route files

Routes remain governed by platform kernel rules.
ERP routes must import only:

- `@workspace/api-kernel/*`
- `@workspace/validation/*`
- `@workspace/domain/*`
- optional `zod` (prefer `@workspace/validation`)

Routes must not import db directly and must not use raw Next responses.

### 3.2 Domain addon files

ERP addons may import:

- `@workspace/domain/*` (addon framework)
- `@workspace/db/*` (repositories)
- `@workspace/validation/*` (schemas)
- `@workspace/observability/*` (logger helpers if exposed)

ERP addons must not import:

- Next runtime modules
- UI packages
- route files

---

## 4) Tenant Discipline (Always)

- Every ERP table includes `tenant_id`.
- Every query is tenant-scoped by design.
- No route-level tenant filters. Tenant is enforced inside domain services or repo layer.

---

## 5) Workflow + Audit Discipline

- Any entity with a lifecycle status uses an explicit transition table.
- Every transition emits an audit event via the core AuditService.

---

## 6) Enforcement (Required)

ERP must add an ERP-lane gate:

- `pnpm check:erp` validates:
  - addon manifest exists and has id, version, dependsOn
  - contracts exist for create and read for each entity
  - db schema exists for each entity and includes tenant_id
  - forbidden imports are absent

ERP enforcement must not weaken platform enforcement.

