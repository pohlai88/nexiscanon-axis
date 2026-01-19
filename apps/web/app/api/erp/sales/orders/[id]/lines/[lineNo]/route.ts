// apps/web/app/api/erp/sales/orders/[id]/lines/[lineNo]/route.ts
// Sales Order line removal endpoint

import { kernel } from "@workspace/api-kernel";
import { getDomainContainer, getDb } from "@workspace/app-runtime";
import { SALES_TOKENS } from "@workspace/domain";
import { OrderOutput } from "@workspace/validation/erp/sales/order";

/**
 * DELETE /api/erp/sales/orders/:id/lines/:lineNo
 * Remove a line by line number
 * DRAFT only
 */
export const DELETE = kernel({
  method: "DELETE",
  routeId: "erp.sales.orders.lines.remove",
  tenant: { required: true },
  auth: { mode: "required" },
  output: OrderOutput,

  async handler({ tenantId, actorId, params, ctx }) {
    if (!actorId) {
      throw new Error("Actor ID required");
    }

    const orderId = params.id as string;
    const lineNo = parseInt(params.lineNo as string, 10);

    if (isNaN(lineNo)) {
      throw new Error("Invalid line number");
    }

    const container = await getDomainContainer();
    const orderService = container.get(SALES_TOKENS.SalesOrderService);
    const db = getDb();

    const order = await orderService.removeLine(
      {
        tenantId,
        actorUserId: actorId,
        traceId: ctx.traceId,
      },
      orderId,
      lineNo,
      db
    );

    return order;
  },
});
