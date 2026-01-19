// packages/observability/src/errors.ts
// GlitchTip (Sentry) error capture wrapper (env-gated)

import type { RequestContext } from "./context";
import { getActiveTraceId } from "./tracing";

type CaptureCtx = Partial<
  Pick<
    RequestContext,
    "traceId" | "requestId" | "tenantId" | "actorId" | "routeId"
  >
> & {
  extra?: Record<string, unknown>;
};

function hasSentryEnabled(): boolean {
  return !!process.env.SENTRY_DSN;
}

/**
 * Capture an exception to GlitchTip/Sentry (env-gated, zero-crash).
 * 
 * **Safety guarantees:**
 * - No SENTRY_DSN → no-op (returns immediately)
 * - SENTRY_DSN present but @sentry/nextjs not installed → silent no-op
 * - Any capture failure → silent no-op (observability never crashes app)
 * 
 * **When enabled:**
 * Attaches correlation tags with `axis.*` prefix:
 * - axis.trace_id, axis.request_id, axis.tenant_id, axis.actor_id, axis.route_id
 * 
 * **Dependencies:**
 * Requires @sentry/nextjs to be installed when SENTRY_DSN is set.
 */
export function captureException(err: unknown, ctx?: CaptureCtx): void {
  // Guard: no env = no-op
  if (!hasSentryEnabled()) return;

  try {
    // Lazy require: only executes when env is present
    // If @sentry/nextjs is not installed, this throws and we catch below
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Sentry = require("@sentry/nextjs");

    const traceId = ctx?.traceId ?? getActiveTraceId();

    Sentry.withScope(
      (scope: {
        setTag: (key: string, value: string) => void;
        setContext: (key: string, value: Record<string, unknown>) => void;
      }) => {
        // Correlation tags (axis.* prefix for consistency)
        if (traceId) scope.setTag("axis.trace_id", traceId);
        if (ctx?.requestId) scope.setTag("axis.request_id", ctx.requestId);
        if (ctx?.tenantId) scope.setTag("axis.tenant_id", ctx.tenantId);
        if (ctx?.actorId) scope.setTag("axis.actor_id", ctx.actorId);
        if (ctx?.routeId) scope.setTag("axis.route_id", ctx.routeId);

        // Extra context
        if (ctx?.extra) scope.setContext("extra", ctx.extra);

        Sentry.captureException(err);
      }
    );
  } catch {
    // Silent no-op if:
    // - @sentry/nextjs not installed (require throws)
    // - Sentry misconfigured (API calls throw)
    // - Any other capture failure
    // 
    // Observability must never crash the application.
  }
}
