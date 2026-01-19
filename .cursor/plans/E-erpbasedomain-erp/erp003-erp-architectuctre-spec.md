# ERP-ARCHITECTURE-SPEC.md (v0)

**Status:** CANONICAL (ERP Lane Architecture Spec)  
**Scope:** ERP domain modules on top of AXIS platform (kernel(spec) + addons + Zod SSOT + Drizzle).  
**Prime Doctrine:** Minimal ERP that ships, no drift, no re-platforming, no Odoo parity.

---

## 0) ERP Doctrine (What ERP Is)

ERP in AXIS is:
- A set of **domain addons** (Odoo-inspired manifest + dependsOn),
- Backed by **Drizzle schema + migrations**,
- Exposed via **Next.js Route Handlers** that are **kernel(spec) only**,
- Governed by **Zod SSOT contracts**,
- Enforced by **tenant discipline + audit/Chronos Trace**.

ERP is NOT:
- A new framework
- A new routing layer
- A new ORM
- A copy of Odoo’s UI/runtime module system

---

## 1) ERP Module System (Addon-First)

### 1.1 Required Manifest
Every ERP module is an addon located under:

- `packages/domain/src/addons/erp.<module>/manifest.ts`

Manifest requirements:
- `id`: `erp.<module>`
- `dependsOn`: explicit, no cycles
- `register(container)`: provides services and extension points

### 1.2 Dependency Direction (No Cycles)
Allowed dependsOn direction (v0):

- `erp.base` → depends only on `core` (+ optional `auth`/`db` access via services)
- `erp.sales` → `erp.base`
- `erp.inventory` → `erp.base`
- `erp.purchase` → `erp.base`, `erp.inventory` (optional)
- `erp.invoice` → `erp.base`, `erp.sales`, `erp.purchase`
- `erp.accounting` → `erp.invoice` (later)

---

## 2) ERP Start Order (Locked v0 Plan)

**Rule:** Do not start accounting/GL first.

1. `erp.base`
   - Partner (party/customer/vendor)
   - Product + UoM
   - Document Sequence (numbering)
2. `erp.sales`
   - Sales Order + Lines
   - Submit → Approve → Posted lifecycle
3. `erp.inventory`
   - Location
   - Stock Move
   - On-hand (derived)
4. `erp.purchase`
   - Purchase Order + Receive
5. `erp.invoice`
   - Invoice document (not full GL)
6. `erp.accounting`
   - Journals / ledger (only when triggered)

---

## 3) Data Model Discipline (Tenant + Audit)

### 3.1 Tenant Discipline (Hard)
- Every ERP table MUST include `tenant_id`.
- Every service method MUST accept/derive `tenantId`.
- No cross-tenant joins unless explicitly marked and policy-checked.

### 3.2 Audit Discipline (Hard)
For any entity with lifecycle:
- emit audit events on:
  - create
  - update
  - every state transition

Audit payload must include:
- `tenantId`, `actorId` (if auth required), `entityType`, `entityId`
- `eventType`, `before`, `after`, `traceId`

---

## 4) Workflow Law (Explicit Transitions)

### 4.1 Status Enum Required
Lifecycle entities MUST have:
- `status` enum
- explicit transition table (no ad-hoc if/else)

### 4.2 Shared Approval Pattern
If approvals are required:
- reuse the same approval mechanics style as existing `requests` addon
- do not invent a new approval engine per module

---

## 5) Contracts (Zod) — SSOT

### 5.1 Where contracts live
ERP contracts live under:
- `packages/validation/src/erp/<module>/*.ts`

Required per entity:
- `CreateInput`
- `UpdateInput`
- `Entity`
- `ListOutput` / `GetOutput` (as needed)

### 5.2 Contract Versioning (Lean)
No `/v1` `/v2` contract folders unless a real backward-compat trigger exists.

---

## 6) API Exposure (Kernel Spec-Only)

Route files remain spec-only:
- `apps/**/app/api/erp/<module>/**/route.ts`

Routes:
- import only from `@workspace/api-kernel/*`, `@workspace/validation/*`, `@workspace/domain/*`
- call domain services
- return raw data matching output schema

---

## 7) Security (Permission Namespaces)

ERP permissions are action-scoped:

- `erp.<module>.<entity>.<action>`

Examples:
- `erp.sales.order.create`
- `erp.sales.order.submit`
- `erp.sales.order.approve`

Policy enforcement happens in **domain services**, not in routes.

---

## 8) UI Boundaries (ERP UI is Consumer)

UI must treat ERP APIs as contracts:
- UI does not bypass domain services
- UI does not directly touch DB

UI lives under:
- `apps/web/app/(erp)/<module>/*`

---

## 9) Testing Minimum (ERP Lane)

For each ERP module, minimum tests:
- 2–3 invariant tests (status transitions, tenant isolation)
- 1 permission-denied test

No additional test frameworks.

---

## 10) What is Out of Scope (v0)

- Full Odoo view engine parity
- Runtime module install/uninstall
- General ledger / full accounting engine
- Multi-warehouse optimization
- Complex costing (FIFO/AVCO) until triggered

---

**End of Spec**
