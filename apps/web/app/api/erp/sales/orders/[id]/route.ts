// apps/web/app/api/erp/sales/orders/[id]/route.ts
// Sales Order single resource endpoints

import { kernel } from "@workspace/api-kernel";
import { getDomainContainer, getDb } from "@workspace/app-runtime";
import { SALES_TOKENS } from "@workspace/domain";
import {
  OrderUpdateInput,
  OrderOutput,
} from "@workspace/validation/erp/sales/order";

/**
 * GET /api/erp/sales/orders/:id
 * Get a single sales order with lines
 */
export const GET = kernel({
  method: "GET",
  routeId: "erp.sales.orders.get",
  tenant: { required: true },
  auth: { mode: "required" },
  output: OrderOutput,

  async handler({ tenantId, actorId, params, ctx }) {
    if (!actorId) {
      throw new Error("Actor ID required");
    }

    const orderId = params.id as string;

    const container = await getDomainContainer();
    const orderService = container.get(SALES_TOKENS.SalesOrderService);
    const db = getDb();

    const order = await orderService.get(
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

/**
 * PATCH /api/erp/sales/orders/:id
 * Update a sales order (DRAFT only)
 */
export const PATCH = kernel({
  method: "PATCH",
  routeId: "erp.sales.orders.update",
  tenant: { required: true },
  auth: { mode: "required" },
  body: OrderUpdateInput,
  output: OrderOutput,

  async handler({ tenantId, actorId, params, body, ctx }) {
    if (!actorId) {
      throw new Error("Actor ID required");
    }

    const orderId = params.id as string;

    const container = await getDomainContainer();
    const orderService = container.get(SALES_TOKENS.SalesOrderService);
    const db = getDb();

    const order = await orderService.update(
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
