Here's a static, sequenced implementation guide that follows your canon and ensures isolation:

---

# ERP Implementation Sequencer (Static Guide)

## Pre-Flight Checklist (Before Any Code)

| # | Check | How to Verify |
|---|-------|---------------|
| 1 | All platform gates pass | `pnpm check:api-kernel && pnpm check:db-migrations && pnpm lint` |
| 2 | Database connection works | `pnpm db:migrate` (dry run) |
| 3 | ERP planning docs reviewed | All `help001–help014` read |
| 4 | Odoo repo available for reference | `.repo-odoo/` exists |

---

## Implementation Sequence

### Phase 0: ERP Infrastructure (Do Once)

Before any ERP module, create the shared infrastructure:

| Step | Task | Creates | Verify |
|------|------|---------|--------|
| 0.1 | Create `pnpm check:erp` script | `scripts/check-erp.ts` | Script runs, exits 0 |
| 0.2 | Create ERP audit table | `packages/db/src/erp/audit/events.ts` | Migration generated |
| 0.3 | Create AuditService interface | `packages/domain/src/addons/erp.base/services/audit-service.ts` | TypeScript compiles |
| 0.4 | Create ERP validation barrel | `packages/validation/src/erp/index.ts` | Import works |
| 0.5 | Create ERP DB barrel | `packages/db/src/erp/index.ts` | Import works |

**Gate:** All platform checks still pass.

---

### Phase 1: erp.base (Foundation)

Complete **all steps** before moving to Phase 2.

#### 1.1 Database Schema

| Step | Task | File Path | Verify |
|------|------|-----------|--------|
| 1.1.1 | Create UoMs table | `packages/db/src/erp/base/uoms.ts` | `pnpm db:generate` |
| 1.1.2 | Create Sequences table | `packages/db/src/erp/base/sequences.ts` | `pnpm db:generate` |
| 1.1.3 | Create Partners table | `packages/db/src/erp/base/partners.ts` | `pnpm db:generate` |
| 1.1.4 | Create Products table | `packages/db/src/erp/base/products.ts` | `pnpm db:generate` |
| 1.1.5 | Create barrel export | `packages/db/src/erp/base/index.ts` | Import works |
| 1.1.6 | Run migration | `pnpm db:migrate` | Tables exist |

**Gate:** `pnpm check:db-migrations` passes.

#### 1.2 Zod Contracts

| Step | Task | File Path | Verify |
|------|------|-----------|--------|
| 1.2.1 | Create UoM DTOs | `packages/validation/src/erp/base/uom.ts` | TypeScript compiles |
| 1.2.2 | Create Partner DTOs | `packages/validation/src/erp/base/partner.ts` | TypeScript compiles |
| 1.2.3 | Create Product DTOs | `packages/validation/src/erp/base/product.ts` | TypeScript compiles |
| 1.2.4 | Create Permissions | `packages/validation/src/erp/base/permissions.ts` | TypeScript compiles |
| 1.2.5 | Create barrel export | `packages/validation/src/erp/base/index.ts` | Import works |

**Gate:** `pnpm typecheck` passes.

#### 1.3 Domain Addon

| Step | Task | File Path | Verify |
|------|------|-----------|--------|
| 1.3.1 | Create manifest | `packages/domain/src/addons/erp.base/manifest.ts` | Has id, version, dependsOn |
| 1.3.2 | Create SequenceService | `packages/domain/src/addons/erp.base/services/sequence-service.ts` | TypeScript compiles |
| 1.3.3 | Create PartnerService | `packages/domain/src/addons/erp.base/services/partner-service.ts` | TypeScript compiles |
| 1.3.4 | Create ProductService | `packages/domain/src/addons/erp.base/services/product-service.ts` | TypeScript compiles |
| 1.3.5 | Create UomService | `packages/domain/src/addons/erp.base/services/uom-service.ts` | TypeScript compiles |
| 1.3.6 | Create SeedService | `packages/domain/src/addons/erp.base/services/seed-service.ts` | TypeScript compiles |
| 1.3.7 | Create index barrel | `packages/domain/src/addons/erp.base/index.ts` | Import works |

**Gate:** `pnpm check:erp` passes for manifest.

#### 1.4 API Routes

| Step | Task | File Path | Verify |
|------|------|-----------|--------|
| 1.4.1 | Create partners routes | `apps/web/app/api/erp/base/partners/route.ts` | `pnpm check:api-kernel` |
| 1.4.2 | Create partners/[id] routes | `apps/web/app/api/erp/base/partners/[id]/route.ts` | `pnpm check:api-kernel` |
| 1.4.3 | Create products routes | `apps/web/app/api/erp/base/products/route.ts` | `pnpm check:api-kernel` |
| 1.4.4 | Create products/[id] routes | `apps/web/app/api/erp/base/products/[id]/route.ts` | `pnpm check:api-kernel` |
| 1.4.5 | Create uoms routes | `apps/web/app/api/erp/base/uoms/route.ts` | `pnpm check:api-kernel` |

**Gate:** `pnpm check:api-kernel` passes.

#### 1.5 Tests & Proof

| Step | Task | File Path | Verify |
|------|------|-----------|--------|
| 1.5.1 | Tenant isolation test | `packages/domain/src/addons/erp.base/__tests__/tenant-isolation.test.ts` | Test passes |
| 1.5.2 | Sequence uniqueness test | `packages/domain/src/addons/erp.base/__tests__/sequence.test.ts` | Test passes |

**Gate:** `pnpm test` passes for erp.base.

#### Phase 1 Completion Checklist

- [ ] All 4 tables created with `tenant_id`
- [ ] All Zod contracts created
- [ ] Manifest exists with correct structure
- [ ] All routes are spec-only (`kernel({...})`)
- [ ] Sequence service generates unique doc numbers
- [ ] Seed function creates default UoMs/sequences
- [ ] 2+ invariant tests passing
- [ ] `pnpm check:erp` passing
- [ ] `pnpm check:api-kernel` passing
- [ ] `pnpm check:db-migrations` passing

**STOP:** Do not proceed to Phase 2 until all boxes checked.

---

### Phase 2A: erp.sales

Only start after Phase 1 is complete.

#### 2A.1 Database Schema

| Step | Task | File Path |
|------|------|-----------|
| 2A.1.1 | Create Sales Orders table | `packages/db/src/erp/sales/orders.ts` |
| 2A.1.2 | Create Sales Order Lines table | `packages/db/src/erp/sales/order-lines.ts` |
| 2A.1.3 | Create barrel export | `packages/db/src/erp/sales/index.ts` |
| 2A.1.4 | Run migration | `pnpm db:generate && pnpm db:migrate` |

#### 2A.2 Zod Contracts

| Step | Task | File Path |
|------|------|-----------|
| 2A.2.1 | Create Order DTOs | `packages/validation/src/erp/sales/order.ts` |
| 2A.2.2 | Create Workflow schemas | `packages/validation/src/erp/sales/workflow.ts` |
| 2A.2.3 | Create Permissions | `packages/validation/src/erp/sales/permissions.ts` |

#### 2A.3 Domain Addon

| Step | Task | File Path |
|------|------|-----------|
| 2A.3.1 | Create manifest | `packages/domain/src/addons/erp.sales/manifest.ts` |
| 2A.3.2 | Create SalesOrderService | `packages/domain/src/addons/erp.sales/services/order-service.ts` |
| 2A.3.3 | Create WorkflowService | `packages/domain/src/addons/erp.sales/services/workflow-service.ts` |
| 2A.3.4 | Create PolicyService | `packages/domain/src/addons/erp.sales/policies/order-policy.ts` |

#### 2A.4 API Routes

| Step | Task | File Path |
|------|------|-----------|
| 2A.4.1 | Create orders routes | `apps/web/app/api/erp/sales/orders/route.ts` |
| 2A.4.2 | Create orders/[id] routes | `apps/web/app/api/erp/sales/orders/[id]/route.ts` |
| 2A.4.3 | Create orders/[id]/submit | `apps/web/app/api/erp/sales/orders/[id]/submit/route.ts` |
| 2A.4.4 | Create orders/[id]/approve | `apps/web/app/api/erp/sales/orders/[id]/approve/route.ts` |
| 2A.4.5 | Create orders/[id]/post | `apps/web/app/api/erp/sales/orders/[id]/post/route.ts` |

#### 2A.5 Tests

| Step | Task | File Path |
|------|------|-----------|
| 2A.5.1 | Workflow transition test | `__tests__/workflow.test.ts` |
| 2A.5.2 | Tenant isolation test | `__tests__/tenant-isolation.test.ts` |

---

### Phase 2B: erp.inventory

Can run in parallel with 2A if teams are separate, or sequentially.

#### 2B.1 Database Schema

| Step | Task | File Path |
|------|------|-----------|
| 2B.1.1 | Create Locations table | `packages/db/src/erp/inventory/locations.ts` |
| 2B.1.2 | Create Stock Moves table | `packages/db/src/erp/inventory/moves.ts` |
| 2B.1.3 | Create Stock Quant table | `packages/db/src/erp/inventory/quants.ts` |

#### 2B.2 Zod Contracts

| Step | Task | File Path |
|------|------|-----------|
| 2B.2.1 | Create Location DTOs | `packages/validation/src/erp/inventory/location.ts` |
| 2B.2.2 | Create Move DTOs | `packages/validation/src/erp/inventory/move.ts` |
| 2B.2.3 | Create Workflow schemas | `packages/validation/src/erp/inventory/workflow.ts` |

#### 2B.3 Domain Addon

| Step | Task | File Path |
|------|------|-----------|
| 2B.3.1 | Create manifest | `packages/domain/src/addons/erp.inventory/manifest.ts` |
| 2B.3.2 | Create MoveService | `packages/domain/src/addons/erp.inventory/services/move-service.ts` |
| 2B.3.3 | Create QuantService | `packages/domain/src/addons/erp.inventory/services/quant-service.ts` |

---

### Phase 2C: erp.purchase

After erp.inventory is complete (depends on it).

*(Same pattern: DB → Contracts → Domain → Routes → Tests)*

---

### Phase 3A: erp.invoice

After Phase 2 modules are complete.

*(Same pattern)*

---

### Phase 3B: erp.payment

After erp.invoice is complete.

*(Same pattern)*

---

### Phase 4: erp.accounting

Last module. Only after erp.invoice and erp.payment are complete.

*(Same pattern)*

---

## Module Implementation Template (Reusable)

For any module `erp.<module>`:

```
Step 1: DB Schema
├── packages/db/src/erp/<module>/
│   ├── <entity>.ts (Drizzle schema)
│   └── index.ts (barrel)
└── pnpm db:generate && pnpm db:migrate

Step 2: Contracts
├── packages/validation/src/erp/<module>/
│   ├── dto.ts (create/update/read)
│   ├── workflow.ts (if lifecycle)
│   ├── permissions.ts
│   └── index.ts (barrel)
└── pnpm typecheck

Step 3: Domain Addon
├── packages/domain/src/addons/erp.<module>/
│   ├── manifest.ts
│   ├── services/
│   ├── policies/
│   └── index.ts (barrel)
└── pnpm check:erp

Step 4: Routes
├── apps/web/app/api/erp/<module>/
│   ├── <entity>/route.ts
│   ├── <entity>/[id]/route.ts
│   └── <entity>/[id]/<action>/route.ts
└── pnpm check:api-kernel

Step 5: Tests
├── packages/domain/src/addons/erp.<module>/__tests__/
│   ├── tenant-isolation.test.ts
│   └── workflow.test.ts (if lifecycle)
└── pnpm test
```

---

## Gate Checks (Run After Each Module)

```bash
# All must pass before proceeding
pnpm check:db-migrations
pnpm check:api-kernel  
pnpm check:erp
pnpm typecheck
pnpm lint
pnpm test
```

---

## Isolation Principles

1. **ERP code only in ERP paths** — Never touch platform files
2. **ERP depends on Platform, not vice versa** — No reverse imports
3. **Module depends on erp.base** — No cross-module direct imports (except declared `dependsOn`)
4. **Tenant scope everywhere** — Every query includes `tenant_id`
5. **Audit on every transition** — No silent state changes

---

## Recommended Work Cadence

| Session | Focus | Deliverable |
|---------|-------|-------------|
| 1 | Phase 0 (Infrastructure) | `check:erp`, audit table, AuditService |
| 2 | Phase 1.1–1.2 (erp.base DB + Contracts) | Tables + Zod schemas |
| 3 | Phase 1.3–1.4 (erp.base Domain + Routes) | Services + API |
| 4 | Phase 1.5 (erp.base Tests + Polish) | Tests passing, Phase 1 done |
| 5 | Phase 2A.1–2A.3 (erp.sales core) | Schema + Services |
| 6 | Phase 2A.4–2A.5 (erp.sales routes + tests) | Phase 2A done |
| 7+ | Continue with 2B, 2C, 3A, 3B, 4 | One module at a time |

---

This guide is static — follow it step by step. Each step has a clear file path and verification command. Would you like me to elaborate on any specific phase or step?