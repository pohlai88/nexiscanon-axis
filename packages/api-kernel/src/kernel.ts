// packages/api-kernel/src/kernel.ts
// The single anti-drift pipeline wrapper

import type { NextRequest } from "next/server";
import { type z } from "zod";
import {
  runWithContext,
  generateId,
  getLogger,
  getActiveTraceId,
  markSpanError,
  setSpanAttributes,
  captureException,
} from "@workspace/observability";
import type { RouteSpec, HandlerContext } from "./types";
import { ok, fail } from "./http";
import { ErrorCode, KernelError, normalizeError } from "./errors";
import { resolveTenant, enforceTenant } from "./tenant";
import { extractAuth, enforceAuth } from "./auth";

/**
 * Parse query parameters from URL search params.
 */
function parseQuery(request: NextRequest): Record<string, unknown> {
  const url = new URL(request.url);
  const query: Record<string, unknown> = {};

  url.searchParams.forEach((value, key) => {
    // Handle array params (key[] or repeated keys)
    if (key.endsWith("[]")) {
      const cleanKey = key.slice(0, -2);
      const existing = query[cleanKey];
      if (Array.isArray(existing)) {
        existing.push(value);
      } else {
        query[cleanKey] = [value];
      }
    } else if (query[key] !== undefined) {
      // Repeated key without [] - convert to array
      const existing = query[key];
      if (Array.isArray(existing)) {
        existing.push(value);
      } else {
        query[key] = [existing, value];
      }
    } else {
      query[key] = value;
    }
  });

  return query;
}

/**
 * Parse request body as JSON.
 */
async function parseBody(request: NextRequest): Promise<unknown> {
  const contentType = request.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    return undefined;
  }

  try {
    return await request.json();
  } catch {
    throw new KernelError(ErrorCode.INVALID_INPUT, "Invalid JSON body");
  }
}

/**
 * Validate data against a Zod schema.
 * Returns parsed data or throws KernelError with field errors.
 */
function validateSchema<T extends z.ZodTypeAny>(
  schema: T | undefined,
  data: unknown,
  schemaName: string
): z.infer<T> | undefined {
  if (!schema) {
    return undefined;
  }

  const result = schema.safeParse(data);

  if (!result.success) {
    const fieldErrors: Record<string, string[]> = {};

    for (const issue of result.error.issues) {
      const path = issue.path.join(".") || schemaName;
      if (!fieldErrors[path]) {
        fieldErrors[path] = [];
      }
      fieldErrors[path].push(issue.message);
    }

    throw new KernelError(
      ErrorCode.VALIDATION_ERROR,
      `${schemaName} validation failed`,
      undefined,
      fieldErrors
    );
  }

  return result.data;
}

/**
 * Create a kernel-wrapped route handler.
 * This is THE ONLY allowed pattern for route handlers.
 */
export function kernel<
  TQuery extends z.ZodTypeAny,
  TBody extends z.ZodTypeAny,
  TOutput extends z.ZodTypeAny,
>(
  spec: RouteSpec<TQuery, TBody, TOutput>
): (
  request: NextRequest,
  context: { params: Promise<Record<string, string | string[]>> }
) => Promise<Response> {
  return async (request, routeContext) => {
    // Generate IDs
    const traceId = getActiveTraceId() ?? generateId();
    const requestId = generateId();

    // Create initial context
    const ctx: {
      traceId: string;
      requestId: string;
      routeId: string;
      method: string;
      tenantId?: string;
      actorId?: string;
      roles?: string[];
    } = {
      traceId,
      requestId,
      routeId: spec.routeId,
      method: spec.method,
    };

    // Run handler within ALS context
    return runWithContext(ctx as any, async () => {
      const log = getLogger();

      try {
        // Set span attributes for observability
        setSpanAttributes({
          "route.id": spec.routeId,
          "http.method": spec.method,
        });

        // Resolve tenant
        const { tenantId } = resolveTenant(request);
        ctx.tenantId = tenantId;

        // Enforce tenant if required
        enforceTenant(tenantId, spec.tenant?.required ?? false);

        // Extract and enforce auth
        const auth = await extractAuth(request);
        ctx.actorId = auth.actorId;
        ctx.roles = auth.roles;

        enforceAuth(auth, spec.auth);

        // Set more span attributes after resolution
        setSpanAttributes({
          "tenant.id": tenantId ?? "none",
          "actor.id": auth.actorId ?? "anonymous",
        });

        // Parse inputs
        const rawQuery = parseQuery(request);
        const rawBody = await parseBody(request);

        // Validate inputs
        const query = validateSchema(spec.query, rawQuery, "query");
        const body = validateSchema(spec.body, rawBody, "body");

        // Await route params
        const params = await routeContext.params;

        // Build handler context
        const handlerCtx: HandlerContext<z.infer<TQuery>, z.infer<TBody>> = {
          query: query as z.infer<TQuery>,
          body: body as z.infer<TBody>,
          params,
          ctx,
          tenantId,
          actorId: auth.actorId,
          roles: auth.roles,
          rawRequest: request,
        };

        // Log request start
        log.info(
          { query: rawQuery, hasBody: rawBody !== undefined },
          "Request started"
        );

        // Execute handler
        const result = await spec.handler(handlerCtx);

        // Validate output
        const output = spec.output.safeParse(result);

        if (!output.success) {
          log.error({ error: output.error }, "Output validation failed");
          throw new KernelError(
            ErrorCode.INTERNAL_ERROR,
            "Response validation failed"
          );
        }

        // Log success
        log.info("Request completed successfully");

        // Return success envelope
        return ok(output.data, traceId);
      } catch (error) {
        // Mark span as errored
        if (error instanceof Error) {
          markSpanError(error);
        }

        // Normalize error
        const kernelError = normalizeError(error);

        // Log error ONCE (with full context)
        log.error(
          {
            error: {
              code: kernelError.code,
              message: kernelError.message,
              details: kernelError.details,
            },
          },
          "Request failed"
        );

        // Capture to GlitchTip ONCE (env-gated)
        captureException(error, {
          traceId: ctx.traceId,
          requestId: ctx.requestId,
          tenantId: ctx.tenantId,
          actorId: ctx.actorId,
          routeId: ctx.routeId,
          extra: {
            code: kernelError.code,
            details: kernelError.details,
            fieldErrors: kernelError.fieldErrors,
          },
        });

        // Return error envelope
        return fail(kernelError.code, kernelError.message, traceId, {
          details: kernelError.details,
          fieldErrors: kernelError.fieldErrors,
        });
      }
    });
  };
}
