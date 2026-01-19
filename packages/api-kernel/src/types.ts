// packages/api-kernel/src/types.ts
// RouteSpec types for the kernel pattern

import type { z } from "zod";
import type { RequestContext } from "@workspace/observability";

/** HTTP methods supported by Next.js Route Handlers */
export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS";

/** Tenant configuration for a route */
export type TenantConfig = {
  /** Whether tenant is required for this route */
  required: boolean;
};

/** Auth configuration for a route */
export type AuthConfig = {
  /** Auth mode: public (no auth), optional (auth if present), required (must be authenticated) */
  mode: "public" | "optional" | "required";
  /** Required roles (only checked if mode is required or optional with auth present) */
  roles?: string[];
};

/** Handler context passed to the route handler */
export type HandlerContext<TQuery = unknown, TBody = unknown> = {
  /** Parsed and validated query parameters */
  query: TQuery;
  /** Parsed and validated request body */
  body: TBody;
  /** Route parameters from URL segments */
  params: Record<string, string | string[]>;
  /** Request context from ALS */
  ctx: RequestContext;
  /** Tenant ID (if tenant is required or resolved) */
  tenantId: string | undefined;
  /** Actor ID (authenticated user ID) */
  actorId: string | undefined;
  /** Actor roles */
  roles: string[];
  /** Raw Next.js request (escape hatch - prefer not to use) */
  rawRequest: Request;
};

/** Route specification passed to kernel() */
export type RouteSpec<
  TQuery extends z.ZodTypeAny = z.ZodTypeAny,
  TBody extends z.ZodTypeAny = z.ZodTypeAny,
  TOutput extends z.ZodTypeAny = z.ZodTypeAny,
> = {
  /** HTTP method (for logging/metrics; not enforced at runtime) */
  method: HttpMethod;
  /** Stable route identifier for logs, errors, metrics */
  routeId: string;
  /** Tenant configuration */
  tenant?: TenantConfig;
  /** Auth configuration */
  auth?: AuthConfig;
  /** Zod schema for query parameters */
  query?: TQuery;
  /** Zod schema for request body */
  body?: TBody;
  /** Zod schema for response output (required) */
  output: TOutput;
  /** Route handler - receives validated input, returns data matching output schema */
  handler: (
    ctx: HandlerContext<z.infer<TQuery>, z.infer<TBody>>
  ) => Promise<z.infer<TOutput>>;
};

/** Success envelope shape */
export type SuccessEnvelope<T> = {
  data: T;
  meta: {
    traceId: string;
  };
};

/** Error envelope shape */
export type ErrorEnvelope = {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    fieldErrors?: Record<string, string[]>;
    traceId: string;
  };
};

/** API response is either success or error envelope */
export type ApiResponse<T> = SuccessEnvelope<T> | ErrorEnvelope;
