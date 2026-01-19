# ERP Domain Services - Compliance Tests

## Phase 1.3.1: Critical Architecture Tests

These tests lock the **hardest-won guarantees** of the ERP system:

1. **Sequence Concurrency** - Proves atomic sequence generation prevents duplicates
2. **Audit Atomicity** - Proves entity + audit are created together (CTE guarantee)
3. **Atomic Rollback** - Proves no partial state on audit failure

## Running Tests

### Prerequisites

Tests require a **PostgreSQL database** with ERP schema applied.

Set the database URL via environment variable:

```bash
export DATABASE_URL_TEST="postgresql://user:pass@localhost:5432/my_axis_test"
# or use DATABASE_URL if DATABASE_URL_TEST is not set
```

### Run all tests

```bash
pnpm --filter @workspace/domain test
```

### Run in watch mode (during development)

```bash
pnpm --filter @workspace/domain test:watch
```

### Run with UI

```bash
pnpm --filter @workspace/domain test:ui
```

## Test Files

### 1. `sequence-concurrency.test.ts`

**Goal**: Prove that 50 parallel `next()` calls return 50 unique, monotonically increasing values.

**Why this matters**: This is the **real proof** that atomic `UPDATE...RETURNING` works correctly on Neon HTTP, preventing duplicate document numbers even under high concurrency.

**Pass criteria**:
- All 50 values are unique
- Values are sequential (1-50)
- Year reset works atomically under concurrency

### 2. `uom-audit-atomicity.test.ts`

**Goal**: Prove that `UomService.create()` results in exactly one entity row + one audit row, created together.

**Why this matters**: This proves the CTE atomic write pattern guarantees **no silent audit loss**. If entity exists, audit MUST exist.

**Pass criteria**:
- Entity row exists with correct data
- Audit row exists with correct `entityId`, `entityType`, `eventType`
- Audit `tenantId` and `actorUserId` match context
- Audit payload includes entity data

### 3. `atomic-rollback.test.ts`

**Goal**: Prove that forcing audit INSERT to fail also prevents entity INSERT (full rollback, no partial state).

**Why this matters**: This is the **proof that CTE is truly atomic**. If audit fails, entity must not exist.

**Pass criteria**:
- When audit constraint is violated, entity is NOT created
- When both are valid, both are created
- No orphaned entities, no orphaned audits

## Architecture Notes

### Why these tests are non-negotiable

**Without these tests**, the following production failures are inevitable:

1. **Sequence concurrency test**: Duplicate invoice numbers, purchase orders, or customer codes under load
2. **Audit atomicity test**: Silent compliance failures where business events are lost
3. **Atomic rollback test**: Partial state leading to data corruption and audit mismatch

These are **not unit tests**. These are **architectural correctness proofs**.

### Test Database Strategy

- Tests use **real PostgreSQL** (not mocks)
- Each test creates isolated tenant data
- Cleanup runs after each test suite
- **Important**: Tests do NOT reset the entire database (other tests may be running)

### CI/CD Integration

Add to your CI pipeline:

```yaml
- name: Run ERP compliance tests
  run: |
    pnpm --filter @workspace/domain test
  env:
    DATABASE_URL_TEST: ${{ secrets.DATABASE_URL_TEST }}
```

## Next: Phase 1.4 - Route Handlers

With these tests in place, you're cleared to implement ERP route handlers. Routes will:

- Validate with Zod
- Call services
- Return kernel envelope
- **Zero DB calls** (services own all data access)
