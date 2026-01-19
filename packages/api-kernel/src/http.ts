// packages/api-kernel/src/http.ts
// HTTP envelope helpers for standardized responses

import { NextResponse } from "next/server";
import type { SuccessEnvelope, ErrorEnvelope } from "./types";
import { type ErrorCodeType, getHttpStatus } from "./errors";

/**
 * Create a success response envelope.
 */
export function ok<T>(
  data: T,
  traceId: string
): NextResponse<SuccessEnvelope<T>> {
  const envelope: SuccessEnvelope<T> = {
    data,
    meta: { traceId },
  };
  return NextResponse.json(envelope, { status: 200 });
}

/**
 * Create an error response envelope.
 */
export function fail(
  code: ErrorCodeType,
  message: string,
  traceId: string,
  options?: {
    details?: Record<string, unknown>;
    fieldErrors?: Record<string, string[]>;
    status?: number;
  }
): NextResponse<ErrorEnvelope> {
  const envelope: ErrorEnvelope = {
    error: {
      code,
      message,
      traceId,
      ...(options?.details && { details: options.details }),
      ...(options?.fieldErrors && { fieldErrors: options.fieldErrors }),
    },
  };

  const status = options?.status ?? getHttpStatus(code);
  return NextResponse.json(envelope, { status });
}

/**
 * Create a validation error response from Zod errors.
 */
export function validationError(
  fieldErrors: Record<string, string[]>,
  traceId: string
): NextResponse<ErrorEnvelope> {
  return fail("VALIDATION_ERROR", "Validation failed", traceId, {
    fieldErrors,
  });
}
