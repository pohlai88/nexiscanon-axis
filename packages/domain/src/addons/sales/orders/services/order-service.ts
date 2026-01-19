// packages/domain/src/addons/sales/orders/services/order-service.ts
// Sales Order Service - Order lifecycle management
//
// CRITICAL: Uses atomic multi-table CTE helpers for line operations
// Prevents "line changed but order total stale" or "audit missing" failures

import { eq, and, like, asc, or, inArray, gt, sql } from "drizzle-orm";
import type { Database } from "@workspace/db";
import { salesOrders, salesOrderLines } from "@workspace/db";
import type {
  OrderCreateInput,
  OrderUpdateInput,
  OrderLineUpsertInput,
  OrderOutput,
  OrderListOutput,
  OrderListQuery,
} from "@workspace/validation/erp/sales/order";
import type { ServiceContext } from "../../../erp.base/types";
import { ERP_ERROR_CODES, ErpDomainError as DomainError } from "../../../erp.base/types";
import {
  atomicInsertWithAudit,
  atomicUpdateWithAudit,
} from "../../../erp.base/helpers/atomic-audit";
import {
  atomicUpsertOrderLineAndRecalcWithAudit,
  atomicRemoveOrderLineAndRecalcWithAudit,
  atomicConfirmOrderWithAudit,
  atomicCancelOrderWithAudit,
  atomicConvertQuoteToOrderWithAudit,
} from "../helpers/atomic-sales-order";
import type { SequenceService } from "../../../erp.base/services/sequence-service";

// ---- Service Interface ----

export interface SalesOrderService {
  create(ctx: ServiceContext, input: OrderCreateInput, db: Database): Promise<OrderOutput>;
  update(
    ctx: ServiceContext,
    id: string,
    input: OrderUpdateInput,
    db: Database
  ): Promise<OrderOutput>;
  get(ctx: ServiceContext, id: string, db: Database): Promise<OrderOutput>;
  list(ctx: ServiceContext, query: OrderListQuery, db: Database): Promise<OrderListOutput>;
  
  // Line Management (DRAFT only)
  upsertLine(
    ctx: ServiceContext,
    orderId: string,
    input: OrderLineUpsertInput,
    db: Database
  ): Promise<OrderOutput>;
  removeLine(
    ctx: ServiceContext,
    orderId: string,
    lineNo: number,
    db: Database
  ): Promise<OrderOutput>;

  // Workflow Transitions
  confirm(ctx: ServiceContext, id: string, db: Database): Promise<OrderOutput>;
  cancel(ctx: ServiceContext, id: string, db: Database): Promise<OrderOutput>;

  // Quote Conversion
  convertQuoteToOrder(
    ctx: ServiceContext,
    quoteId: string,
    db: Database
  ): Promise<OrderOutput>;
}

// ---- Implementation ----

export class SalesOrderServiceImpl implements SalesOrderService {
  constructor(private sequenceService: SequenceService) {}

  // ---- CREATE ----

  async create(
    ctx: ServiceContext,
    input: OrderCreateInput,
    db: Database
  ): Promise<OrderOutput> {
    try {
      // Generate order number from sequence
      const seqResult = await this.sequenceService.next(ctx, "sales.order", db);
      const orderNo = seqResult.value;

      // Atomic insert + audit in single SQL
      const row = await atomicInsertWithAudit(db, {
        table: "sales_orders",
        values: {
          tenant_id: ctx.tenantId,
          order_no: orderNo,
          status: "DRAFT",
          partner_id: input.partnerId,
          currency: input.currency,
          source_quote_id: null,
          total_cents: 0,
          notes: input.notes ?? null,
        },
        entityType: "erp.sales.order",
        eventType: "erp.sales.order.created",
        ctx,
      });

      return this.mapToOutput(row, []);
    } catch (err: any) {
      if (err?.code === "23503") {
        throw new DomainError(
          ERP_ERROR_CODES.PARTNER_NOT_FOUND,
          "Referenced partner does not exist",
          { partnerId: input.partnerId }
        );
      }
      if (err?.code === "23505") {
        throw new DomainError(
          "ERP_ORDER_NO_TAKEN" as any,
          `Order number collision detected`,
          { orderNo: (err as any).constraint }
        );
      }
      throw err;
    }
  }

  // ---- UPDATE (DRAFT only) ----

  async update(
    ctx: ServiceContext,
    id: string,
    input: OrderUpdateInput,
    db: Database
  ): Promise<OrderOutput> {
    // Pre-check: only DRAFT orders can be updated
    const existing = await db
      .select()
      .from(salesOrders)
      .where(
        and(
          eq(salesOrders.tenantId, sql`${ctx.tenantId}::uuid`),
          eq(salesOrders.id, sql`${id}::uuid`)
        )
      )
      .limit(1);

    if (!existing.length) {
      throw new DomainError(
        "ERP_ORDER_NOT_FOUND" as any,
        "Order not found",
        { orderId: id }
      );
    }

    if (existing[0].status !== "DRAFT") {
      throw new DomainError(
        "ERP_ORDER_IMMUTABLE" as any,
        `Cannot update order in ${existing[0].status} status (only DRAFT is mutable)`,
        { orderId: id, status: existing[0].status }
      );
    }

    // Build update payload
    const updateValues: Record<string, any> = { updated_at: sql`NOW()` };
    if (input.partnerId !== undefined) updateValues.partner_id = input.partnerId;
    if (input.currency !== undefined) updateValues.currency = input.currency;
    if (input.notes !== undefined) updateValues.notes = input.notes ?? null;

    const row = await atomicUpdateWithAudit(db, {
      table: "sales_orders",
      set: updateValues,
      where: {
        tenant_id: ctx.tenantId,
        id,
        status: "DRAFT",
      },
      entityType: "erp.sales.order",
      eventType: "erp.sales.order.updated",
      ctx,
      payload: { changes: input },
    });

    if (!row) {
      throw new DomainError(
        "ERP_ORDER_NOT_FOUND" as any,
        "Order not found or no longer DRAFT",
        { orderId: id }
      );
    }

    const lines = await this.fetchLines(ctx, id, db);
    return this.mapToOutput(row, lines);
  }

  // ---- GET ----

  async get(ctx: ServiceContext, id: string, db: Database): Promise<OrderOutput> {
    const rows = await db
      .select()
      .from(salesOrders)
      .where(
        and(
          eq(salesOrders.tenantId, sql`${ctx.tenantId}::uuid`),
          eq(salesOrders.id, sql`${id}::uuid`)
        )
      )
      .limit(1);

    if (!rows.length) {
      throw new DomainError("ERP_ORDER_NOT_FOUND" as any, "Order not found", {
        orderId: id,
      });
    }

    const lines = await this.fetchLines(ctx, id, db);
    return this.mapToOutput(rows[0], lines);
  }

  // ---- LIST ----

  async list(
    ctx: ServiceContext,
    query: OrderListQuery,
    db: Database
  ): Promise<OrderListOutput> {
    const limit = query.limit;
    const tenantId = ctx.tenantId;

    const conditions: any[] = [eq(salesOrders.tenantId, sql`${tenantId}::uuid`)];

    if (query.status && query.status.length > 0) {
      conditions.push(inArray(salesOrders.status, query.status));
    }

    if (query.partnerId) {
      conditions.push(eq(salesOrders.partnerId, sql`${query.partnerId}::uuid`));
    }

    if (query.q) {
      const searchPattern = `%${query.q}%`;
      conditions.push(
        or(
          like(salesOrders.orderNo, searchPattern),
          like(salesOrders.notes, searchPattern)
        )
      );
    }

    if (query.cursor) {
      conditions.push(gt(salesOrders.id, sql`${query.cursor}::uuid`));
    }

    const rows = await db
      .select()
      .from(salesOrders)
      .where(and(...conditions))
      .orderBy(asc(salesOrders.id))
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return {
      items: items.map((row) => this.mapToListItem(row)),
      nextCursor,
    };
  }

  // ---- UPSERT LINE (DRAFT only) ----

  async upsertLine(
    ctx: ServiceContext,
    orderId: string,
    input: OrderLineUpsertInput,
    db: Database
  ): Promise<OrderOutput> {
    // Calculate line total in cents
    const qty = parseFloat(input.qty);
    const unitPriceCents = this.moneyToCents(input.unitPrice);
    const lineTotalCents = Math.round(qty * unitPriceCents);

    // Convert qty to numeric SQL literal (6 decimal places)
    const qtyNumericSql = parseFloat(input.qty).toFixed(6);

    // Use atomic helper (updates line + recalculates total + emits audit)
    const result = await atomicUpsertOrderLineAndRecalcWithAudit(db, {
      orderId,
      lineNo: input.lineNo,
      productId: input.productId ?? null,
      description: input.description,
      uomId: input.uomId,
      qtyNumericSql,
      unitPriceCents,
      lineTotalCents,
      entityType: "erp.sales.order",
      eventType: "erp.sales.order.line.upserted",
      ctx,
      payload: {
        orderId,
        lineNo: input.lineNo ?? null,
        productId: input.productId ?? null,
        unitPriceCents,
        lineTotalCents,
      },
    });

    if (!result) {
      throw new DomainError(
        "ERP_ORDER_NOT_FOUND" as any,
        "Order not found or not in DRAFT status",
        { orderId }
      );
    }

    const lines = await this.fetchLines(ctx, orderId, db);
    return this.mapToOutput(result.order, lines);
  }

  // ---- REMOVE LINE (DRAFT only) ----

  async removeLine(
    ctx: ServiceContext,
    orderId: string,
    lineNo: number,
    db: Database
  ): Promise<OrderOutput> {
    const result = await atomicRemoveOrderLineAndRecalcWithAudit(db, {
      orderId,
      lineNo,
      entityType: "erp.sales.order",
      eventType: "erp.sales.order.line.removed",
      ctx,
      payload: { orderId, lineNo },
    });

    if (!result) {
      throw new DomainError(
        "ERP_ORDER_NOT_FOUND" as any,
        "Order not found or not in DRAFT status",
        { orderId }
      );
    }

    const lines = await this.fetchLines(ctx, orderId, db);
    return this.mapToOutput(result, lines);
  }

  // ---- CONFIRM ----

  async confirm(ctx: ServiceContext, id: string, db: Database): Promise<OrderOutput> {
    const result = await atomicConfirmOrderWithAudit(db, {
      orderId: id,
      entityType: "erp.sales.order",
      eventType: "erp.sales.order.confirmed",
      ctx,
    });

    if (!result) {
      throw new DomainError(
        "ERP_ORDER_TRANSITION_FAILED" as any,
        "Cannot confirm order: either not in DRAFT status or has no lines",
        { orderId: id }
      );
    }

    const lines = await this.fetchLines(ctx, id, db);
    return this.mapToOutput(result, lines);
  }

  // ---- CANCEL ----

  async cancel(ctx: ServiceContext, id: string, db: Database): Promise<OrderOutput> {
    const result = await atomicCancelOrderWithAudit(db, {
      orderId: id,
      entityType: "erp.sales.order",
      eventType: "erp.sales.order.cancelled",
      ctx,
    });

    if (!result) {
      throw new DomainError(
        "ERP_ORDER_TRANSITION_FAILED" as any,
        "Cannot cancel order: must be in DRAFT or CONFIRMED status",
        { orderId: id }
      );
    }

    const lines = await this.fetchLines(ctx, id, db);
    return this.mapToOutput(result, lines);
  }

  // ---- CONVERT QUOTE TO ORDER ----

  async convertQuoteToOrder(
    ctx: ServiceContext,
    quoteId: string,
    db: Database
  ): Promise<OrderOutput> {
    // Generate order number from sequence
    const seqResult = await this.sequenceService.next(ctx, "sales.order", db);
    const orderNo = seqResult.value;

    // Use atomic conversion helper (inserts order + copies lines + emits audit)
    const result = await atomicConvertQuoteToOrderWithAudit(db, {
      quoteId,
      orderNo,
      allowedQuoteStatus: "ACCEPTED", // Only convert ACCEPTED quotes
      entityType: "erp.sales.order",
      eventType: "erp.sales.order.created_from_quote",
      ctx,
    });

    if (!result) {
      throw new DomainError(
        "ERP_QUOTE_CONVERSION_FAILED" as any,
        "Cannot convert quote: either not found, not in ACCEPTED status, or has no lines",
        { quoteId }
      );
    }

    const lines = await this.fetchLines(ctx, result.id, db);
    return this.mapToOutput(result, lines);
  }

  // ---- HELPERS ----

  private async fetchLines(
    ctx: ServiceContext,
    orderId: string,
    db: Database
  ): Promise<any[]> {
    return await db
      .select()
      .from(salesOrderLines)
      .where(
        and(
          eq(salesOrderLines.tenantId, sql`${ctx.tenantId}::uuid`),
          eq(salesOrderLines.orderId, sql`${orderId}::uuid`)
        )
      )
      .orderBy(asc(salesOrderLines.lineNo));
  }

  private mapToOutput(order: any, lines: any[]): OrderOutput {
    return {
      id: order.id,
      orderNo: order.order_no,
      status: order.status,
      partnerId: order.partner_id,
      currency: order.currency,
      sourceQuoteId: order.source_quote_id,
      total: this.centsToMoney(order.total_cents),
      notes: order.notes,
      confirmedAt: order.confirmed_at?.toISOString() ?? null,
      cancelledAt: order.cancelled_at?.toISOString() ?? null,
      createdAt: order.created_at.toISOString(),
      updatedAt: order.updated_at.toISOString(),
      lines: lines.map((line) => ({
        id: line.id,
        lineNo: line.line_no,
        productId: line.product_id,
        description: line.description,
        uomId: line.uom_id,
        qty: line.qty,
        unitPrice: this.centsToMoney(line.unit_price_cents),
        lineTotal: this.centsToMoney(line.line_total_cents),
        createdAt: line.created_at.toISOString(),
        updatedAt: line.updated_at.toISOString(),
      })),
    };
  }

  private mapToListItem(order: any): any {
    return {
      id: order.id,
      orderNo: order.order_no,
      status: order.status,
      partnerId: order.partner_id,
      currency: order.currency,
      sourceQuoteId: order.source_quote_id,
      total: this.centsToMoney(order.total_cents),
      notes: order.notes,
      confirmedAt: order.confirmed_at?.toISOString() ?? null,
      cancelledAt: order.cancelled_at?.toISOString() ?? null,
      createdAt: order.created_at.toISOString(),
      updatedAt: order.updated_at.toISOString(),
    };
  }

  private moneyToCents(money: string): number {
    return Math.round(parseFloat(money) * 100);
  }

  private centsToMoney(cents: number): string {
    return (cents / 100).toFixed(2);
  }
}

// ---- Token ----

export const SALES_ORDER_SERVICE = "SalesOrderService";
