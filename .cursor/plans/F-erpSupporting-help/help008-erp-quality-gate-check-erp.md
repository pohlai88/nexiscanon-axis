# help008-erp-quality-gate-check-erp.md

**Status:** SUPPORTING (Help)
**Goal:** Define what the ERP-only quality gate must enforce so ERP cannot drift.

## 0) Why a second gate
Platform gates (lint, db drift, route spec-only) prevent platform drift.
ERP needs a second gate to prevent **domain drift**:
- missing contracts
- missing tenant_id
- ad hoc status transitions
- permission checks done in UI/routes instead of services

## 1) The command
Add a workspace script:
- `pnpm check:erp`

It should fail (exit 1) with clear messages.

## 2) Scan targets
- `packages/domain/src/addons/erp.*/*`
- `packages/validation/src/erp/*/*`
- `packages/db/src/erp/*/*`
- `apps/*/app/api/erp/*/**/route.ts`

## 3) Hard-fail rules (minimum)
### A) Manifest completeness
For each `erp.<module>` addon:
- `manifest.ts` exists
- exports `id`, `version`, `dependsOn`, `register`
- `id` matches folder name

### B) Contracts exist
For each module:
- `dto.ts` exists
- `permissions.ts` exists

If the module contains lifecycle entities:
- `workflow.ts` exists
- workflow contains `status` enum and explicit transition list

### C) Database schema exists
For each module:
- `schema.ts` exists
- all transactional tables include `tenant_id`
- doc headers include `doc_type`, `doc_no`, `status` (when applicable)

### D) No forbidden imports
- domain services must not import from UI
- domain services must not import from route handlers
- UI must not import from DB schema directly (use services/contracts)

### E) Route presence is spec-only
- every route file exports handlers using `kernel({ ... })`
(You can delegate this check to the existing platform route gate if it already covers all `apps/**/route.ts`.)

## 4) Output requirements
When failing:
- show module id
- show the missing/violating file
- suggest the correct path

Example:
- `FAIL erp.sales: missing packages/validation/src/erp/sales/workflow.ts (required for lifecycle entities)`

## 5) Recommended “soft warnings” (do not fail initially)
- missing invariant tests
- missing audit emission (hard to statically check)

Convert warnings to failures once team has cadence.
