// apps/web/instrumentation.ts
// Next.js instrumentation hook for OpenTelemetry (env-gated)
// https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation

export async function register() {
  // Only enable when endpoint is provided.
  // This makes OTel optional - dev works fine without any OTEL_* envs.
  if (!process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
    return;
  }

  // Lazy imports keep dev smooth when OTEL isn't configured.
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

  // Add OTLP exporter
  provider.addSpanProcessor(
    new BatchSpanProcessor(
      new OTLPTraceExporter({
        url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
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
}
