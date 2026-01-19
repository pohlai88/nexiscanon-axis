// packages/domain/src/addons/erp.base/types.ts
// Shared types for erp.base domain services

/**
 * Service context for ERP operations
 * Contains tenant, actor, and trace information
 */
export interface ServiceContext {
  /** Tenant ID (required for all ERP operations) */
  tenantId: string;
  /** User who initiated the action (for audit trail) */
  actorUserId?: string;
  /** OpenTelemetry trace ID for correlation */
  traceId?: string;
  /** Request ID for idempotency */
  requestId?: string;
}

/**
 * Domain error codes for stable error handling
 */
export const ERP_ERROR_CODES = {
  // Unique constraint violations
  UOM_CODE_TAKEN: "ERP_UOM_CODE_TAKEN",
  PARTNER_CODE_TAKEN: "ERP_PARTNER_CODE_TAKEN",
  PRODUCT_SKU_TAKEN: "ERP_PRODUCT_SKU_TAKEN",
  SEQUENCE_KEY_TAKEN: "ERP_SEQUENCE_KEY_TAKEN",

  // Not found errors
  UOM_NOT_FOUND: "ERP_UOM_NOT_FOUND",
  PARTNER_NOT_FOUND: "ERP_PARTNER_NOT_FOUND",
  PRODUCT_NOT_FOUND: "ERP_PRODUCT_NOT_FOUND",
  SEQUENCE_NOT_FOUND: "ERP_SEQUENCE_NOT_FOUND",

  // Business rule violations
  SEQUENCE_CONCURRENT_UPDATE: "ERP_SEQUENCE_CONCURRENT_UPDATE",
  PARTNER_CODE_GENERATION_FAILED: "ERP_PARTNER_CODE_GENERATION_FAILED",
  PRODUCT_SKU_GENERATION_FAILED: "ERP_PRODUCT_SKU_GENERATION_FAILED",
  INVALID_UOM_REFERENCE: "ERP_INVALID_UOM_REFERENCE",
  INVALID_TENANT_ACCESS: "ERP_INVALID_TENANT_ACCESS",
} as const;

export type ErpErrorCode = (typeof ERP_ERROR_CODES)[keyof typeof ERP_ERROR_CODES];

/**
 * Domain error for ERP operations
 */
export class ErpDomainError extends Error {
  constructor(
    public readonly code: ErpErrorCode,
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ErpDomainError";
  }
}
