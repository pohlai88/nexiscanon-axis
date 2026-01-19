// packages/observability/src/logger.ts
// Pino logger with automatic correlation key injection from ALS

import pino from "pino";
import { getContext } from "./context";

/**
 * Base Pino logger instance.
 * Use getLogger() for request-scoped logging with correlation keys.
 */
export const baseLogger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  formatters: {
    level(label) {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export type Logger = pino.Logger;

/**
 * Get a request-scoped logger with correlation keys from ALS context.
 * Falls back to base logger if no context is available.
 */
export function getLogger(): Logger {
  const ctx = getContext();

  if (!ctx) {
    return baseLogger;
  }

  // Create child logger with correlation keys
  return baseLogger.child({
    traceId: ctx.traceId,
    requestId: ctx.requestId,
    routeId: ctx.routeId,
    method: ctx.method,
    tenantId: ctx.tenantId,
    actorId: ctx.actorId,
  });
}

/**
 * Create a child logger with additional bindings.
 * Useful for adding component-specific context.
 */
export function createChildLogger(bindings: Record<string, unknown>): Logger {
  return getLogger().child(bindings);
}
