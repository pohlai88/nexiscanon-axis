// apps/web/app/api/erp/sales/orders/from-quote/[quoteId]/route.ts
// Sales Order quote conversion endpoint

import { kernel } from "@workspace/api-kernel";
import { getDomainContainer, getDb } from "@workspace/app-runtime";
import { SALES_TOKENS } from "@workspace/domain";
import {
  ConvertQuoteToOrderInput,
  OrderOutput,
} from "@workspace/validation/erp/sales/order";

/**
 * POST /api/erp/sales/orders/from-quote/:quoteId
 * Convert an accepted quote to an order
 * Quote must be in ACCEPTED status and have at least 1 line
 */
export const POST = kernel({
  method: "POST",
  routeId: "erp.sales.orders.createFromQuote",
  tenant: { required: true },
  auth: { mode: "required" },
  body: ConvertQuoteToOrderInput,
  output: OrderOutput,

  async handler({ tenantId, actorId, params, ctx }) {
    if (!actorId) {
      throw new Error("Actor ID required");
    }

    const quoteId = params.quoteId as string;

    const container = await getDomainContainer();
    const orderService = container.get(SALES_TOKENS.SalesOrderService);
    const db = getDb();

    const order = await orderService.convertQuoteToOrder(
      {
        tenantId,
        actorUserId: actorId,
        traceId: ctx.traceId,
      },
      quoteId,
      db
    );

    return order;
  },
});
