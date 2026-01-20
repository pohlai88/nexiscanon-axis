// packages/domain/src/addons/sales/credits/services/credit-service.ts
// Sales Credit Note Service - Credit note lifecycle management with cap enforcement

import { eq, and, like, asc, or, inArray, gt, sql } from "drizzle-orm";
import type { Database } from "@workspace/db";
import { salesCreditNotes, salesCreditNoteLines, salesInvoices } from "@workspace/db";
import type {
  CreditNoteCreateInput,
  CreditNoteUpdateInput,
  CreditNoteLineUpsertInput,
  CreditNoteOutput,
  CreditNoteListOutput,
  CreditNoteListQuery,
} from "@workspace/validation/erp/sales/credit";
import type { ServiceContext } from "../../../erp.base/types";
import { ERP_ERROR_CODES, ErpDomainError as DomainError } from "../../../erp.base/types";
import {
  atomicInsertWithAudit,
  atomicUpdateWithAudit,
} from "../../../erp.base/helpers/atomic-audit";
import {
  atomicUpsertCreditLineAndRecalcWithAudit,
  atomicRemoveCreditLineAndRecalcWithAudit,
  atomicIssueCreditWithAudit,
  atomicCancelCreditWithAudit,
  atomicCreateCreditFromInvoiceWithAudit,
} from "../helpers/atomic-sales-credit";
import type { SequenceService } from "../../../erp.base/services/sequence-service";
import type { LedgerService } from "../../../accounting";

export interface SalesCreditNoteService {
  create(ctx: ServiceContext, input: CreditNoteCreateInput, db: Database): Promise<CreditNoteOutput>;
  update(ctx: ServiceContext, id: string, input: CreditNoteUpdateInput, db: Database): Promise<CreditNoteOutput>;
  get(ctx: ServiceContext, id: string, db: Database): Promise<CreditNoteOutput>;
  list(ctx: ServiceContext, query: CreditNoteListQuery, db: Database): Promise<CreditNoteListOutput>;
  upsertLine(ctx: ServiceContext, creditNoteId: string, input: CreditNoteLineUpsertInput, db: Database): Promise<CreditNoteOutput>;
  removeLine(ctx: ServiceContext, creditNoteId: string, lineNo: number, db: Database): Promise<CreditNoteOutput>;
  issue(ctx: ServiceContext, id: string, db: Database): Promise<CreditNoteOutput>;
  cancel(ctx: ServiceContext, id: string, db: Database): Promise<CreditNoteOutput>;
  createFromInvoice(ctx: ServiceContext, invoiceId: string, db: Database): Promise<CreditNoteOutput>;
}

export class SalesCreditNoteServiceImpl implements SalesCreditNoteService {
  constructor(
    private sequenceService: SequenceService,
    private ledgerService: LedgerService
  ) {}

  async create(ctx: ServiceContext, input: CreditNoteCreateInput, db: Database): Promise<CreditNoteOutput> {
    const seqResult = await this.sequenceService.next(ctx, "sales.credit", db);
    const row = await atomicInsertWithAudit(db, {
      table: "sales_credit_notes",
      values: {
        tenant_id: ctx.tenantId,
        credit_no: seqResult.value,
        status: "DRAFT",
        partner_id: input.partnerId,
        currency: input.currency,
        source_invoice_id: null,
        reason: input.reason ?? null,
        subtotal_cents: 0,
        total_cents: 0,
        notes: input.notes ?? null,
      },
      entityType: "erp.sales.credit",
      eventType: "erp.sales.credit.created",
      ctx,
    });
    return this.mapToOutput(row, []);
  }

  async update(ctx: ServiceContext, id: string, input: CreditNoteUpdateInput, db: Database): Promise<CreditNoteOutput> {
    const existing = await db.select().from(salesCreditNotes).where(and(eq(salesCreditNotes.tenantId, sql`${ctx.tenantId}::uuid`), eq(salesCreditNotes.id, sql`${id}::uuid`))).limit(1);
    if (!existing.length) throw new DomainError("ERP_CREDIT_NOT_FOUND" as any, `Credit note not found: ${id}`, { id });
    if (existing[0].status !== "DRAFT") throw new DomainError("ERP_CREDIT_NOT_MUTABLE" as any, `Cannot update credit note in ${existing[0].status} status (only DRAFT is mutable)`, { id, status: existing[0].status });
    const set: Record<string, any> = {};
    if (input.partnerId !== undefined) set.partner_id = input.partnerId;
    if (input.currency !== undefined) set.currency = input.currency;
    if (input.reason !== undefined) set.reason = input.reason;
    if (input.notes !== undefined) set.notes = input.notes;
    if (Object.keys(set).length === 0) return this.get(ctx, id, db);
    const row = await atomicUpdateWithAudit(db, { table: "sales_credit_notes", set, where: { id, tenant_id: ctx.tenantId, status: "DRAFT" }, entityType: "erp.sales.credit", eventType: "erp.sales.credit.updated", ctx, payload: { changes: input } });
    if (!row) throw new DomainError("ERP_CREDIT_NOT_FOUND" as any, "Credit note not found or no longer DRAFT", { id });
    return this.get(ctx, id, db);
  }

  async get(ctx: ServiceContext, id: string, db: Database): Promise<CreditNoteOutput> {
    const [header] = await db.select().from(salesCreditNotes).where(and(eq(salesCreditNotes.tenantId, sql`${ctx.tenantId}::uuid`), eq(salesCreditNotes.id, sql`${id}::uuid`))).limit(1);
    if (!header) throw new DomainError("ERP_CREDIT_NOT_FOUND" as any, `Credit note not found: ${id}`, { id });
    const lines = await db.select().from(salesCreditNoteLines).where(and(eq(salesCreditNoteLines.tenantId, sql`${ctx.tenantId}::uuid`), eq(salesCreditNoteLines.creditNoteId, sql`${id}::uuid`))).orderBy(asc(salesCreditNoteLines.lineNo));
    return this.mapToOutput(header, lines);
  }

  async list(ctx: ServiceContext, query: CreditNoteListQuery, db: Database): Promise<CreditNoteListOutput> {
    const conditions: any[] = [eq(salesCreditNotes.tenantId, sql`${ctx.tenantId}::uuid`)];
    if (query.status && query.status.length > 0) conditions.push(inArray(salesCreditNotes.status, query.status));
    if (query.partnerId) conditions.push(eq(salesCreditNotes.partnerId, sql`${query.partnerId}::uuid`));
    if (query.sourceInvoiceId) conditions.push(eq(salesCreditNotes.sourceInvoiceId, sql`${query.sourceInvoiceId}::uuid`));
    if (query.q) conditions.push(or(like(salesCreditNotes.creditNo, `%${query.q}%`), like(salesCreditNotes.reason, `%${query.q}%`)));
    if (query.cursor) conditions.push(gt(salesCreditNotes.id, sql`${query.cursor}::uuid`));
    const items = await db.select().from(salesCreditNotes).where(and(...conditions)).orderBy(asc(salesCreditNotes.id)).limit(query.limit + 1);
    const hasMore = items.length > query.limit;
    const result = hasMore ? items.slice(0, query.limit) : items;
    return { items: result.map((r) => this.mapToOutput(r, [])), nextCursor: hasMore ? result[result.length - 1]?.id : undefined };
  }

  async upsertLine(ctx: ServiceContext, creditNoteId: string, input: CreditNoteLineUpsertInput, db: Database): Promise<CreditNoteOutput> {
    const qtyDecimal = parseFloat(input.qty);
    const priceDecimal = parseFloat(input.unitPrice);
    if (isNaN(qtyDecimal) || qtyDecimal <= 0) throw new DomainError("ERP_INVALID_QTY" as any, "Quantity must be a positive number", { qty: input.qty });
    if (isNaN(priceDecimal) || priceDecimal < 0) throw new DomainError("ERP_INVALID_PRICE" as any, "Unit price must be a non-negative number", { unitPrice: input.unitPrice });
    const unitPriceCents = Math.round(priceDecimal * 100);
    const lineTotalCents = Math.round(qtyDecimal * unitPriceCents);
    const result = await atomicUpsertCreditLineAndRecalcWithAudit(db, { creditNoteId, lineNo: input.lineNo, productId: input.productId ?? null, description: input.description, uomId: input.uomId, qtyNumericSql: String(qtyDecimal), unitPriceCents, lineTotalCents, entityType: "erp.sales.credit", eventType: "erp.sales.credit.line.upserted", ctx });
    if (!result) throw new DomainError("ERP_CREDIT_NOT_FOUND" as any, "Credit note not found or not in DRAFT status", { creditNoteId });
    return this.get(ctx, creditNoteId, db);
  }

  async removeLine(ctx: ServiceContext, creditNoteId: string, lineNo: number, db: Database): Promise<CreditNoteOutput> {
    const result = await atomicRemoveCreditLineAndRecalcWithAudit(db, { creditNoteId, lineNo, entityType: "erp.sales.credit", eventType: "erp.sales.credit.line.removed", ctx });
    if (!result) throw new DomainError("ERP_CREDIT_NOT_FOUND" as any, "Credit note not found or not in DRAFT status", { creditNoteId });
    return this.get(ctx, creditNoteId, db);
  }

  async issue(ctx: ServiceContext, id: string, db: Database): Promise<CreditNoteOutput> {
    const result = await atomicIssueCreditWithAudit(db, { creditNoteId: id, entityType: "erp.sales.credit", eventType: "erp.sales.credit.issued", ctx });
    if (!result) {
      const [credit] = await db.select().from(salesCreditNotes).where(and(eq(salesCreditNotes.tenantId, sql`${ctx.tenantId}::uuid`), eq(salesCreditNotes.id, sql`${id}::uuid`))).limit(1);
      if (!credit) throw new DomainError("ERP_CREDIT_NOT_FOUND" as any, `Credit note not found: ${id}`, { id });
      if (credit.status !== "DRAFT") throw new DomainError("ERP_CREDIT_INVALID_STATUS" as any, `Cannot issue credit note in ${credit.status} status (must be DRAFT)`, { id, status: credit.status });
      const [lineCount] = await db.select({ count: sql<number>`COUNT(*)::int` }).from(salesCreditNoteLines).where(and(eq(salesCreditNoteLines.tenantId, sql`${ctx.tenantId}::uuid`), eq(salesCreditNoteLines.creditNoteId, sql`${id}::uuid`)));
      if (!lineCount || lineCount.count === 0) throw new DomainError("ERP_CREDIT_NO_LINES" as any, "Cannot issue credit note: must have at least one line", { id });
      if (credit.sourceInvoiceId) {
        const [invoice] = await db.select().from(salesInvoices).where(and(eq(salesInvoices.tenantId, sql`${ctx.tenantId}::uuid`), eq(salesInvoices.id, sql`${credit.sourceInvoiceId}::uuid`))).limit(1);
        const [issued] = await db.select({ total: sql<number>`COALESCE(SUM(total_cents), 0)::int` }).from(salesCreditNotes).where(and(eq(salesCreditNotes.tenantId, sql`${ctx.tenantId}::uuid`), eq(salesCreditNotes.sourceInvoiceId, sql`${credit.sourceInvoiceId}::uuid`), eq(salesCreditNotes.status, "ISSUED"), sql`id != ${id}::uuid`));
        throw new DomainError("ERP_CREDIT_EXCEEDS_INVOICE_TOTAL" as any, "Cannot issue credit note: would exceed invoice total (cap enforcement)", { creditNoteId: id, creditTotalCents: credit.totalCents, invoiceTotalCents: invoice?.totalCents ?? 0, issuedCreditsCents: issued?.total ?? 0, remainingCents: (invoice?.totalCents ?? 0) - (issued?.total ?? 0) });
      }
      throw new DomainError("ERP_CREDIT_ISSUE_FAILED" as any, "Cannot issue credit note: preconditions not met", { id });
    }
    
    // Post to ledger (atomic with status transition)
    await this.ledgerService.postCreditIssued(ctx, id, db);
    
    return this.get(ctx, id, db);
  }

  async cancel(ctx: ServiceContext, id: string, db: Database): Promise<CreditNoteOutput> {
    const result = await atomicCancelCreditWithAudit(db, { creditNoteId: id, entityType: "erp.sales.credit", eventType: "erp.sales.credit.cancelled", ctx });
    if (!result) throw new DomainError("ERP_CREDIT_NOT_FOUND" as any, "Cannot cancel credit note: either not found or already CANCELLED", { id });
    
    // Post reversal to ledger if credit was ISSUED
    if (result.status === "CANCELLED") {
      // Fetch pre-cancel status to check if reversal needed
      const [credit] = await db
        .select()
        .from(salesCreditNotes)
        .where(and(eq(salesCreditNotes.id, id), eq(salesCreditNotes.tenantId, ctx.tenantId)))
        .limit(1);
      
      // Only post reversal if there's a ledger entry to reverse
      // (check meta for previous status or assume ISSUED if cancel succeeded)
      await this.ledgerService.postCreditCancelled(ctx, id, db);
    }
    
    return this.get(ctx, id, db);
  }

  async createFromInvoice(ctx: ServiceContext, invoiceId: string, db: Database): Promise<CreditNoteOutput> {
    const seqResult = await this.sequenceService.next(ctx, "sales.credit", db);
    const result = await atomicCreateCreditFromInvoiceWithAudit(db, { invoiceId, creditNo: seqResult.value, requiredInvoiceStatus: "ISSUED", entityType: "erp.sales.credit", eventType: "erp.sales.credit.created_from_invoice", ctx });
    if (!result) {
      const [invoice] = await db.select().from(salesInvoices).where(and(eq(salesInvoices.tenantId, sql`${ctx.tenantId}::uuid`), eq(salesInvoices.id, sql`${invoiceId}::uuid`))).limit(1);
      if (!invoice) throw new DomainError("ERP_INVOICE_NOT_FOUND" as any, `Invoice not found: ${invoiceId}`, { invoiceId });
      if (invoice.status !== "ISSUED") throw new DomainError("ERP_INVOICE_NOT_ISSUED" as any, `Cannot create credit from invoice in ${invoice.status} status (must be ISSUED)`, { invoiceId, status: invoice.status });
      const [issued] = await db.select({ total: sql<number>`COALESCE(SUM(total_cents), 0)::int` }).from(salesCreditNotes).where(and(eq(salesCreditNotes.tenantId, sql`${ctx.tenantId}::uuid`), eq(salesCreditNotes.sourceInvoiceId, sql`${invoiceId}::uuid`), eq(salesCreditNotes.status, "ISSUED")));
      throw new DomainError("ERP_CREDIT_EXCEEDS_INVOICE_TOTAL" as any, "Cannot create credit: would exceed invoice total (cap enforcement)", { invoiceId, invoiceTotalCents: invoice.totalCents, issuedCreditsCents: issued?.total ?? 0, remainingCents: invoice.totalCents - (issued?.total ?? 0) });
    }
    return this.get(ctx, (result as any).id, db);
  }

  private mapToOutput(row: typeof salesCreditNotes.$inferSelect | any, lines: (typeof salesCreditNoteLines.$inferSelect)[]): CreditNoteOutput {
    const subtotalCents = row.subtotal_cents ?? row.subtotalCents;
    const totalCents = row.total_cents ?? row.totalCents;
    return {
      id: row.id,
      creditNo: row.credit_no ?? row.creditNo,
      status: row.status,
      partnerId: row.partner_id ?? row.partnerId,
      currency: row.currency,
      sourceInvoiceId: row.source_invoice_id ?? row.sourceInvoiceId ?? undefined,
      reason: row.reason ?? undefined,
      subtotal: (subtotalCents / 100).toFixed(2),
      total: (totalCents / 100).toFixed(2),
      notes: row.notes ?? undefined,
      issuedAt: row.issued_at?.toISOString() ?? row.issuedAt ?? undefined,
      cancelledAt: row.cancelled_at?.toISOString() ?? row.cancelledAt ?? undefined,
      createdAt: row.created_at?.toISOString() ?? row.createdAt,
      updatedAt: row.updated_at?.toISOString() ?? row.updatedAt,
      lines: lines.length ? lines.map((l) => ({ id: l.id, lineNo: l.lineNo, productId: l.productId ?? undefined, description: l.description, uomId: l.uomId, qty: l.qty.toString(), unitPrice: (l.unitPriceCents / 100).toFixed(2), lineTotal: (l.lineTotalCents / 100).toFixed(2) })) : undefined,
    };
  }
}
