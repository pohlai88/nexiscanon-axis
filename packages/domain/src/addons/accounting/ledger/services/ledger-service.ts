// packages/domain/src/addons/accounting/ledger/services/ledger-service.ts
// Ledger Service - Accounting event stream management
//
// CRITICAL: Ledger is append-only. Cancellations = reversals, not deletions.

import { eq, and, desc, sql, or, gt } from "drizzle-orm";
import type { Database } from "@workspace/db";
import {
  acctLedgerEntries,
  acctLedgerLines,
  salesInvoices,
  salesCreditNotes,
} from "@workspace/db";
import type {
  LedgerListQueryInput,
  LedgerListOutputType,
  LedgerEntryOutputType,
} from "@workspace/validation";
import type { ServiceContext } from "../../../erp.base/types";
import { ERP_ERROR_CODES, ErpDomainError as DomainError } from "../../../erp.base/types";
import type { SequenceService } from "../../../erp.base/services/sequence-service";
import { atomicPostLedgerEntryWithAudit, type LedgerLine } from "../helpers/atomic-ledger";

// ---- Service Interface ----

export interface LedgerService {
  // Posting (internal - called by Invoice/Credit services)
  postInvoiceIssued(ctx: ServiceContext, invoiceId: string, db: Database): Promise<string>;
  postInvoiceCancelled(ctx: ServiceContext, invoiceId: string, db: Database): Promise<string>;
  postCreditIssued(ctx: ServiceContext, creditId: string, db: Database): Promise<string>;
  postCreditCancelled(ctx: ServiceContext, creditId: string, db: Database): Promise<string>;

  // Queries (public - exposed via routes)
  get(ctx: ServiceContext, entryId: string, db: Database): Promise<LedgerEntryOutputType>;
  list(ctx: ServiceContext, query: LedgerListQueryInput, db: Database): Promise<LedgerListOutputType>;
}

// ---- Implementation ----

export class LedgerServiceImpl implements LedgerService {
  constructor(private sequenceService: SequenceService) {}

  // ---- POSTING: Invoice Issued ----

  async postInvoiceIssued(
    ctx: ServiceContext,
    invoiceId: string,
    db: Database
  ): Promise<string> {
    // Fetch invoice
    const [invoice] = await db
      .select()
      .from(salesInvoices)
      .where(
        and(
          eq(salesInvoices.id, invoiceId),
          eq(salesInvoices.tenantId, ctx.tenantId)
        )
      )
      .limit(1);

    if (!invoice) {
      throw new DomainError(
        "ERP_INVOICE_NOT_FOUND" as any,
        `Invoice ${invoiceId} not found`,
        { invoiceId }
      );
    }

    if (invoice.status !== "ISSUED") {
      throw new DomainError(
        "ERP_INVALID_STATUS" as any,
        `Invoice must be ISSUED to post ledger (current: ${invoice.status})`,
        { invoiceId, currentStatus: invoice.status }
      );
    }

    // Generate entry number
    const seqResult = await this.sequenceService.next(ctx, "acct.entry", db);

    // Post: DEBIT AR, CREDIT SALES_REVENUE
    const lines: LedgerLine[] = [
      {
        accountCode: "AR",
        dc: "DEBIT",
        amountCents: invoice.totalCents,
        description: `Invoice ${invoice.invoiceNo} issued`,
      },
      {
        accountCode: "SALES_REVENUE",
        dc: "CREDIT",
        amountCents: invoice.totalCents,
        description: `Revenue from invoice ${invoice.invoiceNo}`,
      },
    ];

    const result = await atomicPostLedgerEntryWithAudit(db, {
      entry: {
        tenantId: ctx.tenantId,
        entryNo: seqResult.value,
        sourceType: "SALES_INVOICE",
        sourceId: invoiceId,
        eventType: "invoice.issued",
        currency: invoice.currency,
        memo: `Invoice ${invoice.invoiceNo} issued`,
        lines,
      },
      entityType: "erp.accounting.ledger",
      eventType: "ledger.posted",
      ctx,
      payload: { invoiceId, invoiceNo: invoice.invoiceNo },
    });

    if (!result) {
      throw new DomainError(
        ERP_ERROR_CODES.ERP_OPERATION_FAILED,
        "Failed to post ledger entry for invoice issuance",
        { invoiceId }
      );
    }

    return result.entryId;
  }

  // ---- POSTING: Invoice Cancelled (Reversal) ----

  async postInvoiceCancelled(
    ctx: ServiceContext,
    invoiceId: string,
    db: Database
  ): Promise<string> {
    // Fetch invoice
    const [invoice] = await db
      .select()
      .from(salesInvoices)
      .where(
        and(
          eq(salesInvoices.id, invoiceId),
          eq(salesInvoices.tenantId, ctx.tenantId)
        )
      )
      .limit(1);

    if (!invoice) {
      throw new DomainError(
        ERP_ERROR_CODES.ERP_INVOICE_NOT_FOUND,
        `Invoice ${invoiceId} not found`,
        { invoiceId }
      );
    }

    if (invoice.status !== "CANCELLED") {
      throw new DomainError(
        ERP_ERROR_CODES.ERP_INVALID_STATUS_TRANSITION,
        `Invoice must be CANCELLED to post reversal (current: ${invoice.status})`,
        { invoiceId, currentStatus: invoice.status }
      );
    }

    // Generate entry number
    const seqResult = await this.sequenceService.next(ctx, "acct.entry", db);

    // Post reversal: CREDIT AR, DEBIT SALES_REVENUE (swap dc from issuance)
    const lines: LedgerLine[] = [
      {
        accountCode: "AR",
        dc: "CREDIT",
        amountCents: invoice.totalCents,
        description: `Invoice ${invoice.invoiceNo} cancelled`,
      },
      {
        accountCode: "SALES_REVENUE",
        dc: "DEBIT",
        amountCents: invoice.totalCents,
        description: `Reversal of revenue from invoice ${invoice.invoiceNo}`,
      },
    ];

    const result = await atomicPostLedgerEntryWithAudit(db, {
      entry: {
        tenantId: ctx.tenantId,
        entryNo: seqResult.value,
        sourceType: "SALES_INVOICE",
        sourceId: invoiceId,
        eventType: "invoice.cancelled",
        currency: invoice.currency,
        memo: `Invoice ${invoice.invoiceNo} cancelled (reversal)`,
        lines,
      },
      entityType: "erp.accounting.ledger",
      eventType: "ledger.posted",
      ctx,
      payload: { invoiceId, invoiceNo: invoice.invoiceNo },
    });

    if (!result) {
      throw new DomainError(
        ERP_ERROR_CODES.ERP_OPERATION_FAILED,
        "Failed to post reversal entry for invoice cancellation",
        { invoiceId }
      );
    }

    return result.entryId;
  }

  // ---- POSTING: Credit Issued ----

  async postCreditIssued(
    ctx: ServiceContext,
    creditId: string,
    db: Database
  ): Promise<string> {
    // Fetch credit note
    const [credit] = await db
      .select()
      .from(salesCreditNotes)
      .where(
        and(
          eq(salesCreditNotes.id, creditId),
          eq(salesCreditNotes.tenantId, ctx.tenantId)
        )
      )
      .limit(1);

    if (!credit) {
      throw new DomainError(
        ERP_ERROR_CODES.ERP_CREDIT_NOT_FOUND,
        `Credit note ${creditId} not found`,
        { creditId }
      );
    }

    if (credit.status !== "ISSUED") {
      throw new DomainError(
        ERP_ERROR_CODES.ERP_INVALID_STATUS_TRANSITION,
        `Credit note must be ISSUED to post ledger (current: ${credit.status})`,
        { creditId, currentStatus: credit.status }
      );
    }

    // Generate entry number
    const seqResult = await this.sequenceService.next(ctx, "acct.entry", db);

    // Post: DEBIT SALES_RETURNS, CREDIT AR
    const lines: LedgerLine[] = [
      {
        accountCode: "SALES_RETURNS",
        dc: "DEBIT",
        amountCents: credit.totalCents,
        description: `Credit note ${credit.creditNoteNo} issued`,
      },
      {
        accountCode: "AR",
        dc: "CREDIT",
        amountCents: credit.totalCents,
        description: `AR reduction from credit note ${credit.creditNoteNo}`,
      },
    ];

    const result = await atomicPostLedgerEntryWithAudit(db, {
      entry: {
        tenantId: ctx.tenantId,
        entryNo: seqResult.value,
        sourceType: "SALES_CREDIT_NOTE",
        sourceId: creditId,
        eventType: "credit.issued",
        currency: credit.currency,
        memo: `Credit note ${credit.creditNoteNo} issued`,
        lines,
      },
      entityType: "erp.accounting.ledger",
      eventType: "ledger.posted",
      ctx,
      payload: { creditId, creditNoteNo: credit.creditNoteNo },
    });

    if (!result) {
      throw new DomainError(
        ERP_ERROR_CODES.ERP_OPERATION_FAILED,
        "Failed to post ledger entry for credit note issuance",
        { creditId }
      );
    }

    return result.entryId;
  }

  // ---- POSTING: Credit Cancelled (Reversal) ----

  async postCreditCancelled(
    ctx: ServiceContext,
    creditId: string,
    db: Database
  ): Promise<string> {
    // Fetch credit note
    const [credit] = await db
      .select()
      .from(salesCreditNotes)
      .where(
        and(
          eq(salesCreditNotes.id, creditId),
          eq(salesCreditNotes.tenantId, ctx.tenantId)
        )
      )
      .limit(1);

    if (!credit) {
      throw new DomainError(
        ERP_ERROR_CODES.ERP_CREDIT_NOT_FOUND,
        `Credit note ${creditId} not found`,
        { creditId }
      );
    }

    if (credit.status !== "CANCELLED") {
      throw new DomainError(
        ERP_ERROR_CODES.ERP_INVALID_STATUS_TRANSITION,
        `Credit note must be CANCELLED to post reversal (current: ${credit.status})`,
        { creditId, currentStatus: credit.status }
      );
    }

    // Generate entry number
    const seqResult = await this.sequenceService.next(ctx, "acct.entry", db);

    // Post reversal: CREDIT SALES_RETURNS, DEBIT AR (swap dc from issuance)
    const lines: LedgerLine[] = [
      {
        accountCode: "SALES_RETURNS",
        dc: "CREDIT",
        amountCents: credit.totalCents,
        description: `Credit note ${credit.creditNoteNo} cancelled`,
      },
      {
        accountCode: "AR",
        dc: "DEBIT",
        amountCents: credit.totalCents,
        description: `AR restoration from cancelled credit note ${credit.creditNoteNo}`,
      },
    ];

    const result = await atomicPostLedgerEntryWithAudit(db, {
      entry: {
        tenantId: ctx.tenantId,
        entryNo: seqResult.value,
        sourceType: "SALES_CREDIT_NOTE",
        sourceId: creditId,
        eventType: "credit.cancelled",
        currency: credit.currency,
        memo: `Credit note ${credit.creditNoteNo} cancelled (reversal)`,
        lines,
      },
      entityType: "erp.accounting.ledger",
      eventType: "ledger.posted",
      ctx,
      payload: { creditId, creditNoteNo: credit.creditNoteNo },
    });

    if (!result) {
      throw new DomainError(
        ERP_ERROR_CODES.ERP_OPERATION_FAILED,
        "Failed to post reversal entry for credit note cancellation",
        { creditId }
      );
    }

    return result.entryId;
  }

  // ---- QUERY: Get Entry ----

  async get(
    ctx: ServiceContext,
    entryId: string,
    db: Database
  ): Promise<LedgerEntryOutput> {
    const [entry] = await db
      .select()
      .from(acctLedgerEntries)
      .where(
        and(
          eq(acctLedgerEntries.id, entryId),
          eq(acctLedgerEntries.tenantId, ctx.tenantId)
        )
      )
      .limit(1);

    if (!entry) {
      throw new DomainError(
        ERP_ERROR_CODES.ERP_NOT_FOUND,
        `Ledger entry ${entryId} not found`,
        { entryId }
      );
    }

    // Fetch lines
    const lines = await db
      .select()
      .from(acctLedgerLines)
      .where(
        and(
          eq(acctLedgerLines.entryId, entryId),
          eq(acctLedgerLines.tenantId, ctx.tenantId)
        )
      );

    return {
      id: entry.id,
      entryNo: entry.entryNo,
      postedAt: entry.postedAt.toISOString(),
      sourceType: entry.sourceType,
      sourceId: entry.sourceId,
      eventType: entry.eventType,
      currency: entry.currency,
      memo: entry.memo || null,
      meta: (entry.meta as Record<string, unknown>) || {},
      lines: lines.map((l) => ({
        id: l.id,
        accountCode: l.accountCode,
        dc: l.dc,
        amount: (l.amountCents / 100).toFixed(2),
        description: l.description || null,
      })),
    };
  }

  // ---- QUERY: List Entries ----

  async list(
    ctx: ServiceContext,
    query: LedgerListQuery,
    db: Database
  ): Promise<LedgerListOutput> {
    const limit = query.limit || 20;
    const conditions = [eq(acctLedgerEntries.tenantId, ctx.tenantId)];

    if (query.sourceType) {
      conditions.push(eq(acctLedgerEntries.sourceType, query.sourceType));
    }

    if (query.sourceId) {
      conditions.push(eq(acctLedgerEntries.sourceId, query.sourceId));
    }

    if (query.postedAfter) {
      conditions.push(gt(acctLedgerEntries.postedAt, new Date(query.postedAfter)));
    }

    if (query.postedBefore) {
      conditions.push(sql`${acctLedgerEntries.postedAt} < ${new Date(query.postedBefore)}`);
    }

    if (query.cursor) {
      conditions.push(sql`${acctLedgerEntries.id} < ${query.cursor}`);
    }

    const entries = await db
      .select()
      .from(acctLedgerEntries)
      .where(and(...conditions))
      .orderBy(desc(acctLedgerEntries.postedAt))
      .limit(limit + 1);

    const hasMore = entries.length > limit;
    const items = hasMore ? entries.slice(0, limit) : entries;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return {
      items: items.map((e) => ({
        id: e.id,
        entryNo: e.entryNo,
        postedAt: e.postedAt.toISOString(),
        sourceType: e.sourceType,
        sourceId: e.sourceId,
        eventType: e.eventType,
        currency: e.currency,
        memo: e.memo || null,
        meta: (e.meta as Record<string, unknown>) || {},
      })),
      nextCursor,
    };
  }
}
