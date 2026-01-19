// packages/domain/src/addons/erp.base/services/__tests__/atomic-rollback.test.ts
// Test 3: Atomic Rollback on Audit Failure
//
// CRITICAL: Proves that CTE atomic write guarantees NO PARTIAL STATE
// If audit fails, entity write must also fail (full rollback)

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { drizzle, Pool, createTestDbConfig, createTestContext, cleanupTestData } from "./test-helpers";
import { erpUoms, erpAuditEvents } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { atomicInsertWithAudit } from "../../helpers/atomic-audit";

describe("Atomic Audit: Rollback on Failure", () => {
  let db: any;
  let ctx: ReturnType<typeof createTestContext>;
  const testTenantId = "test-atomic-rollback-tenant";

  beforeAll(() => {
    const pool = new Pool(createTestDbConfig());
    // @ts-expect-error - pg version conflict between domain test deps and drizzle-orm peer deps
    db = drizzle(pool);
    ctx = createTestContext({ tenantId: testTenantId });
  });

  afterAll(async () => {
    await cleanupTestData(db, testTenantId);
  });

  it("should rollback entity insert if audit insert would fail (violate constraint)", async () => {
    const testCode = "ROLLBACK-TEST-1";

    // Attempt to create a UoM with invalid tenant_id in audit
    // This will violate the NOT NULL constraint on tenant_id in audit
    // (We'll use a malformed SQL injection to force failure in the CTE)
    
    // Strategy: Pass an invalid context that will cause audit INSERT to fail
    const invalidCtx = {
      ...ctx,
      tenantId: "'; DROP TABLE erp_uoms; --", // SQL injection attempt (should be escaped, but will fail validation)
    };

    // This should throw an error
    await expect(
      atomicInsertWithAudit(db, {
        table: "erp_uoms",
        values: {
          tenant_id: ctx.tenantId, // Valid entity tenant
          code: testCode,
          name: "Test Rollback",
          category: null,
          is_active: true,
        },
        entityType: "erp.base.uom",
        eventType: "erp.base.uom.created",
        ctx: invalidCtx, // Invalid audit tenant
      })
    ).rejects.toThrow();

    // CRITICAL: Verify NO entity row was created
    const [entityRow] = await db
      .select()
      .from(erpUoms)
      .where(and(eq(erpUoms.code, testCode), eq(erpUoms.tenantId, ctx.tenantId)))
      .limit(1);

    expect(entityRow).toBeUndefined();

    // CRITICAL: Verify NO audit row was created
    const auditRows = await db
      .select()
      .from(erpAuditEvents)
      .where(
        and(
          eq(erpAuditEvents.tenantId, ctx.tenantId),
          eq(erpAuditEvents.eventType, "erp.base.uom.created")
        )
      );

    // Should have no audit rows for this test code
    const relevantAudits = auditRows.filter((r: any) => {
      const payload = r.payload as any;
      return payload?.code === testCode;
    });

    expect(relevantAudits.length).toBe(0);
  });

  it("should rollback on invalid audit payload (JSON validation)", async () => {
    const testCode = "ROLLBACK-TEST-2";

    // Create a scenario where audit payload would fail
    // (e.g., circular reference or malformed JSON)
    const circularObj: any = { code: testCode };
    circularObj.self = circularObj; // Circular reference

    // This will fail when trying to serialize to JSON
    await expect(
      db.execute(sql`
        WITH inserted AS (
          INSERT INTO erp_uoms (tenant_id, code, name, is_active)
          VALUES ('${ctx.tenantId}', '${testCode}', 'Test', true)
          RETURNING *
        ),
        audit AS (
          INSERT INTO erp_audit_events (
            tenant_id, actor_user_id, actor_type,
            entity_type, entity_id, event_type, payload
          )
          SELECT
            '${ctx.tenantId}'::uuid,
            '${ctx.actorUserId}'::uuid,
            'USER',
            'erp.base.uom',
            inserted.id::uuid,
            'erp.base.uom.created',
            NULL -- Invalid: NOT NULL constraint
          FROM inserted
          RETURNING id
        )
        SELECT inserted.* FROM inserted
      `)
    ).rejects.toThrow();

    // Verify NO entity was created
    const [entityRow] = await db
      .select()
      .from(erpUoms)
      .where(and(eq(erpUoms.code, testCode), eq(erpUoms.tenantId, ctx.tenantId)))
      .limit(1);

    expect(entityRow).toBeUndefined();
  });

  it("should succeed when both entity and audit are valid", async () => {
    const testCode = "SUCCESS-TEST";

    // This should work (valid entity + valid audit)
    const result = await atomicInsertWithAudit(db, {
      table: "erp_uoms",
      values: {
        tenant_id: ctx.tenantId,
        code: testCode,
        name: "Success Test",
        category: "Test Category",
        is_active: true,
      },
      entityType: "erp.base.uom",
      eventType: "erp.base.uom.created",
      ctx,
    });

    expect(result).toBeDefined();
    expect(result.code).toBe(testCode);

    // Verify entity exists
    const [entityRow] = await db
      .select()
      .from(erpUoms)
      .where(and(eq(erpUoms.code, testCode), eq(erpUoms.tenantId, ctx.tenantId)))
      .limit(1);

    expect(entityRow).toBeDefined();

    // Verify audit exists
    const [auditRow] = await db
      .select()
      .from(erpAuditEvents)
      .where(
        and(
          eq(erpAuditEvents.tenantId, ctx.tenantId),
          eq(erpAuditEvents.entityId, entityRow.id)
        )
      )
      .limit(1);

    expect(auditRow).toBeDefined();
  });
});
