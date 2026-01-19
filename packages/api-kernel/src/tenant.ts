// packages/api-kernel/src/tenant.ts
// Single canonical tenant resolver

import { KernelError, ErrorCode } from "./errors";

/** Tenant resolution result */
export type TenantResult = {
  tenantId: string | undefined;
};

/**
 * Resolve tenant from request.
 * Checks headers in order: X-Tenant-ID, x-tenant-id
 * Can be extended to check subdomain, path, etc.
 */
export function resolveTenant(request: Request): TenantResult {
  // Check headers (case-insensitive)
  const tenantId =
    request.headers.get("X-Tenant-ID") ??
    request.headers.get("x-tenant-id") ??
    undefined;

  return { tenantId };
}

/**
 * Enforce tenant requirement.
 * Throws KernelError if tenant is required but not present.
 */
export function enforceTenant(
  tenantId: string | undefined,
  required: boolean
): void {
  if (required && !tenantId) {
    throw new KernelError(
      ErrorCode.TENANT_REQUIRED,
      "Tenant ID is required for this endpoint"
    );
  }
}
