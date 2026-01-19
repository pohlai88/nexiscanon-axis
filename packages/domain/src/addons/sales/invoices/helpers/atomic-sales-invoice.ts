// packages/domain/src/addons/sales/invoices/helpers/atomic-sales-invoice.ts
// Sales Invoice Atomic Helpers - Multi-table CTE operations
//
// CRITICAL: These guarantee atomicity for operations that touch:
// - sales_invoice_lines (insert/update/delete)
// - sales_invoices.subtotal_cents/total_cents (recomputed)
// - erp_audit_events (audit trail)
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
 * Atomic Upsert Invoice Line + Recalculate Totals + Audit
 * 
 * Single-statement CTE that:
 * 1. Enforces DRAFT status (immutability guard)
 * 2. Upserts line (update existing or insert new)
 * 3. Recomputes invoice subtotal/total from all lines
 * 4. Emits audit event
 * 
 * Returns: { invoice, lineId, lineNo } or null if not DRAFT
 */
export async function atomicUpsertInvoiceLineAndRecalcWithAudit<T = any>(
  db: Database,
  opts: {
    invoiceId: string;
    lineNo?: number; // if absent → append
    productId?: string | null;
    description: string;
    uomId: string;
    qtyNumericSql: string; // numeric literal, e.g. "1.250000"
    unitPriceCents: number;
    lineTotalCents: number;
    entityType: string; // "erp.sales.invoice"
    eventType: string;  // "erp.sales.invoice.line.upserted"
    ctx: ServiceContext;
    payload?: Record<string, unknown>;
  }
): Promise<{ invoice: T; lineId: string; lineNo: number } | null> {
  const actorType = opts.ctx.actorUserId ? "USER" : "SYSTEM";
  const tenantId = opts.ctx.tenantId;

  const payload = opts.payload ?? {
    invoiceId: opts.invoiceId,
    lineNo: opts.lineNo ?? null,
    unitPriceCents: opts.unitPriceCents,
    lineTotalCents: opts.lineTotalCents,
  };
  const payloadJson = escStr(JSON.stringify(payload));

  // If lineNo omitted → append as MAX(line_no)+1
  const lineNoExpr = opts.lineNo
    ? String(opts.lineNo)
    : `(
        SELECT COALESCE(MAX(l.line_no), 0) + 1
        FROM sales_invoice_lines l
        WHERE l.tenant_id = '${escStr(tenantId)}'::uuid
          AND l.invoice_id = '${escStr(opts.invoiceId)}'::uuid
      )`;

  const isExplicitLineNo = typeof opts.lineNo === "number";

  const result = await db.execute(
    sql.raw(`
      WITH
      target_invoice AS (
        SELECT id
        FROM sales_invoices
        WHERE tenant_id = '${escStr(tenantId)}'::uuid
          AND id = '${escStr(opts.invoiceId)}'::uuid
        LIMIT 1
      ),
      draft_guard AS (
        SELECT i.id
        FROM sales_invoices i
        JOIN target_invoice ti ON ti.id = i.id
        WHERE i.status = 'DRAFT'
      ),
      updated AS (
        ${
          isExplicitLineNo
            ? `
          UPDATE sales_invoice_lines l
          SET
            product_id = ${opts.productId ? `'${escStr(opts.productId)}'::uuid` : "NULL"},
            description = '${escStr(opts.description)}',
            uom_id = '${escStr(opts.uomId)}'::uuid,
            qty = ${opts.qtyNumericSql}::numeric,
            unit_price_cents = ${opts.unitPriceCents},
            line_total_cents = ${opts.lineTotalCents},
            updated_at = NOW()
          WHERE l.tenant_id = '${escStr(tenantId)}'::uuid
            AND l.invoice_id = (SELECT id FROM draft_guard)
            AND l.line_no = ${opts.lineNo}
          RETURNING l.*
        `
            : `SELECT NULL::uuid AS id WHERE false`
        }
      ),
      inserted AS (
        INSERT INTO sales_invoice_lines (
          tenant_id, invoice_id, line_no,
          product_id, description, uom_id,
          qty, unit_price_cents, line_total_cents,
          created_at, updated_at
        )
        SELECT
          '${escStr(tenantId)}'::uuid,
          (SELECT id FROM draft_guard),
          ${lineNoExpr},
          ${opts.productId ? `'${escStr(opts.productId)}'::uuid` : "NULL"},
          '${escStr(opts.description)}',
          '${escStr(opts.uomId)}'::uuid,
          ${opts.qtyNumericSql}::numeric,
          ${opts.unitPriceCents},
          ${opts.lineTotalCents},
          NOW(), NOW()
        WHERE (SELECT id FROM draft_guard) IS NOT NULL
          AND ${isExplicitLineNo ? "(SELECT COUNT(*) FROM updated) = 0" : "true"}
        RETURNING *
      ),
      line_row AS (
        SELECT * FROM updated
        UNION ALL
        SELECT * FROM inserted
        LIMIT 1
      ),
      totals AS (
        SELECT COALESCE(SUM(l.line_total_cents), 0) AS subtotal_cents
        FROM sales_invoice_lines l
        WHERE l.tenant_id = '${escStr(tenantId)}'::uuid
          AND l.invoice_id = '${escStr(opts.invoiceId)}'::uuid
      ),
      invoice_updated AS (
        UPDATE sales_invoices i
        SET
          subtotal_cents = (SELECT subtotal_cents FROM totals),
          total_cents = (SELECT subtotal_cents FROM totals),
          updated_at = NOW()
        WHERE i.tenant_id = '${escStr(tenantId)}'::uuid
          AND i.id = '${escStr(opts.invoiceId)}'::uuid
          AND i.status = 'DRAFT'
        RETURNING i.*
      ),
      audit AS (
        INSERT INTO erp_audit_events (
          tenant_id, actor_user_id, actor_type,
          entity_type, entity_id, event_type,
          trace_id, payload
        )
        SELECT
          '${escStr(tenantId)}'::uuid,
          ${opts.ctx.actorUserId ? `'${escStr(opts.ctx.actorUserId)}'::uuid` : "NULL"},
          '${actorType}',
          '${escStr(opts.entityType)}',
          (SELECT id FROM invoice_updated)::uuid,
          '${escStr(opts.eventType)}',
          ${opts.ctx.traceId ? `'${escStr(opts.ctx.traceId)}'` : "NULL"},
          '${payloadJson}'::jsonb
        FROM invoice_updated
        RETURNING id
      )
      SELECT
        (SELECT row_to_json(invoice_updated) FROM invoice_updated) AS "invoice",
        (SELECT id::text FROM line_row) AS line_id,
        (SELECT line_no FROM line_row) AS line_no
    `)
  );

  const row = result.rows?.[0] as any;
  if (!row?.invoice) {
    return null;
  }

  return {
    invoice: row.invoice as T,
    lineId: String(row.line_id),
    lineNo: Number(row.line_no),
  };
}

/**
 * Atomic Remove Invoice Line + Recalculate Totals + Audit
 * 
 * Single-statement CTE that:
 * 1. Enforces DRAFT status
 * 2. Deletes line
 * 3. Recomputes invoice subtotal/total from remaining lines
 * 4. Emits audit event
 */
export async function atomicRemoveInvoiceLineAndRecalcWithAudit<T = any>(
  db: Database,
  opts: {
    invoiceId: string;
    lineNo: number;
    entityType: string;
    eventType: string; // "erp.sales.invoice.line.removed"
    ctx: ServiceContext;
    payload?: Record<string, unknown>;
  }
): Promise<T | null> {
  const actorType = opts.ctx.actorUserId ? "USER" : "SYSTEM";
  const tenantId = opts.ctx.tenantId;

  const payload = opts.payload ?? { invoiceId: opts.invoiceId, lineNo: opts.lineNo };
  const payloadJson = escStr(JSON.stringify(payload));

  const result = await db.execute(
    sql.raw(`
      WITH
      draft_guard AS (
        SELECT id
        FROM sales_invoices
        WHERE tenant_id = '${escStr(tenantId)}'::uuid
          AND id = '${escStr(opts.invoiceId)}'::uuid
          AND status = 'DRAFT'
        LIMIT 1
      ),
      deleted AS (
        DELETE FROM sales_invoice_lines l
        WHERE l.tenant_id = '${escStr(tenantId)}'::uuid
          AND l.invoice_id = (SELECT id FROM draft_guard)
          AND l.line_no = ${opts.lineNo}
        RETURNING l.*
      ),
      totals AS (
        SELECT COALESCE(SUM(l.line_total_cents), 0) AS subtotal_cents
        FROM sales_invoice_lines l
        WHERE l.tenant_id = '${escStr(tenantId)}'::uuid
          AND l.invoice_id = '${escStr(opts.invoiceId)}'::uuid
      ),
      invoice_updated AS (
        UPDATE sales_invoices i
        SET subtotal_cents = (SELECT subtotal_cents FROM totals),
            total_cents = (SELECT subtotal_cents FROM totals),
            updated_at = NOW()
        WHERE i.tenant_id = '${escStr(tenantId)}'::uuid
          AND i.id = (SELECT id FROM draft_guard)
        RETURNING i.*
      ),
      audit AS (
        INSERT INTO erp_audit_events (
          tenant_id, actor_user_id, actor_type,
          entity_type, entity_id, event_type,
          trace_id, payload
        )
        SELECT
          '${escStr(tenantId)}'::uuid,
          ${opts.ctx.actorUserId ? `'${escStr(opts.ctx.actorUserId)}'::uuid` : "NULL"},
          '${actorType}',
          '${escStr(opts.entityType)}',
          (SELECT id FROM invoice_updated)::uuid,
          '${escStr(opts.eventType)}',
          ${opts.ctx.traceId ? `'${escStr(opts.ctx.traceId)}'` : "NULL"},
          '${payloadJson}'::jsonb
        FROM invoice_updated
        RETURNING id
      )
      SELECT invoice_updated.* FROM invoice_updated
    `)
  );

  return (result.rows?.[0] as T) ?? null;
}

/**
 * Atomic Issue Invoice + Audit
 * 
 * Single-statement CTE that:
 * 1. Enforces DRAFT status
 * 2. Enforces at least 1 line exists
 * 3. Transitions to ISSUED
 * 4. Sets issued_at timestamp
 * 5. Emits audit event
 */
export async function atomicIssueInvoiceWithAudit<T = any>(
  db: Database,
  opts: {
    invoiceId: string;
    entityType: string;
    eventType: string; // "erp.sales.invoice.issued"
    ctx: ServiceContext;
  }
): Promise<T | null> {
  const actorType = opts.ctx.actorUserId ? "USER" : "SYSTEM";
  const tenantId = opts.ctx.tenantId;

  const result = await db.execute(
    sql.raw(`
      WITH
      line_count AS (
        SELECT COUNT(*)::int AS c
        FROM sales_invoice_lines l
        WHERE l.tenant_id = '${escStr(tenantId)}'::uuid
          AND l.invoice_id = '${escStr(opts.invoiceId)}'::uuid
      ),
      updated AS (
        UPDATE sales_invoices i
        SET status = 'ISSUED',
            issued_at = NOW(),
            updated_at = NOW()
        WHERE i.tenant_id = '${escStr(tenantId)}'::uuid
          AND i.id = '${escStr(opts.invoiceId)}'::uuid
          AND i.status = 'DRAFT'
          AND (SELECT c FROM line_count) > 0
        RETURNING i.*
      ),
      audit AS (
        INSERT INTO erp_audit_events (
          tenant_id, actor_user_id, actor_type,
          entity_type, entity_id, event_type,
          trace_id, payload
        )
        SELECT
          '${escStr(tenantId)}'::uuid,
          ${opts.ctx.actorUserId ? `'${escStr(opts.ctx.actorUserId)}'::uuid` : "NULL"},
          '${actorType}',
          '${escStr(opts.entityType)}',
          updated.id::uuid,
          '${escStr(opts.eventType)}',
          ${opts.ctx.traceId ? `'${escStr(opts.ctx.traceId)}'` : "NULL"},
          row_to_json(updated)::jsonb
        FROM updated
        RETURNING id
      )
      SELECT updated.* FROM updated
    `)
  );

  return (result.rows?.[0] as T) ?? null;
}

/**
 * Atomic Cancel Invoice + Audit
 * 
 * Single-statement CTE that:
 * 1. Enforces DRAFT or ISSUED status
 * 2. Transitions to CANCELLED
 * 3. Sets cancelled_at timestamp
 * 4. Emits audit event
 */
export async function atomicCancelInvoiceWithAudit<T = any>(
  db: Database,
  opts: {
    invoiceId: string;
    entityType: string;
    eventType: string; // "erp.sales.invoice.cancelled"
    ctx: ServiceContext;
  }
): Promise<T | null> {
  const actorType = opts.ctx.actorUserId ? "USER" : "SYSTEM";
  const tenantId = opts.ctx.tenantId;

  const result = await db.execute(
    sql.raw(`
      WITH
      updated AS (
        UPDATE sales_invoices i
        SET status = 'CANCELLED',
            cancelled_at = NOW(),
            updated_at = NOW()
        WHERE i.tenant_id = '${escStr(tenantId)}'::uuid
          AND i.id = '${escStr(opts.invoiceId)}'::uuid
          AND i.status IN ('DRAFT', 'ISSUED')
        RETURNING i.*
      ),
      audit AS (
        INSERT INTO erp_audit_events (
          tenant_id, actor_user_id, actor_type,
          entity_type, entity_id, event_type,
          trace_id, payload
        )
        SELECT
          '${escStr(tenantId)}'::uuid,
          ${opts.ctx.actorUserId ? `'${escStr(opts.ctx.actorUserId)}'::uuid` : "NULL"},
          '${actorType}',
          '${escStr(opts.entityType)}',
          updated.id::uuid,
          '${escStr(opts.eventType)}',
          ${opts.ctx.traceId ? `'${escStr(opts.ctx.traceId)}'` : "NULL"},
          row_to_json(updated)::jsonb
        FROM updated
        RETURNING id
      )
      SELECT updated.* FROM updated
    `)
  );

  return (result.rows?.[0] as T) ?? null;
}

/**
 * Atomic Create Invoice from Order + Audit
 * 
 * THE BIG ONE: Single-statement CTE that:
 * 1. Validates order exists, tenant-scoped, status = CONFIRMED
 * 2. Ensures order has at least 1 line
 * 3. Inserts invoice header (copies partner, currency, totals from order)
 * 4. Bulk inserts all order lines → invoice lines (preserving line_no)
 * 5. Emits audit event
 * 
 * If any step fails → entire operation rolls back (no partial invoice)
 * 
 * Returns: invoice header with lines (or null if preconditions not met)
 */
export async function atomicCreateInvoiceFromOrderWithAudit<T = any>(
  db: Database,
  opts: {
    orderId: string;
    invoiceNo: string;                // generated by SequenceService ("sales.invoice")
    requiredOrderStatus?: "CONFIRMED"; // default CONFIRMED
    entityType: string;                // "erp.sales.invoice"
    eventType: string;                 // "erp.sales.invoice.created_from_order"
    ctx: ServiceContext;
  }
): Promise<T | null> {
  const tenantId = opts.ctx.tenantId;
  const actorType = opts.ctx.actorUserId ? "USER" : "SYSTEM";
  const required = opts.requiredOrderStatus ?? "CONFIRMED";

  const result = await db.execute(
    sql.raw(`
      WITH
      -- 1) Ensure order exists + tenant-scoped + correct status
      src_order AS (
        SELECT o.*
        FROM sales_orders o
        WHERE o.tenant_id = '${escStr(tenantId)}'::uuid
          AND o.id = '${escStr(opts.orderId)}'::uuid
          AND o.status = '${escStr(required)}'
        LIMIT 1
      ),

      -- 2) Ensure order has at least one line
      line_count AS (
        SELECT COUNT(*)::int AS c
        FROM sales_order_lines l
        WHERE l.tenant_id = '${escStr(tenantId)}'::uuid
          AND l.order_id = '${escStr(opts.orderId)}'::uuid
      ),

      -- 3) Insert invoice header from order
      inserted_invoice AS (
        INSERT INTO sales_invoices (
          tenant_id,
          invoice_no,
          status,
          partner_id,
          currency,
          source_order_id,
          subtotal_cents,
          total_cents,
          notes,
          issued_at,
          cancelled_at,
          created_at,
          updated_at
        )
        SELECT
          '${escStr(tenantId)}'::uuid,
          '${escStr(opts.invoiceNo)}',
          'DRAFT',
          (SELECT partner_id FROM src_order)::uuid,
          (SELECT currency FROM src_order),
          (SELECT id FROM src_order)::uuid,
          (SELECT total_cents FROM src_order)::int,
          (SELECT total_cents FROM src_order)::int,
          (SELECT notes FROM src_order),
          NULL,
          NULL,
          NOW(),
          NOW()
        WHERE (SELECT id FROM src_order) IS NOT NULL
          AND (SELECT c FROM line_count) > 0
        RETURNING *
      ),

      -- 4) Copy order lines → invoice lines (preserve line_no)
      inserted_lines AS (
        INSERT INTO sales_invoice_lines (
          tenant_id,
          invoice_id,
          line_no,
          product_id,
          description,
          uom_id,
          qty,
          unit_price_cents,
          line_total_cents,
          created_at,
          updated_at
        )
        SELECT
          '${escStr(tenantId)}'::uuid,
          (SELECT id FROM inserted_invoice)::uuid,
          l.line_no,
          l.product_id,
          l.description,
          l.uom_id,
          l.qty,
          l.unit_price_cents,
          l.line_total_cents,
          NOW(),
          NOW()
        FROM sales_order_lines l
        WHERE l.tenant_id = '${escStr(tenantId)}'::uuid
          AND l.order_id = '${escStr(opts.orderId)}'::uuid
        RETURNING id
      ),

      -- 5) Audit in same statement (entity + audit inseparable)
      audit AS (
        INSERT INTO erp_audit_events (
          tenant_id, actor_user_id, actor_type,
          entity_type, entity_id, event_type,
          trace_id, payload
        )
        SELECT
          '${escStr(tenantId)}'::uuid,
          ${opts.ctx.actorUserId ? `'${escStr(opts.ctx.actorUserId)}'::uuid` : "NULL"},
          '${actorType}',
          '${escStr(opts.entityType)}',
          (SELECT id FROM inserted_invoice)::uuid,
          '${escStr(opts.eventType)}',
          ${opts.ctx.traceId ? `'${escStr(opts.ctx.traceId)}'` : "NULL"},
          jsonb_build_object(
            'orderId', '${escStr(opts.orderId)}',
            'invoiceNo', '${escStr(opts.invoiceNo)}',
            'copiedLines', (SELECT COUNT(*) FROM inserted_lines)
          )
        FROM inserted_invoice
        RETURNING id
      )

      SELECT inserted_invoice.* FROM inserted_invoice
    `)
  );

  return (result.rows?.[0] as T) ?? null;
}
