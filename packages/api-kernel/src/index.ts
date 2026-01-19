// packages/api-kernel/src/index.ts
// API Kernel package exports

// Core kernel function
export { kernel } from "./kernel";

// Types
export type {
  HttpMethod,
  TenantConfig,
  AuthConfig,
  HandlerContext,
  RouteSpec,
  SuccessEnvelope,
  ErrorEnvelope,
  ApiResponse,
} from "./types";

// HTTP helpers
export { ok, fail, validationError } from "./http";

// Errors
export {
  ErrorCode,
  type ErrorCodeType,
  getHttpStatus,
  KernelError,
  normalizeError,
} from "./errors";

// Tenant
export { resolveTenant, enforceTenant } from "./tenant";

// Auth
export { extractAuth, enforceAuth, type AuthResult } from "./auth";
