/**
 * Error reporting utility.
 *
 * Pattern: Report errors to GlitchTip (Sentry-compatible).
 * Uses SENTRY_DSN from environment - no SDK required.
 *
 * GlitchTip is open-source: https://glitchtip.com
 */

import { logger } from "@/lib/logger";

interface ErrorReport {
  message: string;
  stack?: string;
  digest?: string;
  url?: string;
  userAgent?: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

/**
 * Report an error to the error tracking service.
 * Uses Sentry-compatible API (works with GlitchTip).
 */
export async function reportError(
  error: Error & { digest?: string },
  context?: Record<string, unknown>
): Promise<void> {
  const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

  if (!dsn) {
    logger.warn("No SENTRY_DSN configured, skipping error report", { errorMessage: error.message });
    return;
  }

  const report: ErrorReport = {
    message: error.message,
    stack: error.stack,
    digest: error.digest,
    url: typeof window !== "undefined" ? window.location.href : undefined,
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
    timestamp: new Date().toISOString(),
    context,
  };

  // Log locally in development
  if (process.env.NODE_ENV === "development") {
    logger.error("Error captured (dev mode)", error, { digest: error.digest, ...context });
    return;
  }

  try {
    // Parse DSN to get endpoint
    // Format: https://<key>@<host>/<project_id>
    const dsnMatch = dsn.match(/^https?:\/\/([^@]+)@([^/]+)\/(\d+)$/);
    if (!dsnMatch) {
      logger.error("Invalid SENTRY_DSN format", new Error("DSN parse failed"));
      return;
    }

    const [, key, host, projectId] = dsnMatch;
    const endpoint = `https://${host}/api/${projectId}/store/`;

    // Send to Sentry-compatible endpoint
    await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Sentry-Auth": `Sentry sentry_version=7, sentry_key=${key}`,
      },
      body: JSON.stringify({
        event_id: crypto.randomUUID().replace(/-/g, ""),
        timestamp: report.timestamp,
        platform: "javascript",
        level: "error",
        logger: "nexuscanon-axis",
        message: {
          formatted: report.message,
        },
        exception: {
          values: [
            {
              type: error.name || "Error",
              value: error.message,
              stacktrace: error.stack
                ? {
                    frames: parseStackFrames(error.stack),
                  }
                : undefined,
            },
          ],
        },
        request: report.url
          ? {
              url: report.url,
              headers: {
                "User-Agent": report.userAgent,
              },
            }
          : undefined,
        extra: {
          digest: report.digest,
          ...report.context,
        },
      }),
    });
  } catch (e) {
    // Don't throw on reporting failures
    logger.error("Failed to report error to tracking service", e);
  }
}

/**
 * Parse stack trace into Sentry-compatible frames.
 */
function parseStackFrames(stack: string): Array<{
  filename: string;
  function: string;
  lineno?: number;
  colno?: number;
}> {
  const lines = stack.split("\n").slice(1); // Skip first line (error message)
  
  return lines
    .map((line) => {
      // Match: "    at functionName (filename:line:col)"
      const match = line.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/);
      if (match) {
        return {
          function: match[1] ?? "<anonymous>",
          filename: match[2] ?? "<unknown>",
          lineno: parseInt(match[3] ?? "0", 10),
          colno: parseInt(match[4] ?? "0", 10),
        };
      }
      
      // Match: "    at filename:line:col"
      const simpleMatch = line.match(/at\s+(.+?):(\d+):(\d+)/);
      if (simpleMatch) {
        return {
          function: "<anonymous>",
          filename: simpleMatch[1] ?? "<unknown>",
          lineno: parseInt(simpleMatch[2] ?? "0", 10),
          colno: parseInt(simpleMatch[3] ?? "0", 10),
        };
      }
      
      return null;
    })
    .filter((frame): frame is NonNullable<typeof frame> => frame !== null)
    .reverse(); // Sentry expects frames in reverse order
}
