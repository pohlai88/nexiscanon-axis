// packages/domain/src/addons/requests/tokens.ts
// Token constants for requests addon (single source of truth)

import { token } from "../../container";
import type { RequestContext } from "../../types";
import type { Request, RequestCreateInput, RequestApproveInput } from "./types";

// Forward declare interfaces to break circular dependency
export interface RequestService {
  create(ctx: RequestContext, input: RequestCreateInput): Promise<Request>;
  approve(ctx: RequestContext, input: RequestApproveInput): Promise<Request>;
  getById(ctx: RequestContext, requestId: string): Promise<Request | null>;
}

export interface RequestRepository {
  create(tenantId: string, input: RequestCreateInput): Promise<Request>;
  findById(tenantId: string, requestId: string): Promise<Request | null>;
  approve(tenantId: string, requestId: string, approverId: string): Promise<Request>;
}

/**
 * Requests addon tokens.
 * Use these constants everywhere to prevent token string drift.
 */
export const REQUESTS_TOKENS = {
  /** Request domain service */
  RequestService: token<RequestService>("domain.requests.RequestService"),

  /** Request repository port (implementation bound at composition root) */
  RequestRepository: token<RequestRepository>(
    "domain.requests.RequestRepository"
  ),
} as const;
