/**
 * Structured logging utility.
 *
 * Pattern: JSON-formatted logs for observability.
 * Compatible with Vercel, BetterStack, Datadog, and other log aggregators.
 *
 * Usage:
 *   import { logger } from "@/lib/logger";
 *   logger.info("User logged in", { userId: "123", tenant: "acme" });
 *   logger.error("Payment failed", { error, orderId: "456" });
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  /** Request ID for correlation */
  requestId?: string;
  /** Tenant slug */
  tenant?: string;
  /** User ID */
  userId?: string;
  /** Additional context */
  [key: string]: unknown;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  service: string;
  environment: string;
  version: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

/**
 * Get the current log level from environment.
 * Default: "info" in production, "debug" in development.
 */
function getLogLevel(): LogLevel {
  const envLevel = process.env.LOG_LEVEL?.toLowerCase();
  if (envLevel && ["debug", "info", "warn", "error"].includes(envLevel)) {
    return envLevel as LogLevel;
  }
  return process.env.NODE_ENV === "production" ? "info" : "debug";
}

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Check if a log level should be output.
 */
function shouldLog(level: LogLevel): boolean {
  const currentLevel = getLogLevel();
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[currentLevel];
}

/**
 * Format an error for structured logging.
 */
function formatError(error: unknown): LogEntry["error"] | undefined {
  if (!error) return undefined;

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    name: "UnknownError",
    message: String(error),
  };
}

/**
 * Create a log entry.
 */
function createLogEntry(
  level: LogLevel,
  message: string,
  context?: LogContext,
  error?: unknown
): LogEntry {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    service: "nexuscanon-axis",
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development",
    version: process.env.npm_package_version ?? "0.0.1",
  };

  if (context && Object.keys(context).length > 0) {
    entry.context = context;
  }

  if (error !== undefined) {
    entry.error = formatError(error);
  }

  return entry;
}

/**
 * Output a log entry.
 * Uses console methods for Vercel compatibility.
 */
function output(entry: LogEntry): void {
  const json = JSON.stringify(entry);

  switch (entry.level) {
    case "debug":
      console.debug(json);
      break;
    case "info":
      console.info(json);
      break;
    case "warn":
      console.warn(json);
      break;
    case "error":
      console.error(json);
      break;
  }
}

/**
 * Structured logger instance.
 */
export const logger = {
  /**
   * Debug level - development only.
   */
  debug(message: string, context?: LogContext): void {
    if (shouldLog("debug")) {
      output(createLogEntry("debug", message, context));
    }
  },

  /**
   * Info level - general application events.
   */
  info(message: string, context?: LogContext): void {
    if (shouldLog("info")) {
      output(createLogEntry("info", message, context));
    }
  },

  /**
   * Warn level - potential issues that don't stop execution.
   */
  warn(message: string, context?: LogContext): void {
    if (shouldLog("warn")) {
      output(createLogEntry("warn", message, context));
    }
  },

  /**
   * Error level - errors that need attention.
   */
  error(message: string, error?: unknown, context?: LogContext): void {
    if (shouldLog("error")) {
      output(createLogEntry("error", message, context, error));
    }
  },

  /**
   * Create a child logger with preset context.
   * Useful for request-scoped logging.
   */
  child(baseContext: LogContext) {
    return {
      debug: (message: string, context?: LogContext) =>
        logger.debug(message, { ...baseContext, ...context }),
      info: (message: string, context?: LogContext) =>
        logger.info(message, { ...baseContext, ...context }),
      warn: (message: string, context?: LogContext) =>
        logger.warn(message, { ...baseContext, ...context }),
      error: (message: string, error?: unknown, context?: LogContext) =>
        logger.error(message, error, { ...baseContext, ...context }),
    };
  },
};

/**
 * Create a request-scoped logger.
 * Call this at the start of each request handler.
 */
export function createRequestLogger(requestId: string, context?: LogContext) {
  return logger.child({ requestId, ...context });
}

/**
 * Generate a unique request ID.
 */
export function generateRequestId(): string {
  return crypto.randomUUID().slice(0, 8);
}
