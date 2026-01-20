// packages/api-kernel/src/errors.ts
// Error codes and normalization

/** Standard error codes */
export const ErrorCode = {
  // Validation errors (400)
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_INPUT: "INVALID_INPUT",
  MISSING_REQUIRED_FIELD: "MISSING_REQUIRED_FIELD",

  // Tenant errors (400)
  TENANT_REQUIRED: "TENANT_REQUIRED",
  TENANT_NOT_FOUND: "TENANT_NOT_FOUND",

  // Auth errors (401)
  UNAUTHENTICATED: "UNAUTHENTICATED",
  INVALID_TOKEN: "INVALID_TOKEN",
  SESSION_EXPIRED: "SESSION_EXPIRED",

  // Authorization errors (403)
  FORBIDDEN: "FORBIDDEN",
  INSUFFICIENT_PERMISSIONS: "INSUFFICIENT_PERMISSIONS",

  // Not found errors (404)
  NOT_FOUND: "NOT_FOUND",
  RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND",

  // Conflict errors (409)
  CONFLICT: "CONFLICT",
  ALREADY_EXISTS: "ALREADY_EXISTS",
  VERSION_CONFLICT: "VERSION_CONFLICT",
  EVIDENCE_REQUIRED: "EVIDENCE_REQUIRED", // EVI010: Evidence required for approval
  EVIDENCE_STALE: "EVIDENCE_STALE", // EVI010: Evidence TTL exceeded

  // Rate limit errors (429)
  RATE_LIMITED: "RATE_LIMITED",

  // Internal errors (500)
  INTERNAL_ERROR: "INTERNAL_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
} as const;

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];

/** Map error codes to HTTP status codes */
export function getHttpStatus(code: ErrorCodeType): number {
  switch (code) {
    case ErrorCode.VALIDATION_ERROR:
    case ErrorCode.INVALID_INPUT:
    case ErrorCode.MISSING_REQUIRED_FIELD:
    case ErrorCode.TENANT_REQUIRED:
    case ErrorCode.TENANT_NOT_FOUND:
      return 400;

    case ErrorCode.UNAUTHENTICATED:
    case ErrorCode.INVALID_TOKEN:
    case ErrorCode.SESSION_EXPIRED:
      return 401;

    case ErrorCode.FORBIDDEN:
    case ErrorCode.INSUFFICIENT_PERMISSIONS:
      return 403;

    case ErrorCode.NOT_FOUND:
    case ErrorCode.RESOURCE_NOT_FOUND:
      return 404;

    case ErrorCode.CONFLICT:
    case ErrorCode.ALREADY_EXISTS:
    case ErrorCode.VERSION_CONFLICT:
    case ErrorCode.EVIDENCE_REQUIRED:
    case ErrorCode.EVIDENCE_STALE:
      return 409;

    case ErrorCode.RATE_LIMITED:
      return 429;

    case ErrorCode.INTERNAL_ERROR:
    case ErrorCode.SERVICE_UNAVAILABLE:
    default:
      return 500;
  }
}

/** Kernel error class for controlled error throwing */
export class KernelError extends Error {
  constructor(
    public readonly code: ErrorCodeType,
    message: string,
    public readonly details?: Record<string, unknown>,
    public readonly fieldErrors?: Record<string, string[]>
  ) {
    super(message);
    this.name = "KernelError";
  }

  get status(): number {
    return getHttpStatus(this.code);
  }
}

/** Normalize unknown errors to KernelError */
export function normalizeError(error: unknown): KernelError {
  if (error instanceof KernelError) {
    return error;
  }

  if (error instanceof Error) {
    return new KernelError(ErrorCode.INTERNAL_ERROR, error.message);
  }

  return new KernelError(
    ErrorCode.INTERNAL_ERROR,
    "An unexpected error occurred"
  );
}
