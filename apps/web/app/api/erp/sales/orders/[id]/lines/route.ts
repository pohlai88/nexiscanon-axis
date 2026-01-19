// apps/web/app/api/erp/sales/orders/[id]/lines/route.ts
// Sales Order line upsert endpoint

import { kernel } from "@workspace/api-kernel";
import { getDomainContainer, getDb } from "@workspace/app-runtime";
import { SALES_TOKENS } from "@workspace/domain";
import {
  OrderLineUpsertInput,
  OrderOutput,
} from "@workspace/validation/erp/sales/order";

/**
 * POST /api/erp/sales/orders/:id/lines
 * Upsert a line (update if lineNo exists, append if absent)
 * DRAFT only
 */
export const POST = kernel({
  method: "POST",
  routeId: "erp.sales.orders.lines.upsert",
  tenant: { required: true },
  auth: { mode: "required" },
  body: OrderLineUpsertInput,
  output: OrderOutput,

  async handler({ tenantId, actorId, params, body, ctx }) {
    if (!actorId) {
      throw new Error("Actor ID required");
    }

    const orderId = params.id as string;

    const container = await getDomainContainer();
    const orderService = container.get(SALES_TOKENS.SalesOrderService);
    const db = getDb();

    const order = await orderService.upsertLine(
      {
        tenantId,
        actorUserId: actorId,
        traceId: ctx.traceId,
      },
      orderId,
      body,
      db
    );

    return order;
  },
});
