// packages/domain/src/addons/sales/credits/helpers/atomic-sales-credit.ts
// Sales Credit Note Atomic Helpers - Multi-table CTE operations with Cap Enforcement
//
// CRITICAL: These guarantee atomicity for operations that touch:
// - sales_credit_note_lines (insert/update/delete)
// - sales_credit_notes.subtotal_cents/total_cents (recomputed)
// - erp_audit_events (audit trail)
// - Over-credit cap validation (SUM(issued credits) ≤ invoice total)
//
// All mutations happen in a single SQL statement (CTE pattern)
// If any part fails, entire operation rolls back

import { sql } from "drizzle-orm";
import type { Database } from "@workspace/db";
import type { ServiceContext } from "../../../erp.base/types";

function escStr(v: string): string {
  return v.replace(/'/g, "''");
}

/**
 * Atomic Upsert Credit Note Line + Recalculate Totals + Audit
 */
export async function atomicUpsertCreditLineAndRecalcWithAudit<T = any>(
  db: Database,
  opts: {
    creditNoteId: string;
    lineNo?: number;
    productId?: string | null;
    description: string;
    uomId: string;
    qtyNumericSql: string;
    unitPriceCents: number;
    lineTotalCents: number;
    entityType: string;
    eventType: string;
    ctx: ServiceContext;
    payload?: Record<string, unknown>;
  }
): Promise<{ creditNote: T; lineId: string; lineNo: number } | null> {
  const actorType = opts.ctx.actorUserId ? "USER" : "SYSTEM";
  const tenantId = opts.ctx.tenantId;
  const payload = opts.payload ?? { creditNoteId: opts.creditNoteId, lineNo: opts.lineNo ?? null };
  const payloadJson = escStr(JSON.stringify(payload));
  const lineNoExpr = opts.lineNo ? String(opts.lineNo) : `(SELECT COALESCE(MAX(l.line_no), 0) + 1 FROM sales_credit_note_lines l WHERE l.tenant_id = '${escStr(tenantId)}'::uuid AND l.credit_note_id = '${escStr(opts.creditNoteId)}'::uuid)`;
  const isExplicitLineNo = typeof opts.lineNo === "number";

  const result = await db.execute(sql.raw(`
    WITH target_credit AS (SELECT id FROM sales_credit_notes WHERE tenant_id = '${escStr(tenantId)}'::uuid AND id = '${escStr(opts.creditNoteId)}'::uuid LIMIT 1),
    draft_guard AS (SELECT c.id FROM sales_credit_notes c JOIN target_credit tc ON tc.id = c.id WHERE c.status = 'DRAFT'),
    updated AS (${isExplicitLineNo ? `UPDATE sales_credit_note_lines l SET product_id = ${opts.productId ? `'${escStr(opts.productId)}'::uuid` : "NULL"}, description = '${escStr(opts.description)}', uom_id = '${escStr(opts.uomId)}'::uuid, qty = ${opts.qtyNumericSql}::numeric, unit_price_cents = ${opts.unitPriceCents}, line_total_cents = ${opts.lineTotalCents}, updated_at = NOW() WHERE l.tenant_id = '${escStr(tenantId)}'::uuid AND l.credit_note_id = (SELECT id FROM draft_guard) AND l.line_no = ${opts.lineNo} RETURNING l.*` : `SELECT NULL::uuid AS id WHERE false`}),
    inserted AS (INSERT INTO sales_credit_note_lines (tenant_id, credit_note_id, line_no, product_id, description, uom_id, qty, unit_price_cents, line_total_cents, created_at, updated_at) SELECT '${escStr(tenantId)}'::uuid, (SELECT id FROM draft_guard), ${lineNoExpr}, ${opts.productId ? `'${escStr(opts.productId)}'::uuid` : "NULL"}, '${escStr(opts.description)}', '${escStr(opts.uomId)}'::uuid, ${opts.qtyNumericSql}::numeric, ${opts.unitPriceCents}, ${opts.lineTotalCents}, NOW(), NOW() WHERE (SELECT id FROM draft_guard) IS NOT NULL AND ${isExplicitLineNo ? "(SELECT COUNT(*) FROM updated) = 0" : "true"} RETURNING *),
    line_row AS (SELECT * FROM updated UNION ALL SELECT * FROM inserted LIMIT 1),
    totals AS (SELECT COALESCE(SUM(l.line_total_cents), 0) AS subtotal_cents FROM sales_credit_note_lines l WHERE l.tenant_id = '${escStr(tenantId)}'::uuid AND l.credit_note_id = '${escStr(opts.creditNoteId)}'::uuid),
    credit_updated AS (UPDATE sales_credit_notes c SET subtotal_cents = (SELECT subtotal_cents FROM totals), total_cents = (SELECT subtotal_cents FROM totals), updated_at = NOW() WHERE c.tenant_id = '${escStr(tenantId)}'::uuid AND c.id = '${escStr(opts.creditNoteId)}'::uuid AND c.status = 'DRAFT' RETURNING c.*),
    audit AS (INSERT INTO erp_audit_events (tenant_id, actor_user_id, actor_type, entity_type, entity_id, event_type, trace_id, payload) SELECT '${escStr(tenantId)}'::uuid, ${opts.ctx.actorUserId ? `'${escStr(opts.ctx.actorUserId)}'::uuid` : "NULL"}, '${actorType}', '${escStr(opts.entityType)}', (SELECT id FROM credit_updated)::uuid, '${escStr(opts.eventType)}', ${opts.ctx.traceId ? `'${escStr(opts.ctx.traceId)}'` : "NULL"}, '${payloadJson}'::jsonb FROM credit_updated RETURNING id)
    SELECT (SELECT row_to_json(credit_updated) FROM credit_updated) AS "creditNote", (SELECT id::text FROM line_row) AS line_id, (SELECT line_no FROM line_row) AS line_no
  `));

  const row = result.rows?.[0] as any;
  return row?.creditNote ? { creditNote: row.creditNote as T, lineId: String(row.line_id), lineNo: Number(row.line_no) } : null;
}

/**
 * Atomic Remove Credit Note Line + Recalculate Totals + Audit
 */
export async function atomicRemoveCreditLineAndRecalcWithAudit<T = any>(
  db: Database,
  opts: {
    creditNoteId: string;
    lineNo: number;
    entityType: string;
    eventType: string;
    ctx: ServiceContext;
    payload?: Record<string, unknown>;
  }
): Promise<T | null> {
  const actorType = opts.ctx.actorUserId ? "USER" : "SYSTEM";
  const tenantId = opts.ctx.tenantId;
  const payload = opts.payload ?? { creditNoteId: opts.creditNoteId, lineNo: opts.lineNo };
  const payloadJson = escStr(JSON.stringify(payload));

  const result = await db.execute(sql.raw(`
    WITH draft_guard AS (SELECT id FROM sales_credit_notes WHERE tenant_id = '${escStr(tenantId)}'::uuid AND id = '${escStr(opts.creditNoteId)}'::uuid AND status = 'DRAFT' LIMIT 1),
    deleted AS (DELETE FROM sales_credit_note_lines l WHERE l.tenant_id = '${escStr(tenantId)}'::uuid AND l.credit_note_id = (SELECT id FROM draft_guard) AND l.line_no = ${opts.lineNo} RETURNING l.*),
    totals AS (SELECT COALESCE(SUM(l.line_total_cents), 0) AS subtotal_cents FROM sales_credit_note_lines l WHERE l.tenant_id = '${escStr(tenantId)}'::uuid AND l.credit_note_id = '${escStr(opts.creditNoteId)}'::uuid),
    credit_updated AS (UPDATE sales_credit_notes c SET subtotal_cents = (SELECT subtotal_cents FROM totals), total_cents = (SELECT subtotal_cents FROM totals), updated_at = NOW() WHERE c.tenant_id = '${escStr(tenantId)}'::uuid AND c.id = (SELECT id FROM draft_guard) RETURNING c.*),
    audit AS (INSERT INTO erp_audit_events (tenant_id, actor_user_id, actor_type, entity_type, entity_id, event_type, trace_id, payload) SELECT '${escStr(tenantId)}'::uuid, ${opts.ctx.actorUserId ? `'${escStr(opts.ctx.actorUserId)}'::uuid` : "NULL"}, '${actorType}', '${escStr(opts.entityType)}', (SELECT id FROM credit_updated)::uuid, '${escStr(opts.eventType)}', ${opts.ctx.traceId ? `'${escStr(opts.ctx.traceId)}'` : "NULL"}, '${payloadJson}'::jsonb FROM credit_updated RETURNING id)
    SELECT credit_updated.* FROM credit_updated
  `));

  return (result.rows?.[0] as T) ?? null;
}

/**
 * Atomic Issue Credit Note + Cap Enforcement + Audit
 * CRITICAL: Enforces cap (SUM(issued credits) + new ≤ invoice total)
 */
export async function atomicIssueCreditWithAudit<T = any>(
  db: Database,
  opts: { creditNoteId: string; entityType: string; eventType: string; ctx: ServiceContext }
): Promise<T | null> {
  const actorType = opts.ctx.actorUserId ? "USER" : "SYSTEM";
  const tenantId = opts.ctx.tenantId;
  const currentYear = new Date().getFullYear();

  const result = await db.execute(sql.raw(`
    WITH target_credit AS (SELECT c.* FROM sales_credit_notes c WHERE c.tenant_id = '${escStr(tenantId)}'::uuid AND c.id = '${escStr(opts.creditNoteId)}'::uuid AND c.status = 'DRAFT' LIMIT 1),
    line_count AS (SELECT COUNT(*)::int AS c FROM sales_credit_note_lines l WHERE l.tenant_id = '${escStr(tenantId)}'::uuid AND l.credit_note_id = '${escStr(opts.creditNoteId)}'::uuid),
    invoice_check AS (SELECT i.id AS invoice_id, i.total_cents AS invoice_total, COALESCE((SELECT SUM(c2.total_cents) FROM sales_credit_notes c2 WHERE c2.tenant_id = '${escStr(tenantId)}'::uuid AND c2.source_invoice_id = i.id AND c2.status = 'ISSUED' AND c2.id != '${escStr(opts.creditNoteId)}'::uuid), 0) AS issued_credits_total, (SELECT total_cents FROM target_credit) AS new_credit_total FROM sales_invoices i WHERE i.tenant_id = '${escStr(tenantId)}'::uuid AND i.id = (SELECT source_invoice_id FROM target_credit) LIMIT 1),
    cap_guard AS (SELECT CASE WHEN (SELECT source_invoice_id FROM target_credit) IS NULL THEN true WHEN (SELECT invoice_id FROM invoice_check) IS NULL THEN false WHEN (SELECT issued_credits_total + new_credit_total FROM invoice_check) <= (SELECT invoice_total FROM invoice_check) THEN true ELSE false END AS cap_ok),
    updated AS (UPDATE sales_credit_notes c SET status = 'ISSUED', issued_at = NOW(), updated_at = NOW() WHERE c.tenant_id = '${escStr(tenantId)}'::uuid AND c.id = '${escStr(opts.creditNoteId)}'::uuid AND c.status = 'DRAFT' AND (SELECT c FROM line_count) > 0 AND (SELECT cap_ok FROM cap_guard) = true RETURNING c.*),
    audit AS (INSERT INTO erp_audit_events (tenant_id, actor_user_id, actor_type, entity_type, entity_id, event_type, trace_id, payload) SELECT '${escStr(tenantId)}'::uuid, ${opts.ctx.actorUserId ? `'${escStr(opts.ctx.actorUserId)}'::uuid` : "NULL"}, '${actorType}', '${escStr(opts.entityType)}', updated.id::uuid, '${escStr(opts.eventType)}', ${opts.ctx.traceId ? `'${escStr(opts.ctx.traceId)}'` : "NULL"}, row_to_json(updated)::jsonb FROM updated RETURNING id)
    SELECT updated.* FROM updated
  `));

  return (result.rows?.[0] as T) ?? null;
}

/**
 * Atomic Cancel Credit Note + Audit
 */
export async function atomicCancelCreditWithAudit<T = any>(
  db: Database,
  opts: { creditNoteId: string; entityType: string; eventType: string; ctx: ServiceContext }
): Promise<T | null> {
  const actorType = opts.ctx.actorUserId ? "USER" : "SYSTEM";
  const tenantId = opts.ctx.tenantId;

  const result = await db.execute(sql.raw(`
    WITH updated AS (UPDATE sales_credit_notes c SET status = 'CANCELLED', cancelled_at = NOW(), updated_at = NOW() WHERE c.tenant_id = '${escStr(tenantId)}'::uuid AND c.id = '${escStr(opts.creditNoteId)}'::uuid AND c.status IN ('DRAFT', 'ISSUED') RETURNING c.*),
    audit AS (INSERT INTO erp_audit_events (tenant_id, actor_user_id, actor_type, entity_type, entity_id, event_type, trace_id, payload) SELECT '${escStr(tenantId)}'::uuid, ${opts.ctx.actorUserId ? `'${escStr(opts.ctx.actorUserId)}'::uuid` : "NULL"}, '${actorType}', '${escStr(opts.entityType)}', updated.id::uuid, '${escStr(opts.eventType)}', ${opts.ctx.traceId ? `'${escStr(opts.ctx.traceId)}'` : "NULL"}, row_to_json(updated)::jsonb FROM updated RETURNING id)
    SELECT updated.* FROM updated
  `));

  return (result.rows?.[0] as T) ?? null;
}

/**
 * Atomic Create Credit Note from Invoice + Cap Enforcement + Audit
 * THE BIG ONE WITH CAP: Validates SUM(existing issued credits) + new credit ≤ invoice total
 */
export async function atomicCreateCreditFromInvoiceWithAudit<T = any>(
  db: Database,
  opts: {
    invoiceId: string;
    creditNo: string;
    requiredInvoiceStatus?: "ISSUED";
    entityType: string;
    eventType: string;
    ctx: ServiceContext;
  }
): Promise<T | null> {
  const tenantId = opts.ctx.tenantId;
  const actorType = opts.ctx.actorUserId ? "USER" : "SYSTEM";
  const required = opts.requiredInvoiceStatus ?? "ISSUED";

  const result = await db.execute(sql.raw(`
    WITH src_invoice AS (SELECT i.* FROM sales_invoices i WHERE i.tenant_id = '${escStr(tenantId)}'::uuid AND i.id = '${escStr(opts.invoiceId)}'::uuid AND i.status = '${escStr(required)}' LIMIT 1),
    line_count AS (SELECT COUNT(*)::int AS c FROM sales_invoice_lines l WHERE l.tenant_id = '${escStr(tenantId)}'::uuid AND l.invoice_id = '${escStr(opts.invoiceId)}'::uuid),
    existing_credits AS (SELECT COALESCE(SUM(c.total_cents), 0) AS issued_total FROM sales_credit_notes c WHERE c.tenant_id = '${escStr(tenantId)}'::uuid AND c.source_invoice_id = '${escStr(opts.invoiceId)}'::uuid AND c.status = 'ISSUED'),
    cap_check AS (SELECT (SELECT issued_total FROM existing_credits) AS existing_credits_total, (SELECT total_cents FROM src_invoice) AS invoice_total, CASE WHEN (SELECT issued_total FROM existing_credits) + (SELECT total_cents FROM src_invoice) <= (SELECT total_cents FROM src_invoice) THEN true ELSE false END AS cap_ok),
    inserted_credit AS (INSERT INTO sales_credit_notes (tenant_id, credit_no, status, partner_id, currency, source_invoice_id, reason, subtotal_cents, total_cents, notes, issued_at, cancelled_at, created_at, updated_at) SELECT '${escStr(tenantId)}'::uuid, '${escStr(opts.creditNo)}', 'DRAFT', (SELECT partner_id FROM src_invoice)::uuid, (SELECT currency FROM src_invoice), (SELECT id FROM src_invoice)::uuid, 'Created from invoice', (SELECT total_cents FROM src_invoice)::int, (SELECT total_cents FROM src_invoice)::int, (SELECT notes FROM src_invoice), NULL, NULL, NOW(), NOW() WHERE (SELECT id FROM src_invoice) IS NOT NULL AND (SELECT c FROM line_count) > 0 AND (SELECT cap_ok FROM cap_check) = true RETURNING *),
    inserted_lines AS (INSERT INTO sales_credit_note_lines (tenant_id, credit_note_id, line_no, product_id, description, uom_id, qty, unit_price_cents, line_total_cents, created_at, updated_at) SELECT '${escStr(tenantId)}'::uuid, (SELECT id FROM inserted_credit)::uuid, l.line_no, l.product_id, l.description, l.uom_id, l.qty, l.unit_price_cents, l.line_total_cents, NOW(), NOW() FROM sales_invoice_lines l WHERE l.tenant_id = '${escStr(tenantId)}'::uuid AND l.invoice_id = '${escStr(opts.invoiceId)}'::uuid RETURNING id),
    audit AS (INSERT INTO erp_audit_events (tenant_id, actor_user_id, actor_type, entity_type, entity_id, event_type, trace_id, payload) SELECT '${escStr(tenantId)}'::uuid, ${opts.ctx.actorUserId ? `'${escStr(opts.ctx.actorUserId)}'::uuid` : "NULL"}, '${actorType}', '${escStr(opts.entityType)}', (SELECT id FROM inserted_credit)::uuid, '${escStr(opts.eventType)}', ${opts.ctx.traceId ? `'${escStr(opts.ctx.traceId)}'` : "NULL"}, jsonb_build_object('invoiceId', '${escStr(opts.invoiceId)}', 'creditNo', '${escStr(opts.creditNo)}', 'copiedLines', (SELECT COUNT(*) FROM inserted_lines), 'capEnforced', true) FROM inserted_credit RETURNING id)
    SELECT inserted_credit.* FROM inserted_credit
  `));

  return (result.rows?.[0] as T) ?? null;
}
