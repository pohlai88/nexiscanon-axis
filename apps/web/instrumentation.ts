// apps/web/instrumentation.ts
// Next.js instrumentation hook for OpenTelemetry + Sentry/GlitchTip (env-gated)
// https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation

export async function register() {
  // Initialize Sentry/GlitchTip if DSN is provided (env-gated, crash-proof)
  if (process.env.SENTRY_DSN) {
    try {
      const Sentry = await import("@sentry/nextjs");
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV ?? "development",
        tracesSampleRate: 0, // Disable tracing (we use OTel for traces)
        // Keep default integrations for error capture, but disable performance monitoring
        integrations: (integrations) =>
          integrations.filter((integration) => integration.name !== "BrowserTracing"),
      });
      console.log("[Sentry] Error tracking initialized (GlitchTip DSN)");
    } catch {
      console.warn(
        "[Sentry] Initialization failed: @sentry/nextjs not installed. Run: pnpm add -w @sentry/nextjs"
      );
    }
  }

  // Initialize OpenTelemetry tracing if endpoint is provided
  if (!process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
    return;
  }

  try {
    // Lazy imports keep dev smooth when OTEL isn't configured.
    // Try/catch protects builds when packages aren't installed yet.
    const { NodeTracerProvider } = await import("@opentelemetry/sdk-trace-node");
    const { BatchSpanProcessor } = await import("@opentelemetry/sdk-trace-base");
    const { OTLPTraceExporter } = await import(
      "@opentelemetry/exporter-trace-otlp-http"
    );
    const { Resource } = await import("@opentelemetry/resources");
    const { SEMRESATTRS_SERVICE_NAME } = await import(
      "@opentelemetry/semantic-conventions"
    );
    const { registerInstrumentations } = await import(
      "@opentelemetry/instrumentation"
    );

    // Create tracer provider
    const provider = new NodeTracerProvider({
      resource: new Resource({
        [SEMRESATTRS_SERVICE_NAME]:
          process.env.OTEL_SERVICE_NAME ?? "nexuscanon-axis-web",
      }),
    });

    // Parse headers from env (Grafana Cloud requires Authorization header)
    const headers: Record<string, string> = {};
    if (process.env.OTEL_EXPORTER_OTLP_HEADERS) {
      // Format: "key1=value1,key2=value2" or single "Authorization=Basic <base64>"
      const headerPairs = process.env.OTEL_EXPORTER_OTLP_HEADERS.split(",");
      for (const pair of headerPairs) {
        const [key, ...valueParts] = pair.split("=");
        if (key && valueParts.length > 0) {
          headers[key.trim()] = valueParts.join("=").trim();
        }
      }
    }

    // Add OTLP exporter with headers
    provider.addSpanProcessor(
      new BatchSpanProcessor(
        new OTLPTraceExporter({
          url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
          headers,
        })
      )
    );

    // Register the provider globally
    provider.register();

    // Register instrumentations (empty for Phase 1)
    // Later: add @opentelemetry/instrumentation-http, fetch, undici, etc.
    registerInstrumentations({ instrumentations: [] });

    console.log(
      `[OTel] Tracing initialized: ${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}`
    );
  } catch {
    // Non-fatal: OTel packages not installed
    // Dev/build proceeds; instrumentation is disabled with a warning
    // Use console.warn (not logger) because instrumentation runs before app bootstrap
    console.warn(
      "[OTel] Instrumentation disabled: packages not installed. Run: pnpm add -w @opentelemetry/sdk-trace-node @opentelemetry/sdk-trace-base @opentelemetry/exporter-trace-otlp-http @opentelemetry/resources @opentelemetry/semantic-conventions @opentelemetry/instrumentation"
    );
  }
}
