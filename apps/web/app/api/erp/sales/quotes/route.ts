// apps/web/app/api/erp/sales/quotes/route.ts
// Sales Quote collection endpoints

import { kernel } from "@workspace/api-kernel";
import { getDomainContainer, getDb } from "@workspace/app-runtime";
import { SALES_TOKENS } from "@workspace/domain";
import {
  QuoteCreateInput,
  QuoteOutput,
  QuoteListQuery,
  QuoteListOutput,
} from "@workspace/validation/erp/sales/quote";

/**
 * POST /api/erp/sales/quotes
 * Create a new sales quote
 */
export const POST = kernel({
  method: "POST",
  routeId: "erp.sales.quotes.create",
  tenant: { required: true },
  auth: { mode: "required" },
  body: QuoteCreateInput,
  output: QuoteOutput,

  async handler({ tenantId, actorId, body, ctx }) {
    if (!actorId) {
      throw new Error("Actor ID required");
    }

    const container = await getDomainContainer();
    const quoteService = container.get(SALES_TOKENS.SalesQuoteService);
    const db = getDb();

    const quote = await quoteService.create(
      {
        tenantId,
        actorUserId: actorId,
        traceId: ctx.traceId,
      },
      body,
      db
    );

    return quote;
  },
});

/**
 * GET /api/erp/sales/quotes
 * List sales quotes
 */
export const GET = kernel({
  method: "GET",
  routeId: "erp.sales.quotes.list",
  tenant: { required: true },
  auth: { mode: "required" },
  query: QuoteListQuery,
  output: QuoteListOutput,

  async handler({ tenantId, actorId, query, ctx }) {
    if (!actorId) {
      throw new Error("Actor ID required");
    }

    const container = await getDomainContainer();
    const quoteService = container.get(SALES_TOKENS.SalesQuoteService);
    const db = getDb();

    const result = await quoteService.list(
      {
        tenantId,
        actorUserId: actorId,
        traceId: ctx.traceId,
      },
      query,
      db
    );

    return result;
  },
});
