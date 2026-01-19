// packages/domain/src/addons/sales/orders/helpers/atomic-sales-order.ts
// Sales Order Atomic Helpers - Multi-table CTE operations
//
// CRITICAL: These guarantee atomicity for operations that touch:
// - sales_order_lines (insert/update/delete)
// - sales_orders.total_cents (recomputed)
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
 * Atomic Upsert Order Line + Recalculate Total + Audit
 * 
 * Single-statement CTE that:
 * 1. Enforces DRAFT status (immutability guard)
 * 2. Upserts line (update existing or insert new)
 * 3. Recomputes order total from all lines
 * 4. Emits audit event
 * 
 * Returns: { order, lineId, lineNo } or null if not DRAFT
 */
export async function atomicUpsertOrderLineAndRecalcWithAudit<T = any>(
  db: Database,
  opts: {
    orderId: string;
    lineNo?: number; // if absent → append
    productId?: string | null;
    description: string;
    uomId: string;
    qtyNumericSql: string; // numeric literal, e.g. "1.250000"
    unitPriceCents: number;
    lineTotalCents: number;
    entityType: string; // "erp.sales.order"
    eventType: string;  // "erp.sales.order.line.upserted"
    ctx: ServiceContext;
    payload?: Record<string, unknown>;
  }
): Promise<{ order: T; lineId: string; lineNo: number } | null> {
  const actorType = opts.ctx.actorUserId ? "USER" : "SYSTEM";
  const tenantId = opts.ctx.tenantId;

  const payload = opts.payload ?? {
    orderId: opts.orderId,
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
        FROM sales_order_lines l
        WHERE l.tenant_id = '${escStr(tenantId)}'::uuid
          AND l.order_id = '${escStr(opts.orderId)}'::uuid
      )`;

  const isExplicitLineNo = typeof opts.lineNo === "number";

  const result = await db.execute(
    sql.raw(`
      WITH
      target_order AS (
        SELECT id
        FROM sales_orders
        WHERE tenant_id = '${escStr(tenantId)}'::uuid
          AND id = '${escStr(opts.orderId)}'::uuid
        LIMIT 1
      ),
      draft_guard AS (
        SELECT o.id
        FROM sales_orders o
        JOIN target_order tq ON tq.id = o.id
        WHERE o.status = 'DRAFT'
      ),
      updated AS (
        ${
          isExplicitLineNo
            ? `
          UPDATE sales_order_lines l
          SET
            product_id = ${opts.productId ? `'${escStr(opts.productId)}'::uuid` : "NULL"},
            description = '${escStr(opts.description)}',
            uom_id = '${escStr(opts.uomId)}'::uuid,
            qty = ${opts.qtyNumericSql}::numeric,
            unit_price_cents = ${opts.unitPriceCents},
            line_total_cents = ${opts.lineTotalCents},
            updated_at = NOW()
          WHERE l.tenant_id = '${escStr(tenantId)}'::uuid
            AND l.order_id = (SELECT id FROM draft_guard)
            AND l.line_no = ${opts.lineNo}
          RETURNING l.*
        `
            : `SELECT NULL::uuid AS id WHERE false`
        }
      ),
      inserted AS (
        INSERT INTO sales_order_lines (
          tenant_id, order_id, line_no,
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
        FROM sales_order_lines l
        WHERE l.tenant_id = '${escStr(tenantId)}'::uuid
          AND l.order_id = '${escStr(opts.orderId)}'::uuid
      ),
      order_updated AS (
        UPDATE sales_orders o
        SET
          total_cents = (SELECT total_cents FROM totals),
          updated_at = NOW()
        WHERE o.tenant_id = '${escStr(tenantId)}'::uuid
          AND o.id = '${escStr(opts.orderId)}'::uuid
          AND o.status = 'DRAFT'
        RETURNING o.*
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
          (SELECT id FROM order_updated)::uuid,
          '${escStr(opts.eventType)}',
          ${opts.ctx.traceId ? `'${escStr(opts.ctx.traceId)}'` : "NULL"},
          '${payloadJson}'::jsonb
        FROM order_updated
        RETURNING id
      )
      SELECT
        (SELECT row_to_json(order_updated) FROM order_updated) AS "order",
        (SELECT id::text FROM line_row) AS line_id,
        (SELECT line_no FROM line_row) AS line_no
    `)
  );

  const row = result.rows?.[0] as any;
  if (!row?.order) {
    return null;
  }

  return {
    order: row.order as T,
    lineId: String(row.line_id),
    lineNo: Number(row.line_no),
  };
}

/**
 * Atomic Remove Order Line + Recalculate Total + Audit
 * 
 * Single-statement CTE that:
 * 1. Enforces DRAFT status
 * 2. Deletes line
 * 3. Recomputes order total from remaining lines
 * 4. Emits audit event
 */
export async function atomicRemoveOrderLineAndRecalcWithAudit<T = any>(
  db: Database,
  opts: {
    orderId: string;
    lineNo: number;
    entityType: string;
    eventType: string; // "erp.sales.order.line.removed"
    ctx: ServiceContext;
    payload?: Record<string, unknown>;
  }
): Promise<T | null> {
  const actorType = opts.ctx.actorUserId ? "USER" : "SYSTEM";
  const tenantId = opts.ctx.tenantId;

  const payload = opts.payload ?? { orderId: opts.orderId, lineNo: opts.lineNo };
  const payloadJson = escStr(JSON.stringify(payload));

  const result = await db.execute(
    sql.raw(`
      WITH
      draft_guard AS (
        SELECT id
        FROM sales_orders
        WHERE tenant_id = '${escStr(tenantId)}'::uuid
          AND id = '${escStr(opts.orderId)}'::uuid
          AND status = 'DRAFT'
        LIMIT 1
      ),
      deleted AS (
        DELETE FROM sales_order_lines l
        WHERE l.tenant_id = '${escStr(tenantId)}'::uuid
          AND l.order_id = (SELECT id FROM draft_guard)
          AND l.line_no = ${opts.lineNo}
        RETURNING l.*
      ),
      totals AS (
        SELECT COALESCE(SUM(l.line_total_cents), 0) AS total_cents
        FROM sales_order_lines l
        WHERE l.tenant_id = '${escStr(tenantId)}'::uuid
          AND l.order_id = '${escStr(opts.orderId)}'::uuid
      ),
      order_updated AS (
        UPDATE sales_orders o
        SET total_cents = (SELECT total_cents FROM totals),
            updated_at = NOW()
        WHERE o.tenant_id = '${escStr(tenantId)}'::uuid
          AND o.id = (SELECT id FROM draft_guard)
        RETURNING o.*
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
          (SELECT id FROM order_updated)::uuid,
          '${escStr(opts.eventType)}',
          ${opts.ctx.traceId ? `'${escStr(opts.ctx.traceId)}'` : "NULL"},
          '${payloadJson}'::jsonb
        FROM order_updated
        RETURNING id
      )
      SELECT order_updated.* FROM order_updated
    `)
  );

  return (result.rows?.[0] as T) ?? null;
}

/**
 * Atomic Confirm Order + Audit
 * 
 * Single-statement CTE that:
 * 1. Enforces DRAFT status
 * 2. Enforces at least 1 line exists
 * 3. Transitions to CONFIRMED
 * 4. Sets confirmed_at timestamp
 * 5. Emits audit event
 */
export async function atomicConfirmOrderWithAudit<T = any>(
  db: Database,
  opts: {
    orderId: string;
    entityType: string;
    eventType: string; // "erp.sales.order.confirmed"
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
        FROM sales_order_lines l
        WHERE l.tenant_id = '${escStr(tenantId)}'::uuid
          AND l.order_id = '${escStr(opts.orderId)}'::uuid
      ),
      updated AS (
        UPDATE sales_orders o
        SET status = 'CONFIRMED',
            confirmed_at = NOW(),
            updated_at = NOW()
        WHERE o.tenant_id = '${escStr(tenantId)}'::uuid
          AND o.id = '${escStr(opts.orderId)}'::uuid
          AND o.status = 'DRAFT'
          AND (SELECT c FROM line_count) > 0
        RETURNING o.*
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
 * Atomic Cancel Order + Audit
 * 
 * Single-statement CTE that:
 * 1. Enforces DRAFT or CONFIRMED status
 * 2. Transitions to CANCELLED
 * 3. Sets cancelled_at timestamp
 * 4. Emits audit event
 */
export async function atomicCancelOrderWithAudit<T = any>(
  db: Database,
  opts: {
    orderId: string;
    entityType: string;
    eventType: string; // "erp.sales.order.cancelled"
    ctx: ServiceContext;
  }
): Promise<T | null> {
  const actorType = opts.ctx.actorUserId ? "USER" : "SYSTEM";
  const tenantId = opts.ctx.tenantId;

  const result = await db.execute(
    sql.raw(`
      WITH
      updated AS (
        UPDATE sales_orders o
        SET status = 'CANCELLED',
            cancelled_at = NOW(),
            updated_at = NOW()
        WHERE o.tenant_id = '${escStr(tenantId)}'::uuid
          AND o.id = '${escStr(opts.orderId)}'::uuid
          AND o.status IN ('DRAFT', 'CONFIRMED')
        RETURNING o.*
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
 * Atomic Convert Quote to Order + Audit
 * 
 * THE BIG ONE: Single-statement CTE that:
 * 1. Validates quote exists, tenant-scoped, status = ACCEPTED (or SENT if configured)
 * 2. Ensures quote has at least 1 line
 * 3. Inserts order header (copies partner, currency, total from quote)
 * 4. Bulk inserts all quote lines → order lines (preserving line_no)
 * 5. Emits audit event
 * 
 * If any step fails → entire operation rolls back (no partial order)
 * 
 * Returns: order header with lines (or null if preconditions not met)
 */
export async function atomicConvertQuoteToOrderWithAudit<T = any>(
  db: Database,
  opts: {
    quoteId: string;
    orderNo: string;                // generated by SequenceService ("sales.order")
    allowedQuoteStatus?: "ACCEPTED" | "SENT"; // default ACCEPTED
    entityType: string;             // "erp.sales.order"
    eventType: string;              // "erp.sales.order.created_from_quote"
    ctx: ServiceContext;
  }
): Promise<T | null> {
  const tenantId = opts.ctx.tenantId;
  const actorType = opts.ctx.actorUserId ? "USER" : "SYSTEM";
  const allowed = opts.allowedQuoteStatus ?? "ACCEPTED";

  const result = await db.execute(
    sql.raw(`
      WITH
      -- 1) Ensure quote exists + tenant-scoped + correct status
      src_quote AS (
        SELECT q.*
        FROM sales_quotes q
        WHERE q.tenant_id = '${escStr(tenantId)}'::uuid
          AND q.id = '${escStr(opts.quoteId)}'::uuid
          AND q.status = '${escStr(allowed)}'
        LIMIT 1
      ),

      -- 2) Ensure quote has at least one line
      line_count AS (
        SELECT COUNT(*)::int AS c
        FROM sales_quote_lines l
        WHERE l.tenant_id = '${escStr(tenantId)}'::uuid
          AND l.quote_id = '${escStr(opts.quoteId)}'::uuid
      ),

      -- 3) Insert order header from quote
      inserted_order AS (
        INSERT INTO sales_orders (
          tenant_id,
          order_no,
          status,
          partner_id,
          currency,
          source_quote_id,
          total_cents,
          notes,
          confirmed_at,
          cancelled_at,
          created_at,
          updated_at
        )
        SELECT
          '${escStr(tenantId)}'::uuid,
          '${escStr(opts.orderNo)}',
          'DRAFT',
          (SELECT partner_id FROM src_quote)::uuid,
          (SELECT currency FROM src_quote),
          (SELECT id FROM src_quote)::uuid,
          (SELECT total_cents FROM src_quote)::int,
          (SELECT notes FROM src_quote),
          NULL,
          NULL,
          NOW(),
          NOW()
        WHERE (SELECT id FROM src_quote) IS NOT NULL
          AND (SELECT c FROM line_count) > 0
        RETURNING *
      ),

      -- 4) Copy quote lines → order lines (preserve line_no)
      inserted_lines AS (
        INSERT INTO sales_order_lines (
          tenant_id,
          order_id,
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
          (SELECT id FROM inserted_order)::uuid,
          l.line_no,
          l.product_id,
          l.description,
          l.uom_id,
          l.qty,
          l.unit_price_cents,
          l.line_total_cents,
          NOW(),
          NOW()
        FROM sales_quote_lines l
        WHERE l.tenant_id = '${escStr(tenantId)}'::uuid
          AND l.quote_id = '${escStr(opts.quoteId)}'::uuid
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
          (SELECT id FROM inserted_order)::uuid,
          '${escStr(opts.eventType)}',
          ${opts.ctx.traceId ? `'${escStr(opts.ctx.traceId)}'` : "NULL"},
          jsonb_build_object(
            'quoteId', '${escStr(opts.quoteId)}',
            'orderNo', '${escStr(opts.orderNo)}',
            'copiedLines', (SELECT COUNT(*) FROM inserted_lines)
          )
        FROM inserted_order
        RETURNING id
      )

      SELECT inserted_order.* FROM inserted_order
    `)
  );

  return (result.rows?.[0] as T) ?? null;
}
