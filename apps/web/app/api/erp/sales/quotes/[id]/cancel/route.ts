// apps/web/app/api/erp/sales/quotes/[id]/cancel/route.ts
// Sales Quote cancel transition endpoint

import { kernel } from "@workspace/api-kernel";
import { getDomainContainer, getDb } from "@workspace/app-runtime";
import { SALES_TOKENS } from "@workspace/domain";
import { QuoteOutput } from "@workspace/validation/erp/sales/quote";

/**
 * POST /api/erp/sales/quotes/:id/cancel
 * Cancel a quote (DRAFT/SENT → CANCELLED)
 */
export const POST = kernel({
  method: "POST",
  routeId: "erp.sales.quotes.cancel",
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

    const quote = await quoteService.cancel(
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
