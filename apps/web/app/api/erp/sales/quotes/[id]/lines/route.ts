// apps/web/app/api/erp/sales/quotes/[id]/lines/route.ts
// Sales Quote line management endpoint

import { kernel } from "@workspace/api-kernel";
import { getDomainContainer, getDb } from "@workspace/app-runtime";
import { SALES_TOKENS } from "@workspace/domain";
import {
  QuoteLineUpsertInput,
  QuoteOutput,
} from "@workspace/validation/erp/sales/quote";

/**
 * POST /api/erp/sales/quotes/:id/lines
 * Upsert a quote line (create or update)
 */
export const POST = kernel({
  method: "POST",
  routeId: "erp.sales.quotes.lines.upsert",
  tenant: { required: true },
  auth: { mode: "required" },
  body: QuoteLineUpsertInput,
  output: QuoteOutput,

  async handler({ params, body, tenantId, actorId, ctx }) {
    if (!actorId) {
      throw new Error("Actor ID required");
    }

    const quoteId = params?.id as string;
    if (!quoteId) {
      throw new Error("Quote ID parameter required");
    }

    const container = await getDomainContainer();
    const quoteService = container.get(SALES_TOKENS.SalesQuoteService);
    const db = getDb();

    const quote = await quoteService.upsertLine(
      {
        tenantId,
        actorUserId: actorId,
        traceId: ctx.traceId,
      },
      quoteId,
      body,
      db
    );

    return quote;
  },
});
