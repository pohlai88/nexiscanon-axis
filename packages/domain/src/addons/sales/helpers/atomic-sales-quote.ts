// packages/domain/src/addons/sales/helpers/atomic-sales-quote.ts
// Sales Quote Atomic Helpers - Multi-table CTE operations
//
// CRITICAL: These guarantee atomicity for operations that touch:
// - sales_quote_lines (insert/update/delete)
// - sales_quotes.total_cents (recomputed)
// - erp_audit_events (audit trail)
//
// All mutations happen in a single SQL statement (CTE pattern)
// If any part fails, entire operation rolls back

import { sql } from "drizzle-orm";
import type { Database } from "@workspace/db";
import type { ServiceContext } from "../../erp.base/types";

function escStr(v: string): string {
  return v.replace(/'/g, "''");
}

function toSqlValue(v: unknown): string {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "string") return `'${escStr(v)}'`;
  if (typeof v === "boolean") return v ? "true" : "false";
  return String(v);
}

/**
 * Atomic Upsert Quote Line + Recalculate Total + Audit
 * 
 * Single-statement CTE that:
 * 1. Enforces DRAFT status (immutability guard)
 * 2. Upserts line (update existing or insert new)
 * 3. Recomputes quote total from all lines
 * 4. Emits audit event
 * 
 * Returns: { quote, lineId, lineNo } or null if not DRAFT
 */
export async function atomicUpsertQuoteLineAndRecalcWithAudit<T = any>(
  db: Database,
  opts: {
    quoteId: string;
    lineNo?: number; // if absent → append
    productId?: string | null;
    description: string;
    uomId: string;
    qtyNumericSql: string; // numeric literal, e.g. "1.250000"
    unitPriceCents: number;
    lineTotalCents: number;
    entityType: string; // "erp.sales.quote"
    eventType: string;  // "erp.sales.quote.line.upserted"
    ctx: ServiceContext;
    payload?: Record<string, unknown>;
  }
): Promise<{ quote: T; lineId: string; lineNo: number } | null> {
  const actorType = opts.ctx.actorUserId ? "USER" : "SYSTEM";
  const tenantId = opts.ctx.tenantId;

  const payload = opts.payload ?? {
    quoteId: opts.quoteId,
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
        FROM sales_quote_lines l
        WHERE l.tenant_id = '${escStr(tenantId)}'::uuid
          AND l.quote_id = '${escStr(opts.quoteId)}'::uuid
      )`;

  const isExplicitLineNo = typeof opts.lineNo === "number";

  const result = await db.execute(
    sql.raw(`
      WITH
      target_quote AS (
        SELECT id
        FROM sales_quotes
        WHERE tenant_id = '${escStr(tenantId)}'::uuid
          AND id = '${escStr(opts.quoteId)}'::uuid
        LIMIT 1
      ),
      draft_guard AS (
        SELECT q.id
        FROM sales_quotes q
        JOIN target_quote tq ON tq.id = q.id
        WHERE q.status = 'DRAFT'
      ),
      updated AS (
        ${
          isExplicitLineNo
            ? `
          UPDATE sales_quote_lines l
          SET
            product_id = ${opts.productId ? `'${escStr(opts.productId)}'::uuid` : "NULL"},
            description = '${escStr(opts.description)}',
            uom_id = '${escStr(opts.uomId)}'::uuid,
            qty = ${opts.qtyNumericSql}::numeric,
            unit_price_cents = ${opts.unitPriceCents},
            line_total_cents = ${opts.lineTotalCents},
            updated_at = NOW()
          WHERE l.tenant_id = '${escStr(tenantId)}'::uuid
            AND l.quote_id = (SELECT id FROM draft_guard)
            AND l.line_no = ${opts.lineNo}
          RETURNING l.*
        `
            : `SELECT NULL::uuid AS id WHERE false`
        }
      ),
      inserted AS (
        INSERT INTO sales_quote_lines (
          tenant_id, quote_id, line_no,
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
        SELECT COALESCE(SUM(l.line_total_cents), 0) AS total_cents
        FROM sales_quote_lines l
        WHERE l.tenant_id = '${escStr(tenantId)}'::uuid
          AND l.quote_id = '${escStr(opts.quoteId)}'::uuid
      ),
      quote_updated AS (
        UPDATE sales_quotes q
        SET
          total_cents = (SELECT total_cents FROM totals),
          updated_at = NOW()
        WHERE q.tenant_id = '${escStr(tenantId)}'::uuid
          AND q.id = '${escStr(opts.quoteId)}'::uuid
          AND q.status = 'DRAFT'
        RETURNING q.*
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
          (SELECT id FROM quote_updated)::uuid,
          '${escStr(opts.eventType)}',
          ${opts.ctx.traceId ? `'${escStr(opts.ctx.traceId)}'` : "NULL"},
          '${payloadJson}'::jsonb
        FROM quote_updated
        RETURNING id
      )
      SELECT
        (SELECT row_to_json(quote_updated) FROM quote_updated) AS quote,
        (SELECT id::text FROM line_row) AS line_id,
        (SELECT line_no FROM line_row) AS line_no
    `)
  );

  const row = result.rows?.[0] as any;
  if (!row?.quote) {
    return null;
  }

  return {
    quote: row.quote as T,
    lineId: String(row.line_id),
    lineNo: Number(row.line_no),
  };
}

/**
 * Atomic Remove Quote Line + Recalculate Total + Audit
 * 
 * Single-statement CTE that:
 * 1. Enforces DRAFT status
 * 2. Deletes line
 * 3. Recomputes quote total from remaining lines
 * 4. Emits audit event
 */
export async function atomicRemoveQuoteLineAndRecalcWithAudit<T = any>(
  db: Database,
  opts: {
    quoteId: string;
    lineNo: number;
    entityType: string;
    eventType: string; // "erp.sales.quote.line.removed"
    ctx: ServiceContext;
    payload?: Record<string, unknown>;
  }
): Promise<T | null> {
  const actorType = opts.ctx.actorUserId ? "USER" : "SYSTEM";
  const tenantId = opts.ctx.tenantId;

  const payload = opts.payload ?? { quoteId: opts.quoteId, lineNo: opts.lineNo };
  const payloadJson = escStr(JSON.stringify(payload));

  const result = await db.execute(
    sql.raw(`
      WITH
      draft_guard AS (
        SELECT id
        FROM sales_quotes
        WHERE tenant_id = '${escStr(tenantId)}'::uuid
          AND id = '${escStr(opts.quoteId)}'::uuid
          AND status = 'DRAFT'
        LIMIT 1
      ),
      deleted AS (
        DELETE FROM sales_quote_lines l
        WHERE l.tenant_id = '${escStr(tenantId)}'::uuid
          AND l.quote_id = (SELECT id FROM draft_guard)
          AND l.line_no = ${opts.lineNo}
        RETURNING l.*
      ),
      totals AS (
        SELECT COALESCE(SUM(l.line_total_cents), 0) AS total_cents
        FROM sales_quote_lines l
        WHERE l.tenant_id = '${escStr(tenantId)}'::uuid
          AND l.quote_id = '${escStr(opts.quoteId)}'::uuid
      ),
      quote_updated AS (
        UPDATE sales_quotes q
        SET total_cents = (SELECT total_cents FROM totals),
            updated_at = NOW()
        WHERE q.tenant_id = '${escStr(tenantId)}'::uuid
          AND q.id = (SELECT id FROM draft_guard)
        RETURNING q.*
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
          (SELECT id FROM quote_updated)::uuid,
          '${escStr(opts.eventType)}',
          ${opts.ctx.traceId ? `'${escStr(opts.ctx.traceId)}'` : "NULL"},
          '${payloadJson}'::jsonb
        FROM quote_updated
        RETURNING id
      )
      SELECT quote_updated.* FROM quote_updated
    `)
  );

  return (result.rows?.[0] as T) ?? null;
}

/**
 * Atomic Send Quote + Audit
 * 
 * Single-statement CTE that:
 * 1. Enforces DRAFT status
 * 2. Enforces at least 1 line exists
 * 3. Transitions to SENT
 * 4. Sets issued_at timestamp
 * 5. Emits audit event
 */
export async function atomicSendQuoteWithAudit<T = any>(
  db: Database,
  opts: {
    quoteId: string;
    entityType: string;
    eventType: string; // "erp.sales.quote.sent"
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
        FROM sales_quote_lines l
        WHERE l.tenant_id = '${escStr(tenantId)}'::uuid
          AND l.quote_id = '${escStr(opts.quoteId)}'::uuid
      ),
      updated AS (
        UPDATE sales_quotes q
        SET status = 'SENT',
            issued_at = NOW(),
            updated_at = NOW()
        WHERE q.tenant_id = '${escStr(tenantId)}'::uuid
          AND q.id = '${escStr(opts.quoteId)}'::uuid
          AND q.status = 'DRAFT'
          AND (SELECT c FROM line_count) > 0
        RETURNING q.*
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
