// packages/observability/src/index.ts
// Observability package exports

// Context (ALS)
export {
  type RequestContext,
  runWithContext,
  getContext,
  requireContext,
  updateContext,
  generateId,
} from "./context";

// Logger (Pino)
export {
  type Logger,
  baseLogger,
  getLogger,
  createChildLogger,
} from "./logger";

// Tracing (OTel)
export {
  getActiveTraceId,
  getActiveSpan,
  markSpanError,
  setSpanAttributes,
  withSpan,
} from "./tracing";
