// apps/web/app/api/erp/sales/orders/[id]/confirm/route.ts
// Sales Order confirm transition endpoint

import { kernel } from "@workspace/api-kernel";
import { getDomainContainer, getDb } from "@workspace/app-runtime";
import { SALES_TOKENS } from "@workspace/domain";
import { OrderOutput } from "@workspace/validation/erp/sales/order";
import { z } from "zod";

/**
 * POST /api/erp/sales/orders/:id/confirm
 * Confirm order (DRAFT → CONFIRMED)
 * Requires at least 1 line
 */
export const POST = kernel({
  method: "POST",
  routeId: "erp.sales.orders.confirm",
  tenant: { required: true },
  auth: { mode: "required" },
  body: z.object({}), // Empty body
  output: OrderOutput,

  async handler({ tenantId, actorId, params, ctx }) {
    if (!actorId) {
      throw new Error("Actor ID required");
    }

    const orderId = params.id as string;

    const container = await getDomainContainer();
    const orderService = container.get(SALES_TOKENS.SalesOrderService);
    const db = getDb();

    const order = await orderService.confirm(
      {
        tenantId,
        actorUserId: actorId,
        traceId: ctx.traceId,
      },
      orderId,
      db
    );

    return order;
  },
});
