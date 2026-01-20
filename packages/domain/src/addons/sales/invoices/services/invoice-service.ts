// packages/domain/src/addons/sales/invoices/services/invoice-service.ts
// Sales Invoice Service - Invoice lifecycle management
//
// CRITICAL: Uses atomic multi-table CTE helpers for line operations
// Prevents "line changed but invoice total stale" or "audit missing" failures

import { eq, and, like, asc, or, inArray, gt, sql } from "drizzle-orm";
import type { Database } from "@workspace/db";
import { salesInvoices, salesInvoiceLines } from "@workspace/db";
import type {
  InvoiceCreateInput,
  InvoiceUpdateInput,
  InvoiceLineUpsertInput,
  InvoiceOutput,
  InvoiceListOutput,
  InvoiceListQuery,
} from "@workspace/validation/erp/sales/invoice";
import type { ServiceContext } from "../../../erp.base/types";
import { ERP_ERROR_CODES, ErpDomainError as DomainError } from "../../../erp.base/types";
import {
  atomicInsertWithAudit,
  atomicUpdateWithAudit,
} from "../../../erp.base/helpers/atomic-audit";
import {
  atomicUpsertInvoiceLineAndRecalcWithAudit,
  atomicRemoveInvoiceLineAndRecalcWithAudit,
  atomicIssueInvoiceWithAudit,
  atomicCancelInvoiceWithAudit,
  atomicCreateInvoiceFromOrderWithAudit,
} from "../helpers/atomic-sales-invoice";
import type { SequenceService } from "../../../erp.base/services/sequence-service";
import type { LedgerService } from "../../../accounting";

// ---- Service Interface ----

export interface SalesInvoiceService {
  create(ctx: ServiceContext, input: InvoiceCreateInput, db: Database): Promise<InvoiceOutput>;
  update(
    ctx: ServiceContext,
    id: string,
    input: InvoiceUpdateInput,
    db: Database
  ): Promise<InvoiceOutput>;
  get(ctx: ServiceContext, id: string, db: Database): Promise<InvoiceOutput>;
  list(ctx: ServiceContext, query: InvoiceListQuery, db: Database): Promise<InvoiceListOutput>;
  
  // Line Management (DRAFT only)
  upsertLine(
    ctx: ServiceContext,
    invoiceId: string,
    input: InvoiceLineUpsertInput,
    db: Database
  ): Promise<InvoiceOutput>;
  removeLine(
    ctx: ServiceContext,
    invoiceId: string,
    lineNo: number,
    db: Database
  ): Promise<InvoiceOutput>;

  // Workflow Transitions
  issue(ctx: ServiceContext, id: string, db: Database): Promise<InvoiceOutput>;
  cancel(ctx: ServiceContext, id: string, db: Database): Promise<InvoiceOutput>;

  // Order Conversion
  createFromOrder(
    ctx: ServiceContext,
    orderId: string,
    db: Database
  ): Promise<InvoiceOutput>;
}

// ---- Implementation ----

export class SalesInvoiceServiceImpl implements SalesInvoiceService {
  constructor(
    private sequenceService: SequenceService,
    private ledgerService: LedgerService
  ) {}

  // ---- CREATE ----

  async create(
    ctx: ServiceContext,
    input: InvoiceCreateInput,
    db: Database
  ): Promise<InvoiceOutput> {
    try {
      // Generate invoice number from sequence
      const seqResult = await this.sequenceService.next(ctx, "sales.invoice", db);
      const invoiceNo = seqResult.value;

      // Atomic insert + audit in single SQL
      const row = await atomicInsertWithAudit(db, {
        table: "sales_invoices",
        values: {
          tenant_id: ctx.tenantId,
          invoice_no: invoiceNo,
          status: "DRAFT",
          partner_id: input.partnerId,
          currency: input.currency,
          source_order_id: null,
          subtotal_cents: 0,
          total_cents: 0,
          notes: input.notes ?? null,
        },
        entityType: "erp.sales.invoice",
        eventType: "erp.sales.invoice.created",
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
          "ERP_INVOICE_NO_TAKEN" as any,
          `Invoice number collision detected`,
          { invoiceNo: (err as any).constraint }
        );
      }
      throw err;
    }
  }

  // ---- UPDATE (DRAFT only) ----

  async update(
    ctx: ServiceContext,
    id: string,
    input: InvoiceUpdateInput,
    db: Database
  ): Promise<InvoiceOutput> {
    // Pre-check: only DRAFT invoices can be updated
    const existing = await db
      .select()
      .from(salesInvoices)
      .where(
        and(
          eq(salesInvoices.tenantId, sql`${ctx.tenantId}::uuid`),
          eq(salesInvoices.id, sql`${id}::uuid`)
        )
      )
      .limit(1);

    if (!existing.length) {
      throw new DomainError(
        "ERP_INVOICE_NOT_FOUND" as any,
        "Invoice not found",
        { invoiceId: id }
      );
    }

    if (existing[0].status !== "DRAFT") {
      throw new DomainError(
        "ERP_INVOICE_IMMUTABLE" as any,
        `Cannot update invoice in ${existing[0].status} status (only DRAFT is mutable)`,
        { invoiceId: id, status: existing[0].status }
      );
    }

    // Build update payload
    const updateValues: Record<string, any> = { updated_at: sql`NOW()` };
    if (input.partnerId !== undefined) updateValues.partner_id = input.partnerId;
    if (input.currency !== undefined) updateValues.currency = input.currency;
    if (input.notes !== undefined) updateValues.notes = input.notes ?? null;

    const row = await atomicUpdateWithAudit(db, {
      table: "sales_invoices",
      set: updateValues,
      where: {
        tenant_id: ctx.tenantId,
        id,
        status: "DRAFT",
      },
      entityType: "erp.sales.invoice",
      eventType: "erp.sales.invoice.updated",
      ctx,
      payload: { changes: input },
    });

    if (!row) {
      throw new DomainError(
        "ERP_INVOICE_NOT_FOUND" as any,
        "Invoice not found or no longer DRAFT",
        { invoiceId: id }
      );
    }

    const lines = await this.fetchLines(ctx, id, db);
    return this.mapToOutput(row, lines);
  }

  // ---- GET ----

  async get(ctx: ServiceContext, id: string, db: Database): Promise<InvoiceOutput> {
    const rows = await db
      .select()
      .from(salesInvoices)
      .where(
        and(
          eq(salesInvoices.tenantId, sql`${ctx.tenantId}::uuid`),
          eq(salesInvoices.id, sql`${id}::uuid`)
        )
      )
      .limit(1);

    if (!rows.length) {
      throw new DomainError("ERP_INVOICE_NOT_FOUND" as any, "Invoice not found", {
        invoiceId: id,
      });
    }

    const lines = await this.fetchLines(ctx, id, db);
    return this.mapToOutput(rows[0], lines);
  }

  // ---- LIST ----

  async list(
    ctx: ServiceContext,
    query: InvoiceListQuery,
    db: Database
  ): Promise<InvoiceListOutput> {
    const limit = query.limit;
    const tenantId = ctx.tenantId;

    const conditions: any[] = [eq(salesInvoices.tenantId, sql`${tenantId}::uuid`)];

    if (query.status && query.status.length > 0) {
      conditions.push(inArray(salesInvoices.status, query.status));
    }

    if (query.partnerId) {
      conditions.push(eq(salesInvoices.partnerId, sql`${query.partnerId}::uuid`));
    }

    if (query.q) {
      const searchPattern = `%${query.q}%`;
      conditions.push(
        or(
          like(salesInvoices.invoiceNo, searchPattern),
          like(salesInvoices.notes, searchPattern)
        )
      );
    }

    if (query.cursor) {
      conditions.push(gt(salesInvoices.id, sql`${query.cursor}::uuid`));
    }

    const rows = await db
      .select()
      .from(salesInvoices)
      .where(and(...conditions))
      .orderBy(asc(salesInvoices.id))
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
    invoiceId: string,
    input: InvoiceLineUpsertInput,
    db: Database
  ): Promise<InvoiceOutput> {
    // Calculate line total in cents
    const qty = parseFloat(input.qty);
    const unitPriceCents = this.moneyToCents(input.unitPrice);
    const lineTotalCents = Math.round(qty * unitPriceCents);

    // Convert qty to numeric SQL literal (6 decimal places)
    const qtyNumericSql = parseFloat(input.qty).toFixed(6);

    // Use atomic helper (updates line + recalculates total + emits audit)
    const result = await atomicUpsertInvoiceLineAndRecalcWithAudit(db, {
      invoiceId,
      lineNo: input.lineNo,
      productId: input.productId ?? null,
      description: input.description,
      uomId: input.uomId,
      qtyNumericSql,
      unitPriceCents,
      lineTotalCents,
      entityType: "erp.sales.invoice",
      eventType: "erp.sales.invoice.line.upserted",
      ctx,
      payload: {
        invoiceId,
        lineNo: input.lineNo ?? null,
        productId: input.productId ?? null,
        unitPriceCents,
        lineTotalCents,
      },
    });

    if (!result) {
      throw new DomainError(
        "ERP_INVOICE_NOT_FOUND" as any,
        "Invoice not found or not in DRAFT status",
        { invoiceId }
      );
    }

    const lines = await this.fetchLines(ctx, invoiceId, db);
    return this.mapToOutput(result.invoice, lines);
  }

  // ---- REMOVE LINE (DRAFT only) ----

  async removeLine(
    ctx: ServiceContext,
    invoiceId: string,
    lineNo: number,
    db: Database
  ): Promise<InvoiceOutput> {
    const result = await atomicRemoveInvoiceLineAndRecalcWithAudit(db, {
      invoiceId,
      lineNo,
      entityType: "erp.sales.invoice",
      eventType: "erp.sales.invoice.line.removed",
      ctx,
      payload: { invoiceId, lineNo },
    });

    if (!result) {
      throw new DomainError(
        "ERP_INVOICE_NOT_FOUND" as any,
        "Invoice not found or not in DRAFT status",
        { invoiceId }
      );
    }

    const lines = await this.fetchLines(ctx, invoiceId, db);
    return this.mapToOutput(result, lines);
  }

  // ---- ISSUE ----

  async issue(ctx: ServiceContext, id: string, db: Database): Promise<InvoiceOutput> {
    const result = await atomicIssueInvoiceWithAudit(db, {
      invoiceId: id,
      entityType: "erp.sales.invoice",
      eventType: "erp.sales.invoice.issued",
      ctx,
    });

    if (!result) {
      throw new DomainError(
        "ERP_INVOICE_TRANSITION_FAILED" as any,
        "Cannot issue invoice: either not in DRAFT status or has no lines",
        { invoiceId: id }
      );
    }

    // Post to ledger (atomic with status transition)
    await this.ledgerService.postInvoiceIssued(ctx, id, db);

    const lines = await this.fetchLines(ctx, id, db);
    return this.mapToOutput(result, lines);
  }

  // ---- CANCEL ----

  async cancel(ctx: ServiceContext, id: string, db: Database): Promise<InvoiceOutput> {
    const result = await atomicCancelInvoiceWithAudit(db, {
      invoiceId: id,
      entityType: "erp.sales.invoice",
      eventType: "erp.sales.invoice.cancelled",
      ctx,
    });

    if (!result) {
      throw new DomainError(
        "ERP_INVOICE_TRANSITION_FAILED" as any,
        "Cannot cancel invoice: must be in DRAFT or ISSUED status",
        { invoiceId: id }
      );
    }

    // Post reversal to ledger if invoice was ISSUED
    // (only ISSUED invoices have ledger entries to reverse)
    if (result.status === "CANCELLED") {
      // Check if there's an issued entry (need to reverse it)
      const previousStatus = result.meta?.previousStatus;
      if (previousStatus === "ISSUED") {
        await this.ledgerService.postInvoiceCancelled(ctx, id, db);
      }
    }

    const lines = await this.fetchLines(ctx, id, db);
    return this.mapToOutput(result, lines);
  }

  // ---- CREATE FROM ORDER ----

  async createFromOrder(
    ctx: ServiceContext,
    orderId: string,
    db: Database
  ): Promise<InvoiceOutput> {
    // Generate invoice number from sequence
    const seqResult = await this.sequenceService.next(ctx, "sales.invoice", db);
    const invoiceNo = seqResult.value;

    // Use atomic conversion helper (inserts invoice + copies lines + emits audit)
    const result = await atomicCreateInvoiceFromOrderWithAudit(db, {
      orderId,
      invoiceNo,
      requiredOrderStatus: "CONFIRMED", // Only convert CONFIRMED orders
      entityType: "erp.sales.invoice",
      eventType: "erp.sales.invoice.created_from_order",
      ctx,
    });

    if (!result) {
      throw new DomainError(
        "ERP_ORDER_CONVERSION_FAILED" as any,
        "Cannot convert order: either not found, not in CONFIRMED status, or has no lines",
        { orderId }
      );
    }

    const lines = await this.fetchLines(ctx, result.id, db);
    return this.mapToOutput(result, lines);
  }

  // ---- HELPERS ----

  private async fetchLines(
    ctx: ServiceContext,
    invoiceId: string,
    db: Database
  ): Promise<any[]> {
    return await db
      .select()
      .from(salesInvoiceLines)
      .where(
        and(
          eq(salesInvoiceLines.tenantId, sql`${ctx.tenantId}::uuid`),
          eq(salesInvoiceLines.invoiceId, sql`${invoiceId}::uuid`)
        )
      )
      .orderBy(asc(salesInvoiceLines.lineNo));
  }

  private mapToOutput(invoice: any, lines: any[]): InvoiceOutput {
    return {
      id: invoice.id,
      invoiceNo: invoice.invoice_no,
      status: invoice.status,
      partnerId: invoice.partner_id,
      currency: invoice.currency,
      sourceOrderId: invoice.source_order_id,
      subtotal: this.centsToMoney(invoice.subtotal_cents),
      total: this.centsToMoney(invoice.total_cents),
      notes: invoice.notes,
      issuedAt: invoice.issued_at?.toISOString() ?? null,
      cancelledAt: invoice.cancelled_at?.toISOString() ?? null,
      createdAt: invoice.created_at.toISOString(),
      updatedAt: invoice.updated_at.toISOString(),
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

  private mapToListItem(invoice: any): any {
    return {
      id: invoice.id,
      invoiceNo: invoice.invoice_no,
      status: invoice.status,
      partnerId: invoice.partner_id,
      currency: invoice.currency,
      sourceOrderId: invoice.source_order_id,
      subtotal: this.centsToMoney(invoice.subtotal_cents),
      total: this.centsToMoney(invoice.total_cents),
      notes: invoice.notes,
      issuedAt: invoice.issued_at?.toISOString() ?? null,
      cancelledAt: invoice.cancelled_at?.toISOString() ?? null,
      createdAt: invoice.created_at.toISOString(),
      updatedAt: invoice.updated_at.toISOString(),
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

export const SALES_INVOICE_SERVICE = "SalesInvoiceService";
