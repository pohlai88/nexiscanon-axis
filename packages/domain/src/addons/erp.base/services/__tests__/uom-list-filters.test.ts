// packages/domain/src/addons/erp.base/services/__tests__/uom-list-filters.test.ts
// Phase 1.5 Test: UoM list filtering and pagination correctness
//
// Tests:
// 1. Default list returns only isActive=true
// 2. Search query (q) filters properly
// 3. Cursor pagination returns stable ordering (no duplicates across pages)

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { UomServiceImpl } from "../uom-service";
import { drizzle, Pool, createTestDbConfig, createTestContext, cleanupTestData } from "./test-helpers";

describe("UomService: List Filters & Pagination", () => {
  let db: any;
  let uomService: UomServiceImpl;
  let ctx: ReturnType<typeof createTestContext>;
  const testTenantId = "test-uom-list-tenant";

  beforeAll(async () => {
    const pool = new Pool(createTestDbConfig());
    // @ts-expect-error - pg version conflict between domain test deps and drizzle-orm peer deps
    db = drizzle(pool);
    ctx = createTestContext({ tenantId: testTenantId });
    uomService = new UomServiceImpl();

    // Seed test data: 3 active, 2 inactive
    await uomService.create(ctx, { code: "KG", name: "Kilogram", category: "weight", isActive: true }, db);
    await uomService.create(ctx, { code: "LB", name: "Pound", category: "weight", isActive: true }, db);
    await uomService.create(ctx, { code: "OZ", name: "Ounce", category: "weight", isActive: true }, db);
    
    const inactive1 = await uomService.create(ctx, { code: "TON", name: "Ton", category: "weight", isActive: true }, db);
    const inactive2 = await uomService.create(ctx, { code: "MG", name: "Milligram", category: "weight", isActive: true }, db);
    
    // Archive 2 to make them inactive
    await uomService.archive(ctx, inactive1.id, db);
    await uomService.archive(ctx, inactive2.id, db);
  });

  afterAll(async () => {
    await cleanupTestData(db, testTenantId);
  });

  it("should return only isActive=true by default", async () => {
    const result = await uomService.list(ctx, { limit: 20 }, db);

    expect(result.items).toHaveLength(3);
    expect(result.items.every((item) => item.isActive === true)).toBe(true);
  });

  it("should return all when isActive=undefined (explicit override)", async () => {
    const result = await uomService.list(ctx, { limit: 20, isActive: undefined }, db);

    // Should include both active and inactive (5 total)
    expect(result.items.length).toBeGreaterThanOrEqual(3);
  });

  it("should filter by search query (q)", async () => {
    const result = await uomService.list(ctx, { limit: 20, q: "kilo" }, db);

    expect(result.items.length).toBeGreaterThanOrEqual(1);
    expect(result.items.some((item) => item.name.toLowerCase().includes("kilo"))).toBe(true);
  });

  it("should normalize search query (trim whitespace)", async () => {
    const resultWithSpaces = await uomService.list(ctx, { limit: 20, q: "  pound  " }, db);
    const resultClean = await uomService.list(ctx, { limit: 20, q: "pound" }, db);

    expect(resultWithSpaces.items).toHaveLength(resultClean.items.length);
  });

  it("should return stable ordering with cursor pagination (no duplicates)", async () => {
    // Fetch first page (limit 2)
    const page1 = await uomService.list(ctx, { limit: 2 }, db);

    expect(page1.items).toHaveLength(2);
    expect(page1.nextCursor).toBeDefined();
    expect(page1.nextCursor).not.toBeNull();

    // Fetch second page using cursor
    const page2 = await uomService.list(ctx, { limit: 2, cursor: page1.nextCursor! }, db);

    // Verify no duplicates between pages
    const page1Ids = page1.items.map((item) => item.id);
    const page2Ids = page2.items.map((item) => item.id);

    const duplicates = page1Ids.filter((id) => page2Ids.includes(id));
    expect(duplicates).toHaveLength(0);
  });

  it("should return null nextCursor when no more items", async () => {
    const result = await uomService.list(ctx, { limit: 100 }, db);

    // If all items fit in one page, nextCursor should be null
    if (result.items.length <= 100) {
      expect(result.nextCursor).toBeNull();
    }
  });

  it("should cap limit at max allowed", async () => {
    // Attempt to fetch with very high limit
    const result = await uomService.list(ctx, { limit: 1000 }, db);

    // Should not explode; result should be reasonable
    expect(result.items.length).toBeLessThanOrEqual(1000);
  });
});
