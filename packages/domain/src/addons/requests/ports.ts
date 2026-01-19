// packages/domain/src/addons/requests/ports.ts
// Repository port for request persistence

import type { Request, RequestCreateInput } from "./manifest";

/**
 * RequestRepository port - persistence abstraction for requests.
 * Implementations: in-memory (current), Drizzle (next).
 */
export interface RequestRepository {
  /** Create a new request in SUBMITTED state */
  create(tenantId: string, input: RequestCreateInput): Promise<Request>;

  /** Find request by ID (tenant-scoped) */
  findById(tenantId: string, requestId: string): Promise<Request | null>;

  /** Update request to APPROVED state */
  approve(
    tenantId: string,
    requestId: string,
    approverId: string
  ): Promise<Request>;
}
