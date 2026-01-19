// packages/domain/src/addons/requests/manifest.ts
// Requests addon: handles request lifecycle (DRAFT -> SUBMITTED -> APPROVED)

import type { AddonManifest, RequestContext } from "../../types";
import { CORE_TOKENS } from "../core/manifest";
import { REQUESTS_TOKENS } from "./tokens";
import type { RequestRepository } from "./ports";

// ---- Request Types ----

export type RequestStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";

export interface Request {
  id: string;
  tenantId: string;
  requesterId: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
}

export interface RequestCreateInput {
  requesterId: string;
}

export interface RequestApproveInput {
  requestId: string;
  approverId: string;
}

// ---- Service Interfaces ----

export interface RequestService {
  /** Create a new request in SUBMITTED state */
  create(ctx: RequestContext, input: RequestCreateInput): Promise<Request>;

  /** Approve a request */
  approve(ctx: RequestContext, input: RequestApproveInput): Promise<Request>;

  /** Get request by ID */
  getById(ctx: RequestContext, requestId: string): Promise<Request | null>;
}

// ---- Requests Addon Manifest ----

export const requestsAddon: AddonManifest = {
  id: "requests",
  version: "0.1.0",
  dependsOn: ["core"],

  async register({ provide, container, events }) {
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

          // Emit audit event
          await auditService.write({
            name: "request.created",
            ctx,
            data: { requestId: request.id, status: "SUBMITTED" },
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
