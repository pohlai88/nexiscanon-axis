// packages/observability/src/tracing.ts
// OpenTelemetry helpers for trace correlation and error marking

import { trace, SpanStatusCode, type Span } from "@opentelemetry/api";

/**
 * Get the active trace ID from the current OTel context.
 * Returns undefined if no active span exists.
 */
export function getActiveTraceId(): string | undefined {
  const span = trace.getActiveSpan();
  if (!span) return undefined;

  const spanContext = span.spanContext();
  return spanContext.traceId;
}

/**
 * Get the active span from the current OTel context.
 */
export function getActiveSpan(): Span | undefined {
  return trace.getActiveSpan();
}

/**
 * Mark the active span as errored.
 * Records the error and sets the span status to ERROR.
 */
export function markSpanError(error: Error | string): void {
  const span = trace.getActiveSpan();
  if (!span) return;

  if (typeof error === "string") {
    span.setStatus({ code: SpanStatusCode.ERROR, message: error });
  } else {
    span.recordException(error);
    span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
  }
}

/**
 * Add attributes to the active span.
 */
export function setSpanAttributes(
  attributes: Record<string, string | number | boolean>
): void {
  const span = trace.getActiveSpan();
  if (!span) return;

  span.setAttributes(attributes);
}

/**
 * Create a new span and run a function within it.
 */
export async function withSpan<T>(
  name: string,
  fn: (span: Span) => Promise<T>
): Promise<T> {
  const tracer = trace.getTracer("@workspace/observability");
  return tracer.startActiveSpan(name, async (span) => {
    try {
      const result = await fn(span);
      return result;
    } catch (error) {
      if (error instanceof Error) {
        markSpanError(error);
      }
      throw error;
    } finally {
      span.end();
    }
  });
}
