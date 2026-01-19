// packages/db/src/repos/requests-repo.ts
// Drizzle implementation of RequestRepository port

import { and, eq } from "drizzle-orm";
import type { RequestRepository } from "@workspace/domain/addons/requests/ports";
import type {
  Request,
  RequestCreateInput,
} from "@workspace/domain/addons/requests/manifest";
import { requests } from "../schema";
import type { Database } from "../client";

/**
 * Create Drizzle-backed RequestRepository.
 * All queries are tenant-scoped (enforces tenant discipline).
 */
export function createRequestsRepo(db: Database): RequestRepository {
  return {
    async create(
      tenantId: string,
      input: RequestCreateInput
    ): Promise<Request> {
      const now = new Date();

      const [row] = await db
        .insert(requests)
        .values({
          tenantId,
          requesterId: input.requesterId,
          status: "SUBMITTED",
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      return {
        id: row.id,
        tenantId: row.tenantId,
        requesterId: row.requesterId,
        status: row.status as "SUBMITTED",
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      };
    },

    async findById(
      tenantId: string,
      requestId: string
    ): Promise<Request | null> {
      const [row] = await db
        .select()
        .from(requests)
        .where(and(eq(requests.tenantId, tenantId), eq(requests.id, requestId)))
        .limit(1);

      if (!row) return null;

      return {
        id: row.id,
        tenantId: row.tenantId,
        requesterId: row.requesterId,
        status: row.status as "SUBMITTED" | "APPROVED" | "REJECTED",
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
        approvedAt: row.approvedAt?.toISOString(),
        approvedBy: row.approvedBy ?? undefined,
      };
    },

    async approve(
      tenantId: string,
      requestId: string,
      approverId: string
    ): Promise<Request> {
      const now = new Date();

      const [row] = await db
        .update(requests)
        .set({
          status: "APPROVED",
          approvedAt: now,
          approvedBy: approverId,
          updatedAt: now,
        })
        .where(and(eq(requests.tenantId, tenantId), eq(requests.id, requestId)))
        .returning();

      if (!row) {
        throw new Error(`Request not found: ${requestId}`);
      }

      return {
        id: row.id,
        tenantId: row.tenantId,
        requesterId: row.requesterId,
        status: "APPROVED",
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
        approvedAt: row.approvedAt!.toISOString(),
        approvedBy: row.approvedBy!,
      };
    },
  };
}
