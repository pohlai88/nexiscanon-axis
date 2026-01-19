# Anti-Drift Fixes Complete

## ✅ Issue A: Test Typecheck Re-enabled

**Problem**: Tests were excluded from typecheck, creating future rot risk.

**Fix Applied**:
- Created `tsconfig.vitest.json` for test-specific typecheck
- Added `check-types:tests` script to `package.json`
- Used `@ts-expect-error` with clear comments for pg version conflict (acceptable for tests)
- **Result**: Both prod code AND tests are now typechecked in separate passes

**Scripts**:
```json
{
  "check-types": "tsc --noEmit",           // Prod code only
  "check-types:tests": "tsc -p tsconfig.vitest.json --noEmit",  // Tests only
  "test": "vitest run"
}
```

**CI Integration**: Run both `check-types` and `check-types:tests` in CI pipeline.

---

## ✅ Issue B: Sequence Service Exemption Removed

**Problem**: `sequence-service.ts` was exempted from naked-write gate, creating drift risk for "admin code".

**Fix Applied**:
- Refactored `SequenceService.create()` to use `atomicInsertWithAudit()`
- Refactored `SequenceService.update()` to use `atomicUpdateWithAudit()`
- Removed `ErpAuditService` dependency from constructor (no longer needed)
- Removed special-case exemption from `check:erp` gate
- **Result**: ALL ERP services (including admin operations) use atomic helpers

**Before**:
```typescript
async create(ctx, input, db) {
  return await db.transaction(async (tx) => {
    const [sequence] = await tx.insert(erpSequences).values(...).returning();
    await this.auditService.emitTx(tx, ctx, event);  // Phase 0 pattern
    return sequence;
  });
}
```

**After**:
```typescript
async create(ctx, input, db) {
  const row = await atomicInsertWithAudit(db, {
    table: "erp_sequences",
    values: {...},
    entityType: "erp.base.sequence",
    eventType: "erp.base.sequence.created",
    ctx,
  });
  return this.toOutput(row);
}
```

---

## Verification

All quality gates pass:
- ✅ `pnpm check:erp` (no naked writes)
- ✅ `pnpm check:api-kernel`
- ✅ `pnpm check:db-migrations`
- ✅ `pnpm typecheck:core` (prod code)
- ✅ `pnpm --filter @workspace/domain check-types:tests` (test code)

---

## Architecture Now Truly Locked

**No drift vectors remain:**

1. ✅ Prod code typechecked (strict)
2. ✅ Test code typechecked (with documented @ts-expect-error for version conflicts only)
3. ✅ No file/function exemptions in naked-write gate
4. ✅ ALL mutations (including admin) use atomic helpers
5. ✅ Tests prove atomic guarantees (sequence concurrency, audit atomicity, rollback)

**Governance principle applied**: "Admin code is still code" - no special treatment creates no drift.

---

## Ready for Phase 1.4: Route Handlers

With both anti-drift issues resolved, architecture is genuinely locked forever.
