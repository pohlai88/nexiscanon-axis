// apps/web/app/api/erp/sales/quotes/[id]/send/route.ts
// Sales Quote send transition endpoint

import { kernel } from "@workspace/api-kernel";
import { getDomainContainer, getDb } from "@workspace/app-runtime";
import { SALES_TOKENS } from "@workspace/domain";
import { QuoteOutput } from "@workspace/validation/erp/sales/quote";

/**
 * POST /api/erp/sales/quotes/:id/send
 * Send a quote (DRAFT → SENT)
 */
export const POST = kernel({
  method: "POST",
  routeId: "erp.sales.quotes.send",
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

    const quote = await quoteService.send(
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
