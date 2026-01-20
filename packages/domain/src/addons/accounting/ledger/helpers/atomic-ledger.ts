// packages/domain/src/addons/accounting/ledger/helpers/atomic-ledger.ts
// Atomic Ledger Posting Helper - Single CTE statement
//
// CRITICAL: Guarantees atomicity for:
// - acct_ledger_entries (insert entry)
// - acct_ledger_lines (insert lines)
// - erp_audit_events (audit trail)
// - Balance validation (SUM(debits) == SUM(credits))
//
// All mutations happen in a single SQL statement (CTE pattern)
// If any part fails, entire operation rolls back

import { sql } from "drizzle-orm";
import type { Database } from "@workspace/db";
import type { ServiceContext } from "../../../erp.base/types";

function escStr(v: string): string {
  return v.replace(/'/g, "''");
}

export interface LedgerLine {
  accountCode: string; // AR | SALES_REVENUE | SALES_RETURNS
  dc: "DEBIT" | "CREDIT";
  amountCents: number; // always positive
  description?: string | null;
}

export interface LedgerEntryInput {
  tenantId: string;
  entryNo: string; // from sequence
  sourceType: "SALES_INVOICE" | "SALES_CREDIT_NOTE";
  sourceId: string;
  eventType: string; // e.g., "invoice.issued", "credit.issued"
  currency: string;
  memo?: string | null;
  meta?: Record<string, unknown>;
  lines: LedgerLine[];
}

/**
 * Atomic Post Ledger Entry + Validate Balance + Audit
 * 
 * Single-statement CTE that:
 * 1. Validates balanced entry (SUM(debits) == SUM(credits))
 * 2. Inserts ledger entry header
 * 3. Inserts ledger lines
 * 4. Emits audit event
 * 5. Returns complete entry with lines
 * 
 * Throws if:
 * - Entry is unbalanced
 * - Unique constraint violated (double-posting)
 * - Any line has amountCents <= 0
 */
export async function atomicPostLedgerEntryWithAudit<T = any>(
  db: Database,
  opts: {
    entry: LedgerEntryInput;
    entityType: string; // "erp.accounting.ledger"
    eventType: string; // "ledger.posted"
    ctx: ServiceContext;
    payload?: Record<string, unknown>;
  }
): Promise<{ entryId: string; entry: T } | null> {
  const { entry, entityType, eventType, ctx, payload = {} } = opts;
  const actorType = ctx.actorUserId ? "USER" : "SYSTEM";

  // Validate lines exist
  if (!entry.lines || entry.lines.length === 0) {
    throw new Error("Ledger entry must have at least one line");
  }

  // Validate all amounts are positive
  for (const line of entry.lines) {
    if (line.amountCents <= 0) {
      throw new Error(
        `Invalid line amount: ${line.amountCents} (must be positive)`
      );
    }
  }

  // Calculate totals
  const debitTotal = entry.lines
    .filter((l) => l.dc === "DEBIT")
    .reduce((sum, l) => sum + l.amountCents, 0);

  const creditTotal = entry.lines
    .filter((l) => l.dc === "CREDIT")
    .reduce((sum, l) => sum + l.amountCents, 0);

  // Validate balanced entry
  if (debitTotal !== creditTotal) {
    throw new Error(
      `Unbalanced ledger entry: debits=${debitTotal}, credits=${creditTotal}`
    );
  }

  // Build line values for CTE
  const lineValuesSql = entry.lines
    .map(
      (line, idx) =>
        `(gen_random_uuid(), '${escStr(entry.tenantId)}', entry_cte.id, '${escStr(line.accountCode)}', '${line.dc}', ${line.amountCents}, ${line.description ? `'${escStr(line.description)}'` : "NULL"})`
    )
    .join(",\n    ");

  const metaJson = entry.meta ? JSON.stringify(entry.meta) : "{}";
  const memoSql = entry.memo ? `'${escStr(entry.memo)}'` : "NULL";

  const payloadJson = JSON.stringify({
    ...payload,
    entryNo: entry.entryNo,
    sourceType: entry.sourceType,
    sourceId: entry.sourceId,
    eventType: entry.eventType,
    debitTotal,
    creditTotal,
  });

  const querySql = sql.raw(`
    WITH entry_cte AS (
      INSERT INTO acct_ledger_entries (
        id, tenant_id, entry_no, posted_at, source_type, source_id, event_type, currency, memo, meta
      ) VALUES (
        gen_random_uuid(),
        '${escStr(entry.tenantId)}',
        '${escStr(entry.entryNo)}',
        NOW(),
        '${entry.sourceType}',
        '${escStr(entry.sourceId)}',
        '${escStr(entry.eventType)}',
        '${escStr(entry.currency)}',
        ${memoSql},
        '${escStr(metaJson)}'::jsonb
      )
      RETURNING id, tenant_id, entry_no, posted_at, source_type, source_id, event_type, currency, memo, meta
    ),
    lines_cte AS (
      INSERT INTO acct_ledger_lines (
        id, tenant_id, entry_id, account_code, dc, amount_cents, description
      )
      SELECT * FROM (VALUES
        ${lineValuesSql}
      ) AS t(id, tenant_id, entry_id, account_code, dc, amount_cents, description)
      RETURNING *
    ),
    audit_cte AS (
      INSERT INTO erp_audit_events (
        id, tenant_id, entity_type, entity_id, event_type, actor_type, actor_user_id, actor_system_id, payload, created_at
      ) VALUES (
        gen_random_uuid(),
        '${escStr(entry.tenantId)}',
        '${escStr(entityType)}',
        (SELECT id::text FROM entry_cte),
        '${escStr(eventType)}',
        '${actorType}',
        ${ctx.actorUserId ? `'${escStr(ctx.actorUserId)}'` : "NULL"},
        ${ctx.actorSystemId ? `'${escStr(ctx.actorSystemId)}'` : "NULL"},
        '${escStr(payloadJson)}'::jsonb,
        NOW()
      )
      RETURNING id
    )
    SELECT
      e.id AS "entryId",
      jsonb_build_object(
        'id', e.id,
        'tenantId', e.tenant_id,
        'entryNo', e.entry_no,
        'postedAt', e.posted_at,
        'sourceType', e.source_type,
        'sourceId', e.source_id,
        'eventType', e.event_type,
        'currency', e.currency,
        'memo', e.memo,
        'meta', e.meta,
        'lines', COALESCE(
          (SELECT jsonb_agg(
            jsonb_build_object(
              'id', l.id,
              'accountCode', l.account_code,
              'dc', l.dc,
              'amountCents', l.amount_cents,
              'description', l.description
            )
          ) FROM lines_cte l WHERE l.entry_id = e.id),
          '[]'::jsonb
        )
      ) AS entry
    FROM entry_cte e
  `);

  const result = await db.execute(querySql);
  const row = result.rows[0] as any;

  if (!row) return null;

  return {
    entryId: row.entryId,
    entry: row.entry,
  };
}
