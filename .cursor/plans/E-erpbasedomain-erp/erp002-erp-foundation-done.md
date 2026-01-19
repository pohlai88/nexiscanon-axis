# ERP-FOUNDATION-DONE.md (ERP Lane Freeze Checklist)

**Status:** CANONICAL (ERP Lane Freeze Checklist)
**Goal:** Define the minimum “ERP base domain complete” state so we stop inventing ERP patterns and only ship ERP modules.

---

## How to use this

- ✅ = done
- ⏳ = in progress
- ⛔ = not started

Once **all sections A–F are ✅**, the ERP domain lane is **FROZEN**.
From that point onward: **only add ERP modules (addons), not new ERP architecture/patterns.**

---

# A) ERP Lane Guard Rails (Must)

- [ ] ✅/⏳/⛔ ERP docs exist (ERP000–ERP004) and are treated as authoritative for ERP work
- [ ] ✅/⏳/⛔ `pnpm check:api-kernel` and `pnpm check:db-migrations` are Tier-0 and passing in CI (platform owned)
- [ ] ✅/⏳/⛔ ERP code never modifies Platform canon files without an explicit platform task

**Freeze rule:** ERP cannot change route style, kernel pipeline, or workspace boundaries.

---

# B) ERP Base Domain (`erp.base`) (Must)

## B1) Base master data tables exist (minimal)

- [ ] ✅/⏳/⛔ `partners` (customer/vendor) table with tenant discipline
- [ ] ✅/⏳/⛔ `products` table with tenant discipline
- [ ] ✅/⏳/⛔ `uoms` (units of measure) table (can be seed-only v0)
- [ ] ✅/⏳/⛔ `sequences` (document numbering) table/service

## B2) Minimal API exists (kernel(spec) only)

- [ ] ✅/⏳/⛔ `POST /api/erp/base/partners` create partner (Zod input+output)
- [ ] ✅/⏳/⛔ `POST /api/erp/base/products` create product (Zod input+output)

**Freeze rule:** routes are spec-only, domain services do work.

---

# C) ERP Workflow Discipline (Must)

- [ ] ✅/⏳/⛔ Shared workflow primitives exist (statuses + transitions) in ERP lane
- [ ] ✅/⏳/⛔ Every lifecycle entity uses explicit transition rules (no ad-hoc status writes)
- [ ] ✅/⏳/⛔ Approval pattern reuses the existing `requests` style (platform domain addon pattern)

**Freeze rule:** no new “approval system” per module.

---

# D) ERP Security Discipline (Must)

- [ ] ✅/⏳/⛔ Permission namespace defined and used:
  - `erp.<module>.<entity>.<action>`
- [ ] ✅/⏳/⛔ Every domain service checks policy before mutation
- [ ] ✅/⏳/⛔ Tenant scope enforced by design (tenant_id present, queries scoped)

**Freeze rule:** authorization is enforced in domain service, not in UI and not in route.

---

# E) ERP Audit Discipline (Must)

- [ ] ✅/⏳/⛔ Create/update actions emit audit event
- [ ] ✅/⏳/⛔ Workflow transitions emit audit event (include old/new status)
- [ ] ✅/⏳/⛔ Audit payload includes `traceId`, `tenantId`, `actorId`, `entity`, `action`, `diff` (where applicable)

**Freeze rule:** no silent state transitions.

---

# F) ERP Proof Milestones (Evidence Required)

These require real outputs in `EVI-ERP-*` files:

- [ ] ✅/⏳/⛔ `pnpm db:generate` + `pnpm check:db-migrations` show no drift
- [ ] ✅/⏳/⛔ `pnpm db:migrate` applied against Neon (requires DATABASE_URL)
- [ ] ✅/⏳/⛔ One ERP endpoint writes to DB (not in-memory) and returns validated output
- [ ] ✅/⏳/⛔ Minimum ERP invariants tests exist (2–3)

**Freeze rule:** “DONE” requires proof outputs; otherwise mark **NOT PROVEN**.

---

# G) ERP Strictness Budget v0 (Governance)

**Tier-0 (CI FAIL = Block Merge)**

- `pnpm check:api-kernel` (platform)
- `pnpm check:db-migrations` (platform)
- `pnpm typecheck:core` (platform)
- `pnpm lint` (platform)
- `pnpm check:erp` (ERP lane; module layout + contract presence checks)

**Tier-1 (Non-Blocking)**

- unit tests expansion
- E2E flows beyond one happy-path
- reporting dashboards

**Freeze rule:** do not promote Tier-1 to Tier-0 without a trigger.

---

**End of Checklist**
