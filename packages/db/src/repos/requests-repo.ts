// packages/db/src/repos/requests-repo.ts
// Drizzle implementation of RequestRepository port

import { and, eq } from "drizzle-orm";
import type { RequestRepository } from "@workspace/domain/addons/requests/ports";
import type {
  Request,
  RequestCreateInput,
} from "@workspace/domain/addons/requests/manifest";
import { requests, requestTemplates } from "../schema";
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

      // EVI013: Resolve evidence policy (template inheritance + override)
      let evidenceRequiredForApproval = false;
      let evidenceTtlSeconds: number | null = null;
      let hadTemplate = false;

      if (input.templateId) {
        // Load template to inherit policy
        const [template] = await db
          .select()
          .from(requestTemplates)
          .where(
            and(
              eq(requestTemplates.tenantId, tenantId),
              eq(requestTemplates.id, input.templateId)
            )
          )
          .limit(1);

        if (template) {
          hadTemplate = true;
          evidenceRequiredForApproval = template.evidenceRequiredForApproval;
          evidenceTtlSeconds = template.evidenceTtlSeconds;
        }
      }

      // Apply overrides (if provided)
      const hasOverride =
        input.evidenceRequiredForApproval !== undefined ||
        input.evidenceTtlSeconds !== undefined;

      if (input.evidenceRequiredForApproval !== undefined) {
        evidenceRequiredForApproval = input.evidenceRequiredForApproval;
      }
      if (input.evidenceTtlSeconds !== undefined) {
        evidenceTtlSeconds = input.evidenceTtlSeconds;
      }

      const [row] = await db
        .insert(requests)
        .values({
          tenantId,
          requesterId: input.requesterId,
          status: "SUBMITTED",
          evidenceRequiredForApproval, // EVI013: inherited/overridden
          evidenceTtlSeconds, // EVI013: inherited/overridden
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
        evidenceRequiredForApproval: row.evidenceRequiredForApproval,
        evidenceTtlSeconds: row.evidenceTtlSeconds,
        // EVI018: Include metadata for audit source determination
        _policySource: hasOverride
          ? "override"
          : hadTemplate
          ? "template"
          : "default",
      } as Request & { _policySource: string };
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
