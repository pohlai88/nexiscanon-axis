// packages/domain/src/addons/erp.base/services/__tests__/sequence-concurrency.test.ts
// Test 1: Sequence Concurrency Uniqueness
//
// CRITICAL: Proves that atomic UPDATE...RETURNING guarantees unique sequence numbers
// even under high concurrency on Neon HTTP driver

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { SequenceServiceImpl } from "../sequence-service";
import { drizzle, Pool, createTestDbConfig, createTestContext, cleanupTestData } from "./test-helpers";

describe("SequenceService: Concurrency Uniqueness", () => {
  let db: any;
  let sequenceService: SequenceServiceImpl;
  let ctx: ReturnType<typeof createTestContext>;
  const testTenantId = "test-sequence-concurrency-tenant";

  beforeAll(async () => {
    const pool = new Pool(createTestDbConfig());
    // @ts-expect-error - pg version conflict between domain test deps and drizzle-orm peer deps
    db = drizzle(pool);
    ctx = createTestContext({ tenantId: testTenantId });

    // SequenceService no longer needs ErpAuditService (uses atomic helpers)
    sequenceService = new SequenceServiceImpl();

    // Create a test sequence
    await sequenceService.create(
      ctx,
      {
        sequenceKey: "test.concurrent",
        prefix: "TEST-",
        nextValue: 1,
        padding: 4,
        yearReset: false,
      },
      db
    );
  });

  afterAll(async () => {
    await cleanupTestData(db, testTenantId);
  });

  it("should generate 50 unique sequence numbers under parallel load", async () => {
    const PARALLEL_CALLS = 50;

    // Fire 50 parallel next() calls
    const promises = Array.from({ length: PARALLEL_CALLS }, () =>
      sequenceService.next(ctx, "test.concurrent", db)
    );

    const results = await Promise.all(promises);

    // Extract raw allocated values
    const allocatedValues = results.map((r) => r.raw);

    // CRITICAL: All values must be unique
    const uniqueValues = new Set(allocatedValues);
    expect(uniqueValues.size).toBe(PARALLEL_CALLS);

    // BONUS: Values should be monotonically increasing (strict guarantee)
    const sortedValues = [...allocatedValues].sort((a, b) => a - b);
    expect(sortedValues[0]).toBe(1);
    expect(sortedValues[PARALLEL_CALLS - 1]).toBe(PARALLEL_CALLS);

    // Verify formatted values are correct
    results.forEach((result, idx) => {
      expect(result.value).toMatch(/^TEST-\d{4}$/);
      expect(result.sequenceKey).toBe("test.concurrent");
    });
  });

  it("should handle year reset atomically under concurrency", async () => {
    const yearResetCtx = createTestContext({ tenantId: testTenantId });

    // Create a year-reset sequence
    await sequenceService.create(
      yearResetCtx,
      {
        sequenceKey: "test.year.reset",
        prefix: "YR-",
        nextValue: 1,
        padding: 3,
        yearReset: true,
        currentYear: 2023, // Old year to trigger reset
      },
      db
    );

    // Fire 20 parallel calls (should all reset to current year)
    const PARALLEL_CALLS = 20;
    const promises = Array.from({ length: PARALLEL_CALLS }, () =>
      sequenceService.next(yearResetCtx, "test.year.reset", db)
    );

    const results = await Promise.all(promises);
    const allocatedValues = results.map((r) => r.raw);

    // All values must be unique
    const uniqueValues = new Set(allocatedValues);
    expect(uniqueValues.size).toBe(PARALLEL_CALLS);

    // All formatted values should include current year
    const currentYear = new Date().getFullYear();
    results.forEach((result) => {
      expect(result.value).toMatch(new RegExp(`^YR-${currentYear}-\\d{3}$`));
    });
  });
});
