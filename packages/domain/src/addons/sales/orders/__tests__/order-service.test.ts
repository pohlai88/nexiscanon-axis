// packages/domain/src/addons/sales/orders/__tests__/order-service.test.ts
// Sales Order Service Tests
//
// Test coverage:
// - Quote conversion (copies lines, totals match)
// - Conversion rejects invalid quote status
// - Confirm requires ≥1 line
// - DRAFT-only mutation enforced
// - Tenant isolation enforced
// - Audit atomicity

import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { SalesOrderServiceImpl } from "../services/order-service";
import { SalesQuoteServiceImpl } from "../../services/quote-service";
import { SequenceServiceImpl } from "../../../erp.base/services/sequence-service";
import type { ServiceContext } from "../../../erp.base/types";
import type { Database } from "@workspace/db";
import { salesOrders, salesOrderLines, salesQuotes, salesQuoteLines, erpAuditEvents } from "@workspace/db";
import { eq, and, sql as sqlTag } from "drizzle-orm";

const TEST_DB_URL = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/test";

describe("SalesOrderService", () => {
  let client: ReturnType<typeof postgres>;
  let db: Database;
  let sequenceService: SequenceServiceImpl;
  let orderService: SalesOrderServiceImpl;
  let quoteService: SalesQuoteServiceImpl;

  const tenantId = "00000000-0000-0000-0000-000000000001";
  const actorId = "00000000-0000-0000-0000-000000000002";
  const partnerId = "00000000-0000-0000-0000-000000000003";
  const productId = "00000000-0000-0000-0000-000000000004";
  const uomId = "00000000-0000-0000-0000-000000000005";

  const ctx: ServiceContext = {
    tenantId,
    actorUserId: actorId,
    traceId: "test-trace-001",
  };

  beforeAll(() => {
    client = postgres(TEST_DB_URL, { max: 1 });
    db = drizzle(client) as Database;
    sequenceService = new SequenceServiceImpl();
    orderService = new SalesOrderServiceImpl(sequenceService);
    quoteService = new SalesQuoteServiceImpl(sequenceService);
  });

  afterAll(async () => {
    await client.end();
  });

  beforeEach(async () => {
    // Clean up test data
    await db.delete(salesOrderLines).where(sqlTag`1=1`);
    await db.delete(salesOrders).where(sqlTag`1=1`);
    await db.delete(salesQuoteLines).where(sqlTag`1=1`);
    await db.delete(salesQuotes).where(sqlTag`1=1`);
    await db.delete(erpAuditEvents).where(sqlTag`1=1`);
  });

  describe("Quote Conversion", () => {
    it("should convert ACCEPTED quote to order with all lines copied", async () => {
      // Create and populate quote
      const quote = await quoteService.create(
        ctx,
        { partnerId, currency: "USD" },
        db
      );

      await quoteService.upsertLine(ctx, quote.id, {
        description: "Product A",
        uomId,
        qty: "10.5",
        unitPrice: "100.00",
      }, db);

      await quoteService.upsertLine(ctx, quote.id, {
        description: "Product B",
        uomId,
        qty: "5.0",
        unitPrice: "50.00",
      }, db);

      // Send and accept quote
      await quoteService.send(ctx, quote.id, db);
      const acceptedQuote = await quoteService.accept(ctx, quote.id, db);

      // Convert to order
      const order = await orderService.convertQuoteToOrder(ctx, acceptedQuote.id, db);

      // Verify order created
      expect(order.status).toBe("DRAFT");
      expect(order.partnerId).toBe(partnerId);
      expect(order.currency).toBe("USD");
      expect(order.sourceQuoteId).toBe(acceptedQuote.id);
      expect(order.total).toBe(acceptedQuote.total); // Total matches

      // Verify lines copied
      expect(order.lines).toHaveLength(2);
      expect(order.lines[0].lineNo).toBe(1);
      expect(order.lines[0].description).toBe("Product A");
      expect(order.lines[0].qty).toBe("10.500000");
      expect(order.lines[0].unitPrice).toBe("100.00");

      expect(order.lines[1].lineNo).toBe(2);
      expect(order.lines[1].description).toBe("Product B");
      expect(order.lines[1].qty).toBe("5.000000");
      expect(order.lines[1].unitPrice).toBe("50.00");
    });

    it("should reject conversion if quote not in ACCEPTED status", async () => {
      // Create quote in DRAFT
      const quote = await quoteService.create(
        ctx,
        { partnerId, currency: "USD" },
        db
      );

      await quoteService.upsertLine(ctx, quote.id, {
        description: "Product A",
        uomId,
        qty: "10.0",
        unitPrice: "100.00",
      }, db);

      // Try to convert DRAFT quote (should fail)
      await expect(
        orderService.convertQuoteToOrder(ctx, quote.id, db)
      ).rejects.toThrow(/ACCEPTED/);
    });

    it("should reject conversion if quote has no lines", async () => {
      // Create empty quote
      const quote = await quoteService.create(
        ctx,
        { partnerId, currency: "USD" },
        db
      );

      // Send and accept (but has no lines)
      await quoteService.send(ctx, quote.id, db);
      await quoteService.accept(ctx, quote.id, db);

      // Try to convert empty quote (should fail)
      await expect(
        orderService.convertQuoteToOrder(ctx, quote.id, db)
      ).rejects.toThrow();
    });

    it("should emit audit event for conversion", async () => {
      // Create and populate quote
      const quote = await quoteService.create(
        ctx,
        { partnerId, currency: "USD" },
        db
      );

      await quoteService.upsertLine(ctx, quote.id, {
        description: "Product A",
        uomId,
        qty: "10.0",
        unitPrice: "100.00",
      }, db);

      await quoteService.send(ctx, quote.id, db);
      const acceptedQuote = await quoteService.accept(ctx, quote.id, db);

      // Convert to order
      const order = await orderService.convertQuoteToOrder(ctx, acceptedQuote.id, db);

      // Verify audit event
      const auditEvents = await db
        .select()
        .from(erpAuditEvents)
        .where(
          and(
            eq(erpAuditEvents.entityId, sqlTag`${order.id}::uuid`),
            eq(erpAuditEvents.eventType, "erp.sales.order.created_from_quote")
          )
        );

      expect(auditEvents).toHaveLength(1);
      expect(auditEvents[0].payload).toHaveProperty("quoteId", acceptedQuote.id);
      expect(auditEvents[0].payload).toHaveProperty("copiedLines", 1);
    });
  });

  describe("Confirm Guard", () => {
    it("should confirm order with ≥1 line", async () => {
      // Create order with line
      const order = await orderService.create(
        ctx,
        { partnerId, currency: "USD" },
        db
      );

      await orderService.upsertLine(ctx, order.id, {
        description: "Product A",
        uomId,
        qty: "10.0",
        unitPrice: "100.00",
      }, db);

      // Confirm
      const confirmed = await orderService.confirm(ctx, order.id, db);

      expect(confirmed.status).toBe("CONFIRMED");
      expect(confirmed.confirmedAt).toBeTruthy();
    });

    it("should reject confirm if order has no lines", async () => {
      // Create empty order
      const order = await orderService.create(
        ctx,
        { partnerId, currency: "USD" },
        db
      );

      // Try to confirm (should fail - no lines)
      await expect(
        orderService.confirm(ctx, order.id, db)
      ).rejects.toThrow(/no lines/);
    });

    it("should reject confirm if order not in DRAFT", async () => {
      // Create and confirm order
      const order = await orderService.create(
        ctx,
        { partnerId, currency: "USD" },
        db
      );

      await orderService.upsertLine(ctx, order.id, {
        description: "Product A",
        uomId,
        qty: "10.0",
        unitPrice: "100.00",
      }, db);

      await orderService.confirm(ctx, order.id, db);

      // Try to confirm again (should fail - already CONFIRMED)
      await expect(
        orderService.confirm(ctx, order.id, db)
      ).rejects.toThrow();
    });
  });

  describe("DRAFT-only Mutation", () => {
    it("should reject update if order not in DRAFT", async () => {
      // Create and confirm order
      const order = await orderService.create(
        ctx,
        { partnerId, currency: "USD" },
        db
      );

      await orderService.upsertLine(ctx, order.id, {
        description: "Product A",
        uomId,
        qty: "10.0",
        unitPrice: "100.00",
      }, db);

      const confirmed = await orderService.confirm(ctx, order.id, db);

      // Try to update CONFIRMED order (should fail)
      await expect(
        orderService.update(ctx, confirmed.id, { notes: "New notes" }, db)
      ).rejects.toThrow(/DRAFT/);
    });

    it("should reject line upsert if order not in DRAFT", async () => {
      // Create and confirm order
      const order = await orderService.create(
        ctx,
        { partnerId, currency: "USD" },
        db
      );

      await orderService.upsertLine(ctx, order.id, {
        description: "Product A",
        uomId,
        qty: "10.0",
        unitPrice: "100.00",
      }, db);

      const confirmed = await orderService.confirm(ctx, order.id, db);

      // Try to upsert line on CONFIRMED order (should fail)
      await expect(
        orderService.upsertLine(ctx, confirmed.id, {
          description: "Product B",
          uomId,
          qty: "5.0",
          unitPrice: "50.00",
        }, db)
      ).rejects.toThrow();
    });

    it("should reject line removal if order not in DRAFT", async () => {
      // Create and confirm order
      const order = await orderService.create(
        ctx,
        { partnerId, currency: "USD" },
        db
      );

      await orderService.upsertLine(ctx, order.id, {
        description: "Product A",
        uomId,
        qty: "10.0",
        unitPrice: "100.00",
      }, db);

      const confirmed = await orderService.confirm(ctx, order.id, db);

      // Try to remove line from CONFIRMED order (should fail)
      await expect(
        orderService.removeLine(ctx, confirmed.id, 1, db)
      ).rejects.toThrow();
    });
  });

  describe("Total Calculation", () => {
    it("should recalculate total when lines added", async () => {
      const order = await orderService.create(
        ctx,
        { partnerId, currency: "USD" },
        db
      );

      // Initial total: 0
      expect(order.total).toBe("0.00");

      // Add line 1: 10 * $100 = $1000
      const updated1 = await orderService.upsertLine(ctx, order.id, {
        description: "Product A",
        uomId,
        qty: "10.0",
        unitPrice: "100.00",
      }, db);

      expect(updated1.total).toBe("1000.00");

      // Add line 2: 5 * $50 = $250, total = $1250
      const updated2 = await orderService.upsertLine(ctx, order.id, {
        description: "Product B",
        uomId,
        qty: "5.0",
        unitPrice: "50.00",
      }, db);

      expect(updated2.total).toBe("1250.00");
    });

    it("should recalculate total when line removed", async () => {
      const order = await orderService.create(
        ctx,
        { partnerId, currency: "USD" },
        db
      );

      await orderService.upsertLine(ctx, order.id, {
        description: "Product A",
        uomId,
        qty: "10.0",
        unitPrice: "100.00",
      }, db);

      await orderService.upsertLine(ctx, order.id, {
        description: "Product B",
        uomId,
        qty: "5.0",
        unitPrice: "50.00",
      }, db);

      const beforeRemove = await orderService.get(ctx, order.id, db);
      expect(beforeRemove.total).toBe("1250.00");

      // Remove line 1
      const afterRemove = await orderService.removeLine(ctx, order.id, 1, db);
      expect(afterRemove.total).toBe("250.00");
    });
  });

  describe("Tenant Isolation", () => {
    it("should not allow cross-tenant order access", async () => {
      const tenant1 = "00000000-0000-0000-0000-000000000001";
      const tenant2 = "00000000-0000-0000-0000-000000000002";

      // Create order in tenant1
      const order = await orderService.create(
        { ...ctx, tenantId: tenant1 },
        { partnerId, currency: "USD" },
        db
      );

      // Try to access from tenant2 (should fail)
      await expect(
        orderService.get({ ...ctx, tenantId: tenant2 }, order.id, db)
      ).rejects.toThrow(/not found/);
    });

    it("should not allow cross-tenant quote conversion", async () => {
      const tenant1 = "00000000-0000-0000-0000-000000000001";
      const tenant2 = "00000000-0000-0000-0000-000000000002";

      // Create quote in tenant1
      const quote = await quoteService.create(
        { ...ctx, tenantId: tenant1 },
        { partnerId, currency: "USD" },
        db
      );

      await quoteService.upsertLine({ ...ctx, tenantId: tenant1 }, quote.id, {
        description: "Product A",
        uomId,
        qty: "10.0",
        unitPrice: "100.00",
      }, db);

      await quoteService.send({ ...ctx, tenantId: tenant1 }, quote.id, db);
      await quoteService.accept({ ...ctx, tenantId: tenant1 }, quote.id, db);

      // Try to convert from tenant2 (should fail)
      await expect(
        orderService.convertQuoteToOrder({ ...ctx, tenantId: tenant2 }, quote.id, db)
      ).rejects.toThrow();
    });
  });

  describe("Audit Atomicity", () => {
    it("should ensure order creation has audit event", async () => {
      const order = await orderService.create(
        ctx,
        { partnerId, currency: "USD" },
        db
      );

      const auditEvents = await db
        .select()
        .from(erpAuditEvents)
        .where(
          and(
            eq(erpAuditEvents.entityId, sqlTag`${order.id}::uuid`),
            eq(erpAuditEvents.eventType, "erp.sales.order.created")
          )
        );

      expect(auditEvents).toHaveLength(1);
      expect(auditEvents[0].tenantId).toBe(tenantId);
      expect(auditEvents[0].actorUserId).toBe(actorId);
    });

    it("should ensure line operations emit audit events", async () => {
      const order = await orderService.create(
        ctx,
        { partnerId, currency: "USD" },
        db
      );

      // Upsert line
      await orderService.upsertLine(ctx, order.id, {
        description: "Product A",
        uomId,
        qty: "10.0",
        unitPrice: "100.00",
      }, db);

      const upsertEvents = await db
        .select()
        .from(erpAuditEvents)
        .where(
          and(
            eq(erpAuditEvents.entityId, sqlTag`${order.id}::uuid`),
            eq(erpAuditEvents.eventType, "erp.sales.order.line.upserted")
          )
        );

      expect(upsertEvents).toHaveLength(1);

      // Remove line
      await orderService.removeLine(ctx, order.id, 1, db);

      const removeEvents = await db
        .select()
        .from(erpAuditEvents)
        .where(
          and(
            eq(erpAuditEvents.entityId, sqlTag`${order.id}::uuid`),
            eq(erpAuditEvents.eventType, "erp.sales.order.line.removed")
          )
        );

      expect(removeEvents).toHaveLength(1);
    });
  });
});
