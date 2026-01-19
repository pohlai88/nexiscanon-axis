// apps/web/app/api/erp/sales/quotes/[id]/lines/[lineNo]/route.ts
// Sales Quote line deletion endpoint

import { kernel } from "@workspace/api-kernel";
import { getDomainContainer, getDb } from "@workspace/app-runtime";
import { SALES_TOKENS } from "@workspace/domain";
import { QuoteOutput } from "@workspace/validation/erp/sales/quote";
import { z } from "zod";

/**
 * DELETE /api/erp/sales/quotes/:id/lines/:lineNo
 * Remove a quote line
 */
export const DELETE = kernel({
  method: "DELETE",
  routeId: "erp.sales.quotes.lines.remove",
  tenant: { required: true },
  auth: { mode: "required" },
  output: QuoteOutput,

  async handler({ params, tenantId, actorId, ctx }) {
    if (!actorId) {
      throw new Error("Actor ID required");
    }

    const quoteId = params?.id as string;
    if (!quoteId) {
      throw new Error("Quote ID parameter required");
    }

    const lineNoParam = params?.lineNo as string;
    if (!lineNoParam) {
      throw new Error("Line number parameter required");
    }

    const lineNo = parseInt(lineNoParam, 10);
    if (isNaN(lineNo) || lineNo < 1) {
      throw new Error("Line number must be a positive integer");
    }

    const container = await getDomainContainer();
    const quoteService = container.get(SALES_TOKENS.SalesQuoteService);
    const db = getDb();

    const quote = await quoteService.removeLine(
      {
        tenantId,
        actorUserId: actorId,
        traceId: ctx.traceId,
      },
      quoteId,
      lineNo,
      db
    );

    return quote;
  },
});
