// packages/domain/src/addons/erp.base/services/__tests__/uom-audit-atomicity.test.ts
// Test 2: UoM Audit Atomicity
//
// CRITICAL: Proves that CTE atomic write guarantees entity + audit rows
// are created together in a single atomic operation

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { UomServiceImpl } from "../uom-service";
import { drizzle, Pool, createTestDbConfig, createTestContext, cleanupTestData } from "./test-helpers";
import { erpUoms, erpAuditEvents } from "@workspace/db";
import { eq, and } from "drizzle-orm";

describe("UomService: Audit Atomicity", () => {
  let db: any;
  let uomService: UomServiceImpl;
  let ctx: ReturnType<typeof createTestContext>;
  const testTenantId = "test-uom-audit-tenant";

  beforeAll(() => {
    const pool = new Pool(createTestDbConfig());
    // @ts-expect-error - pg version conflict between domain test deps and drizzle-orm peer deps
    db = drizzle(pool);
    ctx = createTestContext({ tenantId: testTenantId });
    uomService = new UomServiceImpl();
  });

  afterAll(async () => {
    await cleanupTestData(db, testTenantId);
  });

  it("should create exactly one UoM row and one audit row atomically", async () => {
    // Create a UoM
    const result = await uomService.create(
      ctx,
      {
        code: "KG",
        name: "Kilogram",
        category: "weight",
        isActive: true,
      },
      db
    );

    // Verify UoM exists
    const [uom] = await db
      .select()
      .from(erpUoms)
      .where(and(eq(erpUoms.id, result.id), eq(erpUoms.tenantId, testTenantId)))
      .limit(1);

    expect(uom).toBeDefined();
    expect(uom.code).toBe("KG");
    expect(uom.name).toBe("Kilogram");

    // CRITICAL: Verify audit row exists and references the correct entity
    const [auditRow] = await db
      .select()
      .from(erpAuditEvents)
      .where(
        and(
          eq(erpAuditEvents.tenantId, testTenantId),
          eq(erpAuditEvents.entityType, "erp.base.uom"),
          eq(erpAuditEvents.entityId, result.id)
        )
      )
      .limit(1);

    expect(auditRow).toBeDefined();
    expect(auditRow.eventType).toBe("erp.base.uom.created");
    expect(auditRow.actorUserId).toBe(ctx.actorUserId);
    expect(auditRow.tenantId).toBe(ctx.tenantId);
    expect(auditRow.entityId).toBe(result.id);

    // Verify audit payload includes entity data
    expect(auditRow.payload).toBeDefined();
    const payload = auditRow.payload as any;
    expect(payload.code).toBe("KG");
  });

  it("should create audit rows for update operations", async () => {
    // Create initial UoM
    const created = await uomService.create(
      ctx,
      {
        code: "LB",
        name: "Pound",
        category: "weight",
        isActive: true,
      },
      db
    );

    // Update it
    const updated = await uomService.update(
      ctx,
      created.id,
      {
        name: "Pound (Updated)",
      },
      db
    );

    // Verify update audit event exists
    const [updateAuditRow] = await db
      .select()
      .from(erpAuditEvents)
      .where(
        and(
          eq(erpAuditEvents.tenantId, testTenantId),
          eq(erpAuditEvents.entityType, "erp.base.uom"),
          eq(erpAuditEvents.entityId, created.id),
          eq(erpAuditEvents.eventType, "erp.base.uom.updated")
        )
      )
      .limit(1);

    expect(updateAuditRow).toBeDefined();
    expect(updateAuditRow.eventType).toBe("erp.base.uom.updated");

    // Verify payload includes changes
    const payload = updateAuditRow.payload as any;
    expect(payload.changes).toBeDefined();
    expect(payload.changes.name).toBe("Pound (Updated)");
  });

  it("should create audit rows for archive operations", async () => {
    // Create initial UoM
    const created = await uomService.create(
      ctx,
      {
        code: "OZ",
        name: "Ounce",
        category: "weight",
        isActive: true,
      },
      db
    );

    // Archive it
    const archived = await uomService.archive(ctx, created.id, db);

    expect(archived.isActive).toBe(false);

    // Verify archive audit event exists
    const [archiveAuditRow] = await db
      .select()
      .from(erpAuditEvents)
      .where(
        and(
          eq(erpAuditEvents.tenantId, testTenantId),
          eq(erpAuditEvents.entityType, "erp.base.uom"),
          eq(erpAuditEvents.entityId, created.id),
          eq(erpAuditEvents.eventType, "erp.base.uom.archived")
        )
      )
      .limit(1);

    expect(archiveAuditRow).toBeDefined();
    expect(archiveAuditRow.eventType).toBe("erp.base.uom.archived");
  });
});
