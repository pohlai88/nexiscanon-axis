# Phase 2.2 Complete — Sales Orders Implementation

**Date:** 2026-01-20  
**Branch:** `erp/phase-0-infrastructure`  
**Commit:** `56d8790d` feat(erp): Complete Phase 2.2 Sales Orders with quote conversion

---

## Summary

Phase 2.2 (Sales Orders) successfully implemented with:
- **9 service methods** (create, update, get, list, upsertLine, removeLine, confirm, cancel, convertQuoteToOrder)
- **7 route files** → **9 API operations** (spec-only, kernel pattern)
- **5 atomic CTE helpers** (upsert/remove line, confirm, cancel, convert quote to order)
- **Comprehensive tests** (503 lines) covering conversion, guards, immutability, totals, tenant isolation
- **All quality gates passing** ✅

---

## What Was Implemented

### 1. Database Schema (Migration `0004_steep_justice.sql`)

**Tables:**
- `sales_orders` (13 columns, 3 indexes)
  - Status: `DRAFT → CONFIRMED → CANCELLED`
  - Links to `erp_partners`, optional `source_quote_id`
- `sales_order_lines` (12 columns, 1 index)
  - Numeric qty (18,6), integer cents pricing
  - Unique constraint on `(tenant_id, order_id, line_no)`

**Business Rules:**
- Header/lines mutable only in `DRAFT`
- Confirm requires ≥1 line
- Cancel allowed in `DRAFT` or `CONFIRMED`
- After `CANCELLED`: immutable

---

### 2. Validation Contracts (Zod SSOT)

**Inputs:**
- `OrderCreateInput` (partnerId, currency, notes?)
- `OrderUpdateInput` (partnerId?, currency?, notes?)
- `OrderLineUpsertInput` (lineNo?, productId?, description, uomId, qty, unitPrice)
- `OrderListQuery` (q?, status[], partnerId?, cursor?, limit≤100)
- `ConvertQuoteToOrderInput` (empty body — quoteId from URL)

**Outputs:**
- `OrderOutput` (header + lines)
- `OrderLineOutput`
- `OrderListOutput` ({items, nextCursor})

---

### 3. Atomic Helpers (CTE Pattern)

**File:** `packages/domain/src/addons/sales/orders/helpers/atomic-sales-order.ts` (544 lines)

**Helpers:**
1. `atomicUpsertOrderLineAndRecalcWithAudit` — Update/insert line + recalculate total + audit
2. `atomicRemoveOrderLineAndRecalcWithAudit` — Delete line + recalculate total + audit
3. `atomicConfirmOrderWithAudit` — Transition DRAFT → CONFIRMED (requires ≥1 line)
4. `atomicCancelOrderWithAudit` — Transition DRAFT/CONFIRMED → CANCELLED
5. `atomicConvertQuoteToOrderWithAudit` — **THE BIG ONE**:
   - Validates quote (ACCEPTED status, ≥1 line)
   - Inserts order header (copies partner, currency, total)
   - Bulk inserts all quote lines → order lines (preserves line_no)
   - Emits audit event
   - **Atomic**: If any step fails, entire operation rolls back

---

### 4. Service Layer

**File:** `packages/domain/src/addons/sales/orders/services/order-service.ts` (502 lines)

**Methods:**
- `create(ctx, input, db)` → OrderOutput
- `update(ctx, id, patch, db)` → OrderOutput *(DRAFT only)*
- `get(ctx, id, db)` → OrderOutput
- `list(ctx, query, db)` → OrderListOutput
- `upsertLine(ctx, orderId, lineInput, db)` → OrderOutput *(DRAFT only, recalcs total)*
- `removeLine(ctx, orderId, lineNo, db)` → OrderOutput *(DRAFT only, recalcs total)*
- `confirm(ctx, id, db)` → OrderOutput *(requires ≥1 line)*
- `cancel(ctx, id, db)` → OrderOutput *(DRAFT or CONFIRMED)*
- `convertQuoteToOrder(ctx, quoteId, db)` → OrderOutput *(ACCEPTED quotes only)*

**Patterns:**
- Constructor injection (SequenceService)
- DB passed per method
- Money: string ↔ cents conversion
- Qty: string ↔ numeric(18,6) conversion

---

### 5. API Routes (Spec-Only)

**7 files → 9 operations:**

1. `GET /api/erp/sales/orders` → `erp.sales.orders.list`
2. `POST /api/erp/sales/orders` → `erp.sales.orders.create`
3. `GET /api/erp/sales/orders/:id` → `erp.sales.orders.get`
4. `PATCH /api/erp/sales/orders/:id` → `erp.sales.orders.update`
5. `POST /api/erp/sales/orders/:id/lines` → `erp.sales.orders.lines.upsert`
6. `DELETE /api/erp/sales/orders/:id/lines/:lineNo` → `erp.sales.orders.lines.remove`
7. `POST /api/erp/sales/orders/:id/confirm` → `erp.sales.orders.confirm`
8. `POST /api/erp/sales/orders/:id/cancel` → `erp.sales.orders.cancel`
9. `POST /api/erp/sales/orders/from-quote/:quoteId` → `erp.sales.orders.createFromQuote`

**All routes:**
- Use `kernel({ ... })` pattern
- Tenant + auth required
- No route → DB access
- Zod validation at boundary

---

### 6. Tests (Comprehensive)

**File:** `packages/domain/src/addons/sales/orders/__tests__/order-service.test.ts` (503 lines)

**Test Coverage:**

#### Quote Conversion
- ✅ Converts ACCEPTED quote to order with all lines copied
- ✅ Total matches quote total
- ✅ Line_no values preserved
- ✅ Rejects conversion if quote not ACCEPTED
- ✅ Rejects conversion if quote has no lines
- ✅ Emits audit event for conversion

#### Confirm Guard
- ✅ Confirms order with ≥1 line
- ✅ Rejects confirm if order has no lines
- ✅ Rejects confirm if order not in DRAFT

#### DRAFT-only Mutation
- ✅ Rejects update if order not in DRAFT
- ✅ Rejects line upsert if order not in DRAFT
- ✅ Rejects line removal if order not in DRAFT

#### Total Calculation
- ✅ Recalculates total when lines added
- ✅ Recalculates total when line removed

#### Tenant Isolation
- ✅ Rejects cross-tenant order access
- ✅ Rejects cross-tenant quote conversion

#### Audit Atomicity
- ✅ Order creation has audit event
- ✅ Line operations emit audit events

---

## Quality Gates (All Passing ✅)

### Typecheck
```
✅ pnpm typecheck:core
   - @workspace/domain: OK
   - @workspace/api-kernel: OK
   - @workspace/validation: OK
```

### API Kernel Compliance
```
✅ pnpm check:api-kernel
   - 28 route files checked
   - All using kernel pattern
   - Allowlist enforced
```

### Migration Drift
```
✅ No schema drift (migration 0004 generated and committed)
```

### Route Snapshot
```
✅ .cursor/snapshots/erp-routes.txt updated
   - 9 new order routes added (alphabetized)
   - 24 quote + base routes preserved
```

---

## Files Created/Modified

### Database (3 files)
- `packages/db/drizzle/0004_steep_justice.sql`
- `packages/db/src/erp/sales/orders.ts`
- `packages/db/src/erp/sales/order-lines.ts`

### Validation (2 files)
- `packages/validation/src/erp/sales/order.ts`
- `packages/validation/src/erp/sales/index.ts` (modified)

### Domain (6 files)
- `packages/domain/src/addons/sales/orders/helpers/atomic-sales-order.ts`
- `packages/domain/src/addons/sales/orders/services/order-service.ts`
- `packages/domain/src/addons/sales/orders/__tests__/order-service.test.ts`
- `packages/domain/src/addons/sales/orders/index.ts`
- `packages/domain/src/addons/sales/manifest.ts` (modified)
- `packages/domain/src/addons/sales/tokens.ts` (modified)

### API Routes (7 files)
- `apps/web/app/api/erp/sales/orders/route.ts`
- `apps/web/app/api/erp/sales/orders/[id]/route.ts`
- `apps/web/app/api/erp/sales/orders/[id]/lines/route.ts`
- `apps/web/app/api/erp/sales/orders/[id]/lines/[lineNo]/route.ts`
- `apps/web/app/api/erp/sales/orders/[id]/confirm/route.ts`
- `apps/web/app/api/erp/sales/orders/[id]/cancel/route.ts`
- `apps/web/app/api/erp/sales/orders/from-quote/[quoteId]/route.ts`

### Snapshots (1 file)
- `.cursor/snapshots/erp-routes.txt` (updated)

**Total:** 22 files changed, 4334 insertions(+), 1 deletion(-)

---

## What's Next (Phase 2.3 — Optional)

Phase 2.2 is **complete and self-contained**. The system can now:
- Create manual orders (DRAFT → CONFIRMED → CANCELLED)
- Convert ACCEPTED quotes to orders atomically
- Manage order lines with automatic total recalculation

**Optional Phase 2.3 enhancements** (inventory-decoupled):
- Order processing states (PROCESSING, DONE)
- Delivery tracking (without inventory reservation)
- Invoice generation (without payment integration)
- Reporting/analytics

**Not in scope yet:**
- Inventory reservation (Phase 3.x)
- Stock management (Phase 3.x)
- Picking/shipping workflows (Phase 3.x)
- Payment integration (Phase 4.x)

---

## EVI003 Status Reminder

**Observability traces pillar still pending:**
- ✅ Errors pillar: GlitchTip working
- ⏳ Traces pillar: Tempo proof pending (not blocking)

Can be completed async. See `.cursor/plans/C-evidence-evi/EVI003-OBSERVABILITY-STITCH.md`.

---

## Session Status

**Branch:** `erp/phase-0-infrastructure`  
**Working Tree:** Clean (handoff docs untracked — intentional)  
**Last Commit:** `56d8790d`

**Phase 2.2:** ✅ **COMPLETE**  
**Quality Gates:** ✅ **ALL PASSING**  
**Tests:** ✅ **COMPREHENSIVE**  
**Documentation:** ✅ **UPDATED**

Ready for Phase 2.3 or production deployment.
