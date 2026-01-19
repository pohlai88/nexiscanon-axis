// apps/web/app/api/erp/sales/quotes/[id]/route.ts
// Sales Quote item endpoints

import { kernel } from "@workspace/api-kernel";
import { getDomainContainer, getDb } from "@workspace/app-runtime";
import { SALES_TOKENS } from "@workspace/domain";
import {
  QuoteUpdateInput,
  QuoteOutput,
} from "@workspace/validation/erp/sales/quote";

/**
 * GET /api/erp/sales/quotes/:id
 * Get a sales quote by ID
 */
export const GET = kernel({
  method: "GET",
  routeId: "erp.sales.quotes.get",
  tenant: { required: true },
  auth: { mode: "required" },
  output: QuoteOutput,

  async handler({ params, tenantId, actorId, ctx }) {
    if (!actorId) {
      throw new Error("Actor ID required");
    }

    const id = params?.id as string;
    if (!id) {
      throw new Error("Quote ID parameter required");
    }

    const container = await getDomainContainer();
    const quoteService = container.get(SALES_TOKENS.SalesQuoteService);
    const db = getDb();

    const quote = await quoteService.get(
      {
        tenantId,
        actorUserId: actorId,
        traceId: ctx.traceId,
      },
      id,
      db
    );

    return quote;
  },
});

/**
 * PATCH /api/erp/sales/quotes/:id
 * Update a sales quote (DRAFT only)
 */
export const PATCH = kernel({
  method: "PATCH",
  routeId: "erp.sales.quotes.update",
  tenant: { required: true },
  auth: { mode: "required" },
  body: QuoteUpdateInput,
  output: QuoteOutput,

  async handler({ params, body, tenantId, actorId, ctx }) {
    if (!actorId) {
      throw new Error("Actor ID required");
    }

    const id = params?.id as string;
    if (!id) {
      throw new Error("Quote ID parameter required");
    }

    const container = await getDomainContainer();
    const quoteService = container.get(SALES_TOKENS.SalesQuoteService);
    const db = getDb();

    const quote = await quoteService.update(
      {
        tenantId,
        actorUserId: actorId,
        traceId: ctx.traceId,
      },
      id,
      body,
      db
    );

    return quote;
  },
});
