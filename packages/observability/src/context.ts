// packages/observability/src/context.ts
// AsyncLocalStorage for request context correlation

import { AsyncLocalStorage } from "node:async_hooks";

export type RequestContext = {
  traceId: string;
  requestId: string;
  routeId?: string;
  method?: string;
  tenantId?: string;
  actorId?: string;
  roles?: string[];
};

const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

/**
 * Run a function within a request context.
 * All code executed within the callback can access the context via getContext().
 */
export function runWithContext<T>(ctx: RequestContext, fn: () => T): T {
  return asyncLocalStorage.run(ctx, fn);
}

/**
 * Get the current request context.
 * Returns undefined if called outside of a request context.
 */
export function getContext(): RequestContext | undefined {
  return asyncLocalStorage.getStore();
}

/**
 * Get the current request context or throw if not available.
 */
export function requireContext(): RequestContext {
  const ctx = getContext();
  if (!ctx) {
    throw new Error(
      "RequestContext not available - are you inside a request handler?"
    );
  }
  return ctx;
}

/**
 * Update the current request context with additional fields.
 * Does NOT create a new context; mutates the existing one.
 */
export function updateContext(updates: Partial<RequestContext>): void {
  const ctx = getContext();
  if (ctx) {
    Object.assign(ctx, updates);
  }
}

/**
 * Generate a new UUID for traceId/requestId.
 */
export function generateId(): string {
  return crypto.randomUUID();
}
