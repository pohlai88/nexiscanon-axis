// apps/web/app/api/erp/sales/orders/route.ts
// Sales Order collection endpoints

import { kernel } from "@workspace/api-kernel";
import { getDomainContainer, getDb } from "@workspace/app-runtime";
import { SALES_TOKENS } from "@workspace/domain";
import {
  OrderCreateInput,
  OrderOutput,
  OrderListQuery,
  OrderListOutput,
} from "@workspace/validation/erp/sales/order";

/**
 * POST /api/erp/sales/orders
 * Create a new sales order
 */
export const POST = kernel({
  method: "POST",
  routeId: "erp.sales.orders.create",
  tenant: { required: true },
  auth: { mode: "required" },
  body: OrderCreateInput,
  output: OrderOutput,

  async handler({ tenantId, actorId, body, ctx }) {
    if (!actorId) {
      throw new Error("Actor ID required");
    }

    const container = await getDomainContainer();
    const orderService = container.get(SALES_TOKENS.SalesOrderService);
    const db = getDb();

    const order = await orderService.create(
      {
        tenantId,
        actorUserId: actorId,
        traceId: ctx.traceId,
      },
      body,
      db
    );

    return order;
  },
});

/**
 * GET /api/erp/sales/orders
 * List sales orders
 */
export const GET = kernel({
  method: "GET",
  routeId: "erp.sales.orders.list",
  tenant: { required: true },
  auth: { mode: "required" },
  query: OrderListQuery,
  output: OrderListOutput,

  async handler({ tenantId, actorId, query, ctx }) {
    if (!actorId) {
      throw new Error("Actor ID required");
    }

    const container = await getDomainContainer();
    const orderService = container.get(SALES_TOKENS.SalesOrderService);
    const db = getDb();

    const result = await orderService.list(
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
