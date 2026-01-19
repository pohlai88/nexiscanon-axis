// packages/domain/src/addons/erp.base/helpers/atomic-audit.ts
// Atomic audit helper - guarantees entity + audit atomicity via CTE
//
// CRITICAL: This is the ONLY way ERP services should write entities
// Prevents "entity changed but audit missing" compliance failures

import { sql } from "drizzle-orm";
import type { Database } from "@workspace/db";
import type { ServiceContext } from "../types";

/**
 * Execute entity mutation with atomic audit using CTE
 *
 * @example
 * const uom = await atomicInsertWithAudit(db, {
 *   table: 'erp_uoms',
 *   values: { tenant_id: ctx.tenantId, code: 'KG', name: 'Kilogram', ... },
 *   entityType: 'erp.base.uom',
 *   eventType: 'erp.base.uom.created',
 *   ctx,
 * });
 */
export async function atomicInsertWithAudit<T = any>(
  db: Database,
  opts: {
    table: string;
    values: Record<string, any>;
    entityType: string;
    eventType: string;
    ctx: ServiceContext;
  }
): Promise<T> {
  const actorType = opts.ctx.actorUserId ? "USER" : "SYSTEM";

  // Build atomic CTE: INSERT entity + INSERT audit
  const result = await db.execute(sql.raw(`
    WITH inserted AS (
      INSERT INTO ${opts.table}
      (${Object.keys(opts.values).join(", ")})
      VALUES
      (${Object.values(opts.values)
        .map((v) => {
          if (v === null || v === undefined) return "NULL";
          if (typeof v === "string") return `'${v.replace(/'/g, "''")}'`;
          if (typeof v === "boolean") return v ? "true" : "false";
          return String(v);
        })
        .join(", ")})
      RETURNING *
    ),
    audit AS (
      INSERT INTO erp_audit_events (
        tenant_id, actor_user_id, actor_type,
        entity_type, entity_id, event_type,
        trace_id, payload
      )
      SELECT
        '${opts.ctx.tenantId}'::uuid,
        ${opts.ctx.actorUserId ? `'${opts.ctx.actorUserId}'::uuid` : "NULL"},
        '${actorType}',
        '${opts.entityType}',
        inserted.id::uuid,
        '${opts.eventType}',
        ${opts.ctx.traceId ? `'${opts.ctx.traceId}'` : "NULL"},
        row_to_json(inserted)::jsonb
      FROM inserted
      RETURNING id
    )
    SELECT inserted.* FROM inserted
  `));

  return result.rows[0] as T;
}

/**
 * Execute entity update with atomic audit using CTE
 *
 * @example
 * const uom = await atomicUpdateWithAudit(db, {
 *   table: 'erp_uoms',
 *   set: { name: 'Kilograms' },
 *   where: { id: uomId, tenant_id: ctx.tenantId },
 *   entityType: 'erp.base.uom',
 *   eventType: 'erp.base.uom.updated',
 *   ctx,
 * });
 */
export async function atomicUpdateWithAudit<T = any>(
  db: Database,
  opts: {
    table: string;
    set: Record<string, any>;
    where: Record<string, any>;
    entityType: string;
    eventType: string;
    ctx: ServiceContext;
    payload?: Record<string, unknown>; // Optional custom payload
  }
): Promise<T | null> {
  const actorType = opts.ctx.actorUserId ? "USER" : "SYSTEM";

  // Build SET clause
  const setClauses = Object.entries(opts.set)
    .map(([key, value]) => {
      if (value === null || value === undefined) return `${key} = NULL`;
      if (typeof value === "string") return `${key} = '${value.replace(/'/g, "''")}'`;
      if (typeof value === "boolean") return `${key} = ${value ? "true" : "false"}`;
      return `${key} = ${value}`;
    })
    .join(", ");

  // Build WHERE clause
  const whereClauses = Object.entries(opts.where)
    .map(([key, value]) => {
      if (value === null) return `${key} IS NULL`;
      if (typeof value === "string") return `${key} = '${value.replace(/'/g, "''")}'`;
      return `${key} = ${value}`;
    })
    .join(" AND ");

  // Build payload (use custom or default to changes)
  const payload = opts.payload ?? { changes: opts.set };

  const result = await db.execute(sql.raw(`
    WITH updated AS (
      UPDATE ${opts.table}
      SET ${setClauses}
      WHERE ${whereClauses}
      RETURNING *
    ),
    audit AS (
      INSERT INTO erp_audit_events (
        tenant_id, actor_user_id, actor_type,
        entity_type, entity_id, event_type,
        trace_id, payload
      )
      SELECT
        '${opts.ctx.tenantId}'::uuid,
        ${opts.ctx.actorUserId ? `'${opts.ctx.actorUserId}'::uuid` : "NULL"},
        '${actorType}',
        '${opts.entityType}',
        updated.id::uuid,
        '${opts.eventType}',
        ${opts.ctx.traceId ? `'${opts.ctx.traceId}'` : "NULL"},
        '${JSON.stringify(payload).replace(/'/g, "''")}'::jsonb
      FROM updated
      RETURNING id
    )
    SELECT updated.* FROM updated
  `));

  return result.rows[0] as T | null;
}
