# help000-erpSupporting-map.md

**Status:** SUPPORTING (Help Pack)
**Lane:** ERP Domain (separate from Platform CAN)

## Goal
Ship ERP modules quickly **without drift**.

## Covers
- Standard ERP module anatomy (folders, files, naming)
- Standard document types (Order, Move, Invoice) and lifecycle expectations
- Workflow transitions (explicit state machine; no ad hoc status updates)
- Permissions + row-scope patterns (tenant baseline; expandable later)
- Audit invariants for lifecycle events
- Migrations + seed data discipline
- Tests: invariants that prevent workflow regressions
- An ERP-only quality gate (`pnpm check:erp`)

## Relationship to Platform Canon
- Platform Canon (CAN*) remains the upstream constitution for route patterns, workspace boundaries, and foundation gates.
- This pack adds ERP-lane details only.
- If this pack conflicts with Platform Canon, Platform Canon wins.

## Files in this pack

### Core Standards (Read First)
- `help001-erp-module-standard.md` — fixed module anatomy + naming rules
- `help002-erp-doctype-contract.md` — standard ERP document pattern
- `help003-erp-workflow-law.md` — transitions, posting, reversals, idempotency

### Security & Audit
- `help004-erp-security-model.md` — permissions, scopes, and rule patterns
- `help005-erp-audit-chronos.md` — audit events and envelopes for ERP
- `help013-erp-audit-table-spec.md` — **concrete audit table schema and service**

### Data Layer
- `help007-erp-migrations-and-seeds.md` — DB and data discipline
- `help010-erp-postgres-discipline.md` — **PostgreSQL best practices (data types, constraints, indexes)**
- `help011-erp-base-schema-draft.md` — **concrete erp.base schema (partners, products, uoms, sequences)**
- `help012-erp-money-currency.md` — **money/currency handling (cents, formatting, multi-currency)**

### Quality & Testing
- `help006-erp-testing-invariants.md` — test strategy for ERP modules
- `help008-erp-quality-gate-check-erp.md` — spec for `check:erp` (what it must enforce)

### Roadmap & Reference
- `help014-erp-module-roadmap.md` — **complete module catalog, implementation sequence, phase checklist**
- `help009-odoo-patterns-to-axis.md` — translation table: Odoo ideas → AXIS implementation

## How to use

### Step 0: Understand the Big Picture
1) Read `help014` (module roadmap) — understand all modules and implementation order

### Step 1: Before Writing Any ERP Code
2) Read `help001` (module standard) + `help002` (doctype contract)
3) Read `help010` (PostgreSQL discipline) + `help012` (money handling)
4) Review `help011` (erp.base schema) as reference implementation

### Step 2: When Implementing
5) Follow `help003` (workflow law) for any lifecycle entity
6) Follow `help013` (audit table) for audit emission
7) Implement `check:erp` per `help008`

### Step 3: Module Implementation Order (from help014)
8) **Phase 1:** `erp.base` (foundation — must complete first)
9) **Phase 2:** `erp.sales` → `erp.inventory` → `erp.purchase`
10) **Phase 3:** `erp.invoice` → `erp.payment`
11) **Phase 4:** `erp.accounting` (last)
