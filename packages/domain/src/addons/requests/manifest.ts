// packages/domain/src/addons/requests/manifest.ts
// Requests addon: handles request lifecycle (DRAFT -> SUBMITTED -> APPROVED)

import type { AddonManifest } from "../../types";
import { CORE_TOKENS } from "../core/manifest";
import { REQUESTS_TOKENS, type RequestService, type RequestRepository } from "./tokens";
import type { Request, RequestCreateInput } from "./types";

// Re-export types for convenience
export type {
  RequestStatus,
  Request,
  RequestCreateInput,
  RequestApproveInput,
} from "./types";
export type { RequestService, RequestRepository } from "./tokens";

// ---- Requests Addon Manifest ----

export const requestsAddon: AddonManifest = {
  id: "requests",
  version: "0.1.0",
  dependsOn: ["core"],

  async register({ provide, container, events: _ }) {
    const auditService = container.get(CORE_TOKENS.AuditService);

    // RequestRepository: in-memory stub (will be swapped with Drizzle implementation)
    provide(REQUESTS_TOKENS.RequestRepository, () => {
      // In-memory store (temporary until DATABASE_URL is wired)
      const store = new Map<string, Request>();

      const repo: RequestRepository = {
        async create(tenantId, input) {
          const id = crypto.randomUUID();
          const now = new Date().toISOString();

          const request: Request = {
            id,
            tenantId,
            requesterId: input.requesterId,
            status: "SUBMITTED",
            createdAt: now,
          };

          store.set(`${tenantId}:${id}`, request);
          return request;
        },

        async findById(tenantId, requestId) {
          return store.get(`${tenantId}:${requestId}`) ?? null;
        },

        async approve(tenantId, requestId, approverId) {
          const existing = store.get(`${tenantId}:${requestId}`);
          if (!existing) {
            throw new Error(`Request not found: ${requestId}`);
          }

          const now = new Date().toISOString();
          const approved: Request = {
            ...existing,
            status: "APPROVED",
            approvedAt: now,
            approvedBy: approverId,
          };

          store.set(`${tenantId}:${requestId}`, approved);
          return approved;
        },
      };

      return repo;
    });

    // RequestService: manages request lifecycle (uses repository port)
    provide(REQUESTS_TOKENS.RequestService, () => {
      const repo = container.get(REQUESTS_TOKENS.RequestRepository);

      const service: RequestService = {
        async create(ctx, input) {
          if (!ctx.tenantId) {
            throw new Error("Tenant ID required");
          }

          // Delegate to repository
          const request = await repo.create(ctx.tenantId, input);

          // EVI018: Emit audit event with full policy context
          const policySource = (request as any)._policySource || "default";
          await auditService.write({
            name: "request.created",
            ctx,
            data: {
              requestId: request.id,
              requesterId: input.requesterId,
              templateId: input.templateId ?? null,
              effectivePolicy: {
                evidenceRequiredForApproval:
                  request.evidenceRequiredForApproval ?? false,
                evidenceTtlSeconds: request.evidenceTtlSeconds ?? null,
              },
              source: policySource,
            },
          });

          return request;
        },

        async approve(ctx, input) {
          if (!ctx.tenantId) {
            throw new Error("Tenant ID required");
          }

          // Delegate to repository
          const request = await repo.approve(
            ctx.tenantId,
            input.requestId,
            input.approverId
          );

          // Emit audit event
          await auditService.write({
            name: "request.approved",
            ctx,
            data: { requestId: input.requestId, approverId: input.approverId },
          });

          return request;
        },

        async getById(ctx, requestId) {
          if (!ctx.tenantId) {
            throw new Error("Tenant ID required");
          }

          return repo.findById(ctx.tenantId, requestId);
        },
      };

      return service;
    });
  },
};
