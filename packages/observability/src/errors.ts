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
    // Lazy require @sentry/core: only executes when env is present
    // If @sentry/core is not installed, this throws and we catch below
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { captureException: sentryCaptureException } = require("@sentry/core");

    const traceId = ctx?.traceId ?? getActiveTraceId();

    // Build tags and contexts
    const tags: Record<string, string> = {};
    if (traceId) tags["axis.trace_id"] = traceId;
    if (ctx?.requestId) tags["axis.request_id"] = ctx.requestId;
    if (ctx?.tenantId) tags["axis.tenant_id"] = ctx.tenantId;
    if (ctx?.actorId) tags["axis.actor_id"] = ctx.actorId;
    if (ctx?.routeId) tags["axis.route_id"] = ctx.routeId;

    const contexts: Record<string, Record<string, unknown>> = {};
    if (ctx?.extra) contexts.extra = ctx.extra;

    // Capture exception with tags and contexts
    // Sentry v10+ API: captureException(error, hint)
    sentryCaptureException(err, {
      tags,
      contexts,
    });
  } catch {
    // Silent no-op if:
    // - @sentry/core not installed (require throws)
    // - Sentry misconfigured (API calls throw)
    // - Any other capture failure
    // 
    // Observability must never crash the application.
  }
}
