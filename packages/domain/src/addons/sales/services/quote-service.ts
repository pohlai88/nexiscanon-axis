// packages/domain/src/addons/sales/services/quote-service.ts
// Sales Quote Service - Quote lifecycle management
//
// CRITICAL: Uses atomic multi-table CTE helpers for line operations
// Prevents "line changed but quote total stale" or "audit missing" failures

import { eq, and, like, desc, asc, or, inArray, gt, sql } from "drizzle-orm";
import type { Database } from "@workspace/db";
import { salesQuotes, salesQuoteLines } from "@workspace/db";
import type {
  QuoteCreateInput,
  QuoteUpdateInput,
  QuoteLineUpsertInput,
  QuoteOutput,
  QuoteListOutput,
  QuoteListQuery,
} from "@workspace/validation/erp/sales/quote";
import type { ServiceContext } from "../../erp.base/types";
import { ERP_ERROR_CODES, ErpDomainError as DomainError } from "../../erp.base/types";
import {
  atomicInsertWithAudit,
  atomicUpdateWithAudit,
} from "../../erp.base/helpers/atomic-audit";
import {
  atomicUpsertQuoteLineAndRecalcWithAudit,
  atomicRemoveQuoteLineAndRecalcWithAudit,
  atomicSendQuoteWithAudit,
} from "../helpers/atomic-sales-quote";
import type { SequenceService } from "../../erp.base/services/sequence-service";

// ---- Service Interface ----

export interface SalesQuoteService {
  create(ctx: ServiceContext, input: QuoteCreateInput, db: Database): Promise<QuoteOutput>;
  update(
    ctx: ServiceContext,
    id: string,
    input: QuoteUpdateInput,
    db: Database
  ): Promise<QuoteOutput>;
  get(ctx: ServiceContext, id: string, db: Database): Promise<QuoteOutput>;
  list(ctx: ServiceContext, query: QuoteListQuery, db: Database): Promise<QuoteListOutput>;
  
  // Line Management
  upsertLine(
    ctx: ServiceContext,
    quoteId: string,
    input: QuoteLineUpsertInput,
    db: Database
  ): Promise<QuoteOutput>;
  removeLine(
    ctx: ServiceContext,
    quoteId: string,
    lineNo: number,
    db: Database
  ): Promise<QuoteOutput>;

  // Workflow Transitions
  send(ctx: ServiceContext, id: string, db: Database): Promise<QuoteOutput>;
  accept(ctx: ServiceContext, id: string, db: Database): Promise<QuoteOutput>;
  cancel(ctx: ServiceContext, id: string, db: Database): Promise<QuoteOutput>;
}

// ---- Implementation ----

export class SalesQuoteServiceImpl implements SalesQuoteService {
  constructor(private sequenceService: SequenceService) {}

  // ---- CREATE ----

  async create(
    ctx: ServiceContext,
    input: QuoteCreateInput,
    db: Database
  ): Promise<QuoteOutput> {
    try {
      // Generate quote number from sequence
      const seqResult = await this.sequenceService.next(ctx, "sales.quote", db);
      const quoteNo = seqResult.value;

      // Atomic insert + audit in single SQL
      const row = await atomicInsertWithAudit(db, {
        table: "sales_quotes",
        values: {
          tenant_id: ctx.tenantId,
          quote_no: quoteNo,
          status: "DRAFT",
          partner_id: input.partnerId,
          currency: input.currency,
          total_cents: 0,
          notes: input.notes ?? null,
          is_active: true,
        },
        entityType: "erp.sales.quote",
        eventType: "erp.sales.quote.created",
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
          "ERP_QUOTE_NO_TAKEN" as any,
          `Quote number collision detected`,
          { quoteNo: (err as any).constraint }
        );
      }
      throw err;
    }
  }

  // ---- UPDATE ----

  async update(
    ctx: ServiceContext,
    id: string,
    input: QuoteUpdateInput,
    db: Database
  ): Promise<QuoteOutput> {
    // Pre-check: only DRAFT quotes can be updated
    const existing = await db
      .select()
      .from(salesQuotes)
      .where(
        and(
          eq(salesQuotes.tenantId, sql`${ctx.tenantId}::uuid`),
          eq(salesQuotes.id, sql`${id}::uuid`),
          eq(salesQuotes.isActive, true)
        )
      )
      .limit(1);

    if (!existing.length) {
      throw new DomainError(
        "ERP_QUOTE_NOT_FOUND" as any,
        "Quote not found or deleted",
        { quoteId: id }
      );
    }

    if (existing[0].status !== "DRAFT") {
      throw new DomainError(
        "ERP_QUOTE_IMMUTABLE" as any,
        `Cannot update quote in ${existing[0].status} status (only DRAFT is mutable)`,
        { quoteId: id, status: existing[0].status }
      );
    }

    // Build update payload
    const updateValues: Record<string, any> = { updated_at: sql`NOW()` };
    if (input.partnerId !== undefined) updateValues.partner_id = input.partnerId;
    if (input.currency !== undefined) updateValues.currency = input.currency;
    if (input.notes !== undefined) updateValues.notes = input.notes ?? null;

    const row = await atomicUpdateWithAudit(db, {
      table: "sales_quotes",
      set: updateValues,
      where: {
        tenant_id: ctx.tenantId,
        id,
        status: "DRAFT",
      },
      entityType: "erp.sales.quote",
      eventType: "erp.sales.quote.updated",
      ctx,
      payload: { changes: input },
    });

    if (!row) {
      throw new DomainError(
        "ERP_QUOTE_NOT_FOUND" as any,
        "Quote not found or no longer DRAFT",
        { quoteId: id }
      );
    }

    const lines = await this.fetchLines(ctx, id, db);
    return this.mapToOutput(row, lines);
  }

  // ---- GET ----

  async get(ctx: ServiceContext, id: string, db: Database): Promise<QuoteOutput> {
    const rows = await db
      .select()
      .from(salesQuotes)
      .where(
        and(
          eq(salesQuotes.tenantId, sql`${ctx.tenantId}::uuid`),
          eq(salesQuotes.id, sql`${id}::uuid`),
          eq(salesQuotes.isActive, true)
        )
      )
      .limit(1);

    if (!rows.length) {
      throw new DomainError("ERP_QUOTE_NOT_FOUND" as any, "Quote not found", {
        quoteId: id,
      });
    }

    const lines = await this.fetchLines(ctx, id, db);
    return this.mapToOutput(rows[0], lines);
  }

  // ---- LIST ----

  async list(
    ctx: ServiceContext,
    query: QuoteListQuery,
    db: Database
  ): Promise<QuoteListOutput> {
    const limit = query.limit;
    const tenantId = ctx.tenantId;

    const conditions: any[] = [
      eq(salesQuotes.tenantId, sql`${tenantId}::uuid`),
      eq(salesQuotes.isActive, true),
    ];

    if (query.status && query.status.length > 0) {
      conditions.push(inArray(salesQuotes.status, query.status));
    }

    if (query.partnerId) {
      conditions.push(eq(salesQuotes.partnerId, sql`${query.partnerId}::uuid`));
    }

    if (query.q) {
      const searchPattern = `%${query.q}%`;
      conditions.push(
        or(
          like(salesQuotes.quoteNo, searchPattern),
          like(salesQuotes.notes, searchPattern)
        )
      );
    }

    if (query.cursor) {
      conditions.push(gt(salesQuotes.id, sql`${query.cursor}::uuid`));
    }

    const rows = await db
      .select()
      .from(salesQuotes)
      .where(and(...conditions))
      .orderBy(asc(salesQuotes.id))
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return {
      items: items.map((row) => this.mapToListItem(row)),
      nextCursor,
    };
  }

  // ---- UPSERT LINE ----

  async upsertLine(
    ctx: ServiceContext,
    quoteId: string,
    input: QuoteLineUpsertInput,
    db: Database
  ): Promise<QuoteOutput> {
    // Calculate line total in cents
    const qty = parseFloat(input.qty);
    const unitPriceCents = this.moneyToCents(input.unitPrice);
    const lineTotalCents = Math.round(qty * unitPriceCents);

    // Convert qty to numeric SQL literal (6 decimal places)
    const qtyNumericSql = parseFloat(input.qty).toFixed(6);

    // Use atomic helper (updates line + recalculates total + emits audit)
    const result = await atomicUpsertQuoteLineAndRecalcWithAudit(db, {
      quoteId,
      lineNo: input.lineNo,
      productId: input.productId ?? null,
      description: input.description,
      uomId: input.uomId,
      qtyNumericSql,
      unitPriceCents,
      lineTotalCents,
      entityType: "erp.sales.quote",
      eventType: "erp.sales.quote.line.upserted",
      ctx,
      payload: {
        quoteId,
        lineNo: input.lineNo ?? null,
        productId: input.productId ?? null,
        unitPriceCents,
        lineTotalCents,
      },
    });

    if (!result) {
      throw new DomainError(
        "ERP_QUOTE_NOT_FOUND" as any,
        "Quote not found or not in DRAFT status",
        { quoteId }
      );
    }

    const lines = await this.fetchLines(ctx, quoteId, db);
    return this.mapToOutput(result.quote, lines);
  }

  // ---- REMOVE LINE ----

  async removeLine(
    ctx: ServiceContext,
    quoteId: string,
    lineNo: number,
    db: Database
  ): Promise<QuoteOutput> {
    const result = await atomicRemoveQuoteLineAndRecalcWithAudit(db, {
      quoteId,
      lineNo,
      entityType: "erp.sales.quote",
      eventType: "erp.sales.quote.line.removed",
      ctx,
      payload: { quoteId, lineNo },
    });

    if (!result) {
      throw new DomainError(
        "ERP_QUOTE_NOT_FOUND" as any,
        "Quote not found or not in DRAFT status",
        { quoteId }
      );
    }

    const lines = await this.fetchLines(ctx, quoteId, db);
    return this.mapToOutput(result, lines);
  }

  // ---- SEND ----

  async send(ctx: ServiceContext, id: string, db: Database): Promise<QuoteOutput> {
    const result = await atomicSendQuoteWithAudit(db, {
      quoteId: id,
      entityType: "erp.sales.quote",
      eventType: "erp.sales.quote.sent",
      ctx,
    });

    if (!result) {
      throw new DomainError(
        "ERP_QUOTE_TRANSITION_FAILED" as any,
        "Cannot send quote: either not in DRAFT status or has no lines",
        { quoteId: id }
      );
    }

    const lines = await this.fetchLines(ctx, id, db);
    return this.mapToOutput(result, lines);
  }

  // ---- ACCEPT ----

  async accept(ctx: ServiceContext, id: string, db: Database): Promise<QuoteOutput> {
    const row = await atomicUpdateWithAudit(db, {
      table: "sales_quotes",
      set: {
        status: "ACCEPTED",
        accepted_at: sql`NOW()`,
        updated_at: sql`NOW()`,
      },
      where: {
        tenant_id: ctx.tenantId,
        id,
        status: "SENT",
      },
      entityType: "erp.sales.quote",
      eventType: "erp.sales.quote.accepted",
      ctx,
    });

    if (!row) {
      throw new DomainError(
        "ERP_QUOTE_TRANSITION_FAILED" as any,
        "Cannot accept quote: must be in SENT status",
        { quoteId: id }
      );
    }

    const lines = await this.fetchLines(ctx, id, db);
    return this.mapToOutput(row, lines);
  }

  // ---- CANCEL ----

  async cancel(ctx: ServiceContext, id: string, db: Database): Promise<QuoteOutput> {
    // Try DRAFT first, then SENT (both allowed to cancel)
    let row = await atomicUpdateWithAudit(db, {
      table: "sales_quotes",
      set: {
        status: "CANCELLED",
        cancelled_at: sql`NOW()`,
        updated_at: sql`NOW()`,
      },
      where: {
        tenant_id: ctx.tenantId,
        id,
        status: "DRAFT",
      },
      entityType: "erp.sales.quote",
      eventType: "erp.sales.quote.cancelled",
      ctx,
    });

    if (!row) {
      row = await atomicUpdateWithAudit(db, {
        table: "sales_quotes",
        set: {
          status: "CANCELLED",
          cancelled_at: sql`NOW()`,
          updated_at: sql`NOW()`,
        },
        where: {
          tenant_id: ctx.tenantId,
          id,
          status: "SENT",
        },
        entityType: "erp.sales.quote",
        eventType: "erp.sales.quote.cancelled",
        ctx,
      });
    }

    if (!row) {
      throw new DomainError(
        "ERP_QUOTE_TRANSITION_FAILED" as any,
        "Cannot cancel quote: must be in DRAFT or SENT status",
        { quoteId: id }
      );
    }

    const lines = await this.fetchLines(ctx, id, db);
    return this.mapToOutput(row, lines);
  }

  // ---- HELPERS ----

  private async fetchLines(
    ctx: ServiceContext,
    quoteId: string,
    db: Database
  ): Promise<any[]> {
    return await db
      .select()
      .from(salesQuoteLines)
      .where(
        and(
          eq(salesQuoteLines.tenantId, sql`${ctx.tenantId}::uuid`),
          eq(salesQuoteLines.quoteId, sql`${quoteId}::uuid`)
        )
      )
      .orderBy(asc(salesQuoteLines.lineNo));
  }

  private mapToOutput(quote: any, lines: any[]): QuoteOutput {
    return {
      id: quote.id,
      quoteNo: quote.quote_no,
      status: quote.status,
      partnerId: quote.partner_id,
      currency: quote.currency,
      total: this.centsToMoney(quote.total_cents),
      notes: quote.notes,
      issuedAt: quote.issued_at?.toISOString() ?? null,
      acceptedAt: quote.accepted_at?.toISOString() ?? null,
      cancelledAt: quote.cancelled_at?.toISOString() ?? null,
      createdAt: quote.created_at.toISOString(),
      updatedAt: quote.updated_at.toISOString(),
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

  private mapToListItem(quote: any): any {
    return {
      id: quote.id,
      quoteNo: quote.quote_no,
      status: quote.status,
      partnerId: quote.partner_id,
      currency: quote.currency,
      total: this.centsToMoney(quote.total_cents),
      notes: quote.notes,
      issuedAt: quote.issued_at?.toISOString() ?? null,
      acceptedAt: quote.accepted_at?.toISOString() ?? null,
      cancelledAt: quote.cancelled_at?.toISOString() ?? null,
      createdAt: quote.created_at.toISOString(),
      updatedAt: quote.updated_at.toISOString(),
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

export const SALES_QUOTE_SERVICE = "SalesQuoteService";
