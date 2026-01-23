/**
 * Streaming Utilities
 *
 * Pattern: Server-Sent Events (SSE) for real-time data streaming.
 *
 * Use cases:
 * - AI/LLM text generation
 * - Long-running operations progress
 * - Real-time notifications
 * - Live data updates
 */

/**
 * SSE event types.
 */
export interface SSEEvent {
  event?: string;
  data: string;
  id?: string;
  retry?: number;
}

/**
 * Encode a single SSE event.
 */
export function encodeSSE(event: SSEEvent): string {
  let message = "";

  if (event.id) {
    message += `id: ${event.id}\n`;
  }

  if (event.event) {
    message += `event: ${event.event}\n`;
  }

  if (event.retry) {
    message += `retry: ${event.retry}\n`;
  }

  // Data can be multiline
  const lines = event.data.split("\n");
  for (const line of lines) {
    message += `data: ${line}\n`;
  }

  message += "\n"; // Empty line to end the event

  return message;
}

/**
 * Create an SSE response stream.
 *
 * @example
 * ```ts
 * // In API route
 * export async function GET(request: Request) {
 *   const stream = createSSEStream(async function* () {
 *     yield { data: JSON.stringify({ progress: 0 }) };
 *
 *     for (let i = 1; i <= 100; i++) {
 *       await delay(100);
 *       yield { data: JSON.stringify({ progress: i }) };
 *     }
 *
 *     yield { event: "complete", data: JSON.stringify({ success: true }) };
 *   });
 *
 *   return new Response(stream, {
 *     headers: {
 *       "Content-Type": "text/event-stream",
 *       "Cache-Control": "no-cache",
 *       "Connection": "keep-alive",
 *     },
 *   });
 * }
 * ```
 */
export function createSSEStream(
  generator: () => AsyncGenerator<SSEEvent, void, unknown>
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const event of generator()) {
          const message = encodeSSE(event);
          controller.enqueue(encoder.encode(message));
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

/**
 * Create an SSE response with proper headers.
 */
export function createSSEResponse(
  stream: ReadableStream<Uint8Array>,
  options?: {
    status?: number;
    headers?: Record<string, string>;
  }
): Response {
  return new Response(stream, {
    status: options?.status ?? 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disable nginx buffering
      ...options?.headers,
    },
  });
}

/**
 * Create a text streaming response (for LLM output).
 *
 * Simpler than SSE - just streams text chunks directly.
 *
 * @example
 * ```ts
 * const stream = createTextStream(async function* () {
 *   yield "Hello, ";
 *   yield "world!";
 * });
 *
 * return new Response(stream, {
 *   headers: { "Content-Type": "text/plain" },
 * });
 * ```
 */
export function createTextStream(
  generator: () => AsyncGenerator<string, void, unknown>
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of generator()) {
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

/**
 * Create a JSON stream (NDJSON format).
 *
 * Each object is serialized as a single line of JSON.
 *
 * @example
 * ```ts
 * const stream = createJSONStream(async function* () {
 *   yield { type: "start", timestamp: Date.now() };
 *   yield { type: "data", value: 42 };
 *   yield { type: "end", timestamp: Date.now() };
 * });
 * ```
 */
export function createJSONStream<T>(
  generator: () => AsyncGenerator<T, void, unknown>
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const item of generator()) {
          const json = JSON.stringify(item) + "\n";
          controller.enqueue(encoder.encode(json));
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

/**
 * Transform a ReadableStream using an async generator.
 */
export function transformStream<T, U>(
  stream: ReadableStream<T>,
  transformer: (chunk: T) => AsyncGenerator<U, void, unknown> | U
): ReadableStream<U> {
  const reader = stream.getReader();

  return new ReadableStream({
    async pull(controller) {
      try {
        const { done, value } = await reader.read();

        if (done) {
          controller.close();
          return;
        }

        const result = transformer(value);

        if (
          result &&
          typeof result === "object" &&
          Symbol.asyncIterator in result
        ) {
          // Async generator
          for await (const chunk of result) {
            controller.enqueue(chunk);
          }
        } else {
          // Direct value
          controller.enqueue(result as U);
        }
      } catch (error) {
        controller.error(error);
      }
    },
    cancel() {
      reader.cancel();
    },
  });
}

/**
 * Consume a ReadableStream and collect all chunks.
 */
export async function collectStream<T>(stream: ReadableStream<T>): Promise<T[]> {
  const reader = stream.getReader();
  const chunks: T[] = [];

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  return chunks;
}

/**
 * Delay utility for streaming.
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
