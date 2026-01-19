// packages/domain/src/addons/sales/invoices/__tests__/invoice-service.test.ts
// Sales Invoice Service Tests
//
// Test coverage:
// - Order conversion (copies lines, totals match)
// - Conversion rejects invalid order status
// - Issue requires ≥1 line
// - DRAFT-only mutation enforced
// - Tenant isolation enforced
// - Audit atomicity

import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { SalesInvoiceServiceImpl } from "../services/invoice-service";
import { SalesOrderServiceImpl } from "../../orders/services/order-service";
import { SequenceServiceImpl } from "../../../erp.base/services/sequence-service";
import type { ServiceContext } from "../../../erp.base/types";
import type { Database } from "@workspace/db";
import { salesInvoices, salesInvoiceLines, salesOrders, salesOrderLines, erpAuditEvents } from "@workspace/db";
import { eq, and, sql as sqlTag } from "drizzle-orm";

const TEST_DB_URL = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/test";

describe("SalesInvoiceService", () => {
  let client: ReturnType<typeof postgres>;
  let db: Database;
  let sequenceService: SequenceServiceImpl;
  let invoiceService: SalesInvoiceServiceImpl;
  let orderService: SalesOrderServiceImpl;

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
    invoiceService = new SalesInvoiceServiceImpl(sequenceService);
    orderService = new SalesOrderServiceImpl(sequenceService);
  });

  afterAll(async () => {
    await client.end();
  });

  beforeEach(async () => {
    // Clean up test data
    await db.delete(salesInvoiceLines).where(sqlTag`1=1`);
    await db.delete(salesInvoices).where(sqlTag`1=1`);
    await db.delete(salesOrderLines).where(sqlTag`1=1`);
    await db.delete(salesOrders).where(sqlTag`1=1`);
    await db.delete(erpAuditEvents).where(sqlTag`1=1`);
  });

  describe("Order Conversion", () => {
    it("should convert CONFIRMED order to invoice with all lines copied", async () => {
      // Create and populate order
      const order = await orderService.create(
        ctx,
        { partnerId, currency: "USD" },
        db
      );

      await orderService.upsertLine(ctx, order.id, {
        description: "Product A",
        uomId,
        qty: "10.5",
        unitPrice: "100.00",
      }, db);

      await orderService.upsertLine(ctx, order.id, {
        description: "Product B",
        uomId,
        qty: "5.0",
        unitPrice: "50.00",
      }, db);

      // Confirm order
      const confirmedOrder = await orderService.confirm(ctx, order.id, db);

      // Convert to invoice
      const invoice = await invoiceService.createFromOrder(ctx, confirmedOrder.id, db);

      // Verify invoice created
      expect(invoice.status).toBe("DRAFT");
      expect(invoice.partnerId).toBe(partnerId);
      expect(invoice.currency).toBe("USD");
      expect(invoice.sourceOrderId).toBe(confirmedOrder.id);
      expect(invoice.total).toBe(confirmedOrder.total); // Total matches

      // Verify lines copied
      expect(invoice.lines).toHaveLength(2);
      expect(invoice.lines[0].lineNo).toBe(1);
      expect(invoice.lines[0].description).toBe("Product A");
      expect(invoice.lines[0].qty).toBe("10.500000");
      expect(invoice.lines[0].unitPrice).toBe("100.00");

      expect(invoice.lines[1].lineNo).toBe(2);
      expect(invoice.lines[1].description).toBe("Product B");
      expect(invoice.lines[1].qty).toBe("5.000000");
      expect(invoice.lines[1].unitPrice).toBe("50.00");
    });

    it("should reject conversion if order not in CONFIRMED status", async () => {
      // Create order in DRAFT
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

      // Try to convert DRAFT order (should fail)
      await expect(
        invoiceService.createFromOrder(ctx, order.id, db)
      ).rejects.toThrow(/CONFIRMED/);
    });

    it("should emit audit event for conversion", async () => {
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

      const confirmedOrder = await orderService.confirm(ctx, order.id, db);

      // Convert to invoice
      const invoice = await invoiceService.createFromOrder(ctx, confirmedOrder.id, db);

      // Verify audit event
      const auditEvents = await db
        .select()
        .from(erpAuditEvents)
        .where(
          and(
            eq(erpAuditEvents.entityId, sqlTag`${invoice.id}::uuid`),
            eq(erpAuditEvents.eventType, "erp.sales.invoice.created_from_order")
          )
        );

      expect(auditEvents).toHaveLength(1);
      expect(auditEvents[0].payload).toHaveProperty("orderId", confirmedOrder.id);
      expect(auditEvents[0].payload).toHaveProperty("copiedLines", 1);
    });
  });

  describe("Issue Guard", () => {
    it("should issue invoice with ≥1 line", async () => {
      // Create invoice with line
      const invoice = await invoiceService.create(
        ctx,
        { partnerId, currency: "USD" },
        db
      );

      await invoiceService.upsertLine(ctx, invoice.id, {
        description: "Product A",
        uomId,
        qty: "10.0",
        unitPrice: "100.00",
      }, db);

      // Issue
      const issued = await invoiceService.issue(ctx, invoice.id, db);

      expect(issued.status).toBe("ISSUED");
      expect(issued.issuedAt).toBeTruthy();
    });

    it("should reject issue if invoice has no lines", async () => {
      // Create empty invoice
      const invoice = await invoiceService.create(
        ctx,
        { partnerId, currency: "USD" },
        db
      );

      // Try to issue (should fail - no lines)
      await expect(
        invoiceService.issue(ctx, invoice.id, db)
      ).rejects.toThrow(/no lines/);
    });

    it("should reject issue if invoice not in DRAFT", async () => {
      // Create and issue invoice
      const invoice = await invoiceService.create(
        ctx,
        { partnerId, currency: "USD" },
        db
      );

      await invoiceService.upsertLine(ctx, invoice.id, {
        description: "Product A",
        uomId,
        qty: "10.0",
        unitPrice: "100.00",
      }, db);

      await invoiceService.issue(ctx, invoice.id, db);

      // Try to issue again (should fail - already ISSUED)
      await expect(
        invoiceService.issue(ctx, invoice.id, db)
      ).rejects.toThrow();
    });
  });

  describe("DRAFT-only Mutation", () => {
    it("should reject update if invoice not in DRAFT", async () => {
      // Create and issue invoice
      const invoice = await invoiceService.create(
        ctx,
        { partnerId, currency: "USD" },
        db
      );

      await invoiceService.upsertLine(ctx, invoice.id, {
        description: "Product A",
        uomId,
        qty: "10.0",
        unitPrice: "100.00",
      }, db);

      const issued = await invoiceService.issue(ctx, invoice.id, db);

      // Try to update ISSUED invoice (should fail)
      await expect(
        invoiceService.update(ctx, issued.id, { notes: "New notes" }, db)
      ).rejects.toThrow(/DRAFT/);
    });

    it("should reject line upsert if invoice not in DRAFT", async () => {
      // Create and issue invoice
      const invoice = await invoiceService.create(
        ctx,
        { partnerId, currency: "USD" },
        db
      );

      await invoiceService.upsertLine(ctx, invoice.id, {
        description: "Product A",
        uomId,
        qty: "10.0",
        unitPrice: "100.00",
      }, db);

      const issued = await invoiceService.issue(ctx, invoice.id, db);

      // Try to upsert line on ISSUED invoice (should fail)
      await expect(
        invoiceService.upsertLine(ctx, issued.id, {
          description: "Product B",
          uomId,
          qty: "5.0",
          unitPrice: "50.00",
        }, db)
      ).rejects.toThrow();
    });
  });

  describe("Total Calculation", () => {
    it("should recalculate totals when lines added", async () => {
      const invoice = await invoiceService.create(
        ctx,
        { partnerId, currency: "USD" },
        db
      );

      // Initial total: 0
      expect(invoice.total).toBe("0.00");
      expect(invoice.subtotal).toBe("0.00");

      // Add line 1: 10 * $100 = $1000
      const updated1 = await invoiceService.upsertLine(ctx, invoice.id, {
        description: "Product A",
        uomId,
        qty: "10.0",
        unitPrice: "100.00",
      }, db);

      expect(updated1.total).toBe("1000.00");
      expect(updated1.subtotal).toBe("1000.00");

      // Add line 2: 5 * $50 = $250, total = $1250
      const updated2 = await invoiceService.upsertLine(ctx, invoice.id, {
        description: "Product B",
        uomId,
        qty: "5.0",
        unitPrice: "50.00",
      }, db);

      expect(updated2.total).toBe("1250.00");
      expect(updated2.subtotal).toBe("1250.00");
    });

    it("should recalculate totals when line removed", async () => {
      const invoice = await invoiceService.create(
        ctx,
        { partnerId, currency: "USD" },
        db
      );

      await invoiceService.upsertLine(ctx, invoice.id, {
        description: "Product A",
        uomId,
        qty: "10.0",
        unitPrice: "100.00",
      }, db);

      await invoiceService.upsertLine(ctx, invoice.id, {
        description: "Product B",
        uomId,
        qty: "5.0",
        unitPrice: "50.00",
      }, db);

      const beforeRemove = await invoiceService.get(ctx, invoice.id, db);
      expect(beforeRemove.total).toBe("1250.00");

      // Remove line 1
      const afterRemove = await invoiceService.removeLine(ctx, invoice.id, 1, db);
      expect(afterRemove.total).toBe("250.00");
      expect(afterRemove.subtotal).toBe("250.00");
    });
  });

  describe("Tenant Isolation", () => {
    it("should not allow cross-tenant invoice access", async () => {
      const tenant1 = "00000000-0000-0000-0000-000000000001";
      const tenant2 = "00000000-0000-0000-0000-000000000002";

      // Create invoice in tenant1
      const invoice = await invoiceService.create(
        { ...ctx, tenantId: tenant1 },
        { partnerId, currency: "USD" },
        db
      );

      // Try to access from tenant2 (should fail)
      await expect(
        invoiceService.get({ ...ctx, tenantId: tenant2 }, invoice.id, db)
      ).rejects.toThrow(/not found/);
    });
  });

  describe("Audit Atomicity", () => {
    it("should ensure invoice creation has audit event", async () => {
      const invoice = await invoiceService.create(
        ctx,
        { partnerId, currency: "USD" },
        db
      );

      const auditEvents = await db
        .select()
        .from(erpAuditEvents)
        .where(
          and(
            eq(erpAuditEvents.entityId, sqlTag`${invoice.id}::uuid`),
            eq(erpAuditEvents.eventType, "erp.sales.invoice.created")
          )
        );

      expect(auditEvents).toHaveLength(1);
      expect(auditEvents[0].tenantId).toBe(tenantId);
      expect(auditEvents[0].actorUserId).toBe(actorId);
    });

    it("should ensure line operations emit audit events", async () => {
      const invoice = await invoiceService.create(
        ctx,
        { partnerId, currency: "USD" },
        db
      );

      // Upsert line
      await invoiceService.upsertLine(ctx, invoice.id, {
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
            eq(erpAuditEvents.entityId, sqlTag`${invoice.id}::uuid`),
            eq(erpAuditEvents.eventType, "erp.sales.invoice.line.upserted")
          )
        );

      expect(upsertEvents).toHaveLength(1);

      // Remove line
      await invoiceService.removeLine(ctx, invoice.id, 1, db);

      const removeEvents = await db
        .select()
        .from(erpAuditEvents)
        .where(
          and(
            eq(erpAuditEvents.entityId, sqlTag`${invoice.id}::uuid`),
            eq(erpAuditEvents.eventType, "erp.sales.invoice.line.removed")
          )
        );

      expect(removeEvents).toHaveLength(1);
    });
  });
});
