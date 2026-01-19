# help006-erp-testing-invariants.md

**Status:** SUPPORTING (Help)
**Goal:** Prevent ERP regressions without writing a novel of tests.

## 0) Test philosophy for ERP
ERP breaks in workflows, permissions, totals, and concurrency.
So we test **invariants** (things that must always hold), not every UI pixel.

## 1) Minimum tests per module (non-negotiable)
Every module must include at least **two invariant tests**:

### A) Workflow transition invariant
Example: SalesOrder cannot go directly from DRAFT → POSTED without APPROVED.

### B) Tenant scope invariant
Example: A user in tenant A cannot read an order in tenant B.

## 2) Recommended invariant list (pick 3–6 over time)
- **Totals correctness:** total = sum(lines) + tax
- **Posting idempotency:** calling POST twice does not duplicate side effects
- **Permission enforcement:** approve requires `...approve` permission
- **Concurrency safety:** two concurrent APPROVE calls result in one success, one invalid-transition
- **Sequence uniqueness:** doc_no is unique per tenant+doctype

## 3) Test layers
- **Unit**: pure functions (totals calc, transition table)
- **Service**: domain service with db tx + policy stub
- **Integration** (optional): route → kernel → service → db

## 4) Keep tests deterministic
- Do not use real time; inject clock
- Use stable UUIDs for fixtures
- Seed minimal reference data (`erp.base`)

## 5) Suggested tooling
- Run tests at the package level (vitest or whatever your workspace uses)
- Provide a small “test context builder” helper for ctx/db/policy/audit stubs
