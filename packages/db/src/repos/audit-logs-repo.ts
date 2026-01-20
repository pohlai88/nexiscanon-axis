// packages/db/src/repos/audit-logs-repo.ts
// Audit logs repository (append-only, tenant-scoped)

import { eq, and, inArray, sql } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "../schema";
import { auditLogs } from "../schema";

export type AuditAppendInput = {
  tenantId: string;
  actorId: string;
  traceId: string;
  eventName: string;
  eventData: unknown;
};

export type AuditLogRow = {
  id: string;
  tenantId: string | null;
  actorId: string | null;
  traceId: string | null;
  eventName: string;
  eventData: string | null; // JSON string
  createdAt: Date;
};

export type AuditLogsRepository = {
  append(input: AuditAppendInput): Promise<void>;
  findByRequestId(params: {
    tenantId: string;
    requestId: string;
  }): Promise<AuditLogRow[]>;
  findByTraceId(params: {
    tenantId: string;
    traceId: string;
  }): Promise<AuditLogRow[]>;
};

export function createAuditLogsRepository(
  db: PostgresJsDatabase<typeof schema>
): AuditLogsRepository {
  return {
    async append(input) {
      await db.insert(auditLogs).values({
        tenantId: input.tenantId,
        actorId: input.actorId,
        traceId: input.traceId,
        eventName: input.eventName,
        eventData: JSON.stringify(input.eventData),
      });
    },

    async findByRequestId(params) {
      // Query audit logs where:
      // - tenantId matches (tenant-scoped)
      // - eventData contains the requestId (JSON query)
      const rows = await db
        .select()
        .from(auditLogs)
        .where(
          and(
            eq(auditLogs.tenantId, params.tenantId),
            sql`${auditLogs.eventData}::jsonb->>'requestId' = ${params.requestId}`
          )
        )
        .orderBy(auditLogs.createdAt);

      return rows as AuditLogRow[];
    },

    async findByTraceId(params) {
      // Query audit logs where:
      // - tenantId matches (tenant-scoped)
      // - traceId matches
      const rows = await db
        .select()
        .from(auditLogs)
        .where(
          and(
            eq(auditLogs.tenantId, params.tenantId),
            eq(auditLogs.traceId, params.traceId)
          )
        )
        .orderBy(auditLogs.createdAt);

      return rows as AuditLogRow[];
    },
  };
}
