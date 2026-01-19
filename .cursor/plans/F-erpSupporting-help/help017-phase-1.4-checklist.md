# Phase 1.4 Execution Checklist

## ✅ Prerequisites Complete
- [x] Services implemented (UoM, Partner, Product, Sequence)
- [x] Zod contracts defined (input, output, list query)
- [x] ERP_BASE_TOKENS exported from @workspace/domain
- [x] getDomainContainer() available from @workspace/app-runtime
- [x] getDb() available from @workspace/db
- [x] kernel() pattern proven in /api/requests

---

## 📋 Phase 1.4 Tasks (Execute in Order)

### 1. Create UoM Routes
- [ ] Create `apps/web/app/api/erp/base/uoms/route.ts` (Template A)
- [ ] Create `apps/web/app/api/erp/base/uoms/[id]/route.ts` (Template B)

### 2. Create Partner Routes
- [ ] Create `apps/web/app/api/erp/base/partners/route.ts` (Template A modified)
- [ ] Create `apps/web/app/api/erp/base/partners/[id]/route.ts` (Template B modified)

### 3. Create Product Routes
- [ ] Create `apps/web/app/api/erp/base/products/route.ts` (Template A modified)
- [ ] Create `apps/web/app/api/erp/base/products/[id]/route.ts` (Template B modified)

### 4. Verify All Gates Pass
```bash
pnpm check:api-kernel
pnpm check:erp
pnpm check:db-migrations
pnpm typecheck:core
pnpm --filter @workspace/domain check-types:tests
```

### 5. (Optional) Add Route Gate
- [ ] Add `checkErpRoutes()` to `scripts/check-erp.ts`
- [ ] Verify gate catches missing kernel() usage
- [ ] Verify gate catches direct DB imports

### 6. Manual Smoke Test (Pick One)
- [ ] Curl: `curl -X POST http://localhost:3000/api/erp/base/uoms -H "Content-Type: application/json" -d '{"code":"KG","name":"Kilogram","category":"weight","precision":3}'`
- [ ] Postman: Import OpenAPI spec (if generated)
- [ ] Playwright: Add one E2E test

---

## 📝 Templates Location

**Primary Reference:**
`.cursor/plans/F-erpSupporting-help/help016-erp-route-templates-final.md`

**Key Points:**
- Template A: Collection route (POST + GET list)
- Template B: Item route (GET + PATCH + DELETE)
- Exact kernel signature from your existing routes
- ServiceContext mapping: `actorUserId: actorId`
- Explicit `db` parameter passing

---

## 🎯 Find/Replace for Partners

Starting from UoM template:
```
uoms → partners
Uom → Partner
UoM → Partner
uom → partner
@workspace/validation/erp/base/uom → @workspace/validation/erp/base/partner
ERP_BASE_TOKENS.UomService → ERP_BASE_TOKENS.PartnerService
```

## 🎯 Find/Replace for Products

Starting from UoM template:
```
uoms → products
Uom → Product
UoM → Product
uom → product
@workspace/validation/erp/base/uom → @workspace/validation/erp/base/product
ERP_BASE_TOKENS.UomService → ERP_BASE_TOKENS.ProductService
```

---

## 🚨 Common Pitfalls to Avoid

1. ❌ Don't import Drizzle schemas in routes (only services)
2. ❌ Don't forget `await getDomainContainer()` (it's async)
3. ❌ Don't use `actorId` directly - map to `actorUserId` in service context
4. ❌ Don't skip `traceId: ctx.traceId` (needed for observability)
5. ❌ Don't forget the `db` parameter when calling services

---

## ✅ Success Criteria

**Phase 1.4 is complete when:**
- [ ] All 6 route files created (2 per entity)
- [ ] All quality gates pass
- [ ] At least one manual smoke test succeeds
- [ ] (Optional) Route gate added to prevent drift

**After completion, you have:**
- Full CRUD API for UoM, Partner, Product
- Zero database access in routes
- Kernel envelope for all responses
- Zod validation at every boundary
- Audit trail for every mutation (via services)

---

## 🎉 Next Phase After 1.4

**Phase 1.5 (Future):** Advanced ERP features
- Document numbering integration (PartnerService auto-code via Sequences)
- Multi-UoM conversions
- Product variants
- Partner contacts (1:N normalized)

**But first:** Lock down Phase 1.4 with zero compromises.
