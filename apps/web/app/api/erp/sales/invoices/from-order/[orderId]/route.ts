// apps/web/app/api/erp/sales/invoices/from-order/[orderId]/route.ts
// Sales Invoice order conversion endpoint

import { kernel } from "@workspace/api-kernel";
import { getDomainContainer, getDb } from "@workspace/app-runtime";
import { SALES_TOKENS } from "@workspace/domain";
import {
  CreateInvoiceFromOrderInput,
  InvoiceOutput,
} from "@workspace/validation/erp/sales/invoice";

/**
 * POST /api/erp/sales/invoices/from-order/:orderId
 * Convert a confirmed order to an invoice
 * Order must be in CONFIRMED status and have at least 1 line
 */
export const POST = kernel({
  method: "POST",
  routeId: "erp.sales.invoices.createFromOrder",
  tenant: { required: true },
  auth: { mode: "required" },
  body: CreateInvoiceFromOrderInput,
  output: InvoiceOutput,

  async handler({ tenantId, actorId, params, ctx }) {
    if (!actorId) {
      throw new Error("Actor ID required");
    }

    const orderId = params.orderId as string;

    const container = await getDomainContainer();
    const invoiceService = container.get(SALES_TOKENS.SalesInvoiceService);
    const db = getDb();

    const invoice = await invoiceService.createFromOrder(
      {
        tenantId,
        actorUserId: actorId,
        traceId: ctx.traceId,
      },
      orderId,
      db
    );

    return invoice;
  },
});
