// apps/web/app/api/erp/sales/invoices/[id]/cancel/route.ts
// Sales Invoice cancel transition endpoint

import { kernel } from "@workspace/api-kernel";
import { getDomainContainer, getDb } from "@workspace/app-runtime";
import { SALES_TOKENS } from "@workspace/domain";
import { InvoiceOutput } from "@workspace/validation/erp/sales/invoice";
import { z } from "zod";

/**
 * POST /api/erp/sales/invoices/:id/cancel
 * Cancel invoice (DRAFT or ISSUED → CANCELLED)
 */
export const POST = kernel({
  method: "POST",
  routeId: "erp.sales.invoices.cancel",
  tenant: { required: true },
  auth: { mode: "required" },
  body: z.object({}), // Empty body
  output: InvoiceOutput,

  async handler({ tenantId, actorId, params, ctx }) {
    if (!actorId) {
      throw new Error("Actor ID required");
    }

    const invoiceId = params.id as string;

    const container = await getDomainContainer();
    const invoiceService = container.get(SALES_TOKENS.SalesInvoiceService);
    const db = getDb();

    const invoice = await invoiceService.cancel(
      {
        tenantId,
        actorUserId: actorId,
        traceId: ctx.traceId,
      },
      invoiceId,
      db
    );

    return invoice;
  },
});
