/**
 * Next.js Instrumentation with OpenTelemetry.
 *
 * Pattern: Distributed tracing via @vercel/otel → Grafana Cloud.
 * Reference: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 *
 * Environment Variables (from .envsamplelocal):
 * - OTEL_EXPORTER_OTLP_ENDPOINT: Grafana Cloud OTLP endpoint
 * - OTEL_EXPORTER_OTLP_HEADERS: Authorization header
 * - OTEL_SERVICE_NAME: Service identifier
 * - OTEL_EXPORTER_OTLP_PROTOCOL: http/protobuf
 */

export async function register() {
  // Only register OpenTelemetry on Node.js runtime
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { registerOTel } = await import("@vercel/otel");

    registerOTel({
      serviceName: process.env.OTEL_SERVICE_NAME ?? "nexuscanon-axis-web",
      instrumentationConfig: {
        fetch: {
          propagateContextUrls: ["*"],
        },
      },
    });

    // Additional Node.js instrumentation
    const { logger } = await import("@/lib/logger");

    logger.info("Instrumentation registered", {
      runtime: "nodejs",
      serviceName: process.env.OTEL_SERVICE_NAME,
      environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
      otelEndpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT ? "configured" : "not-set",
    });

    // Log uncaught exceptions
    process.on("uncaughtException", (error: Error) => {
      logger.error("Uncaught exception", error, { fatal: true });
    });

    // Log unhandled promise rejections
    process.on("unhandledRejection", (reason: unknown) => {
      logger.error("Unhandled rejection", reason, { fatal: false });
    });
  }
}

/**
 * Request error handler (Next.js 15+).
 * Automatically called when a request fails.
 */
export async function onRequestError(
  error: Error,
  request: { path: string; method: string },
  context: { routerKind: string; routeType: string; routePath: string }
) {
  // Only run on Node.js runtime
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { logger } = await import("@/lib/logger");

    logger.error("Request error", error, {
      path: request.path,
      method: request.method,
      routerKind: context.routerKind,
      routeType: context.routeType,
      routePath: context.routePath,
    });

    // Report to error tracking service (GlitchTip/Sentry)
    const { reportError } = await import("@/lib/error-reporting");
    reportError(error, {
      path: request.path,
      method: request.method,
      ...context,
    });
  }
}
