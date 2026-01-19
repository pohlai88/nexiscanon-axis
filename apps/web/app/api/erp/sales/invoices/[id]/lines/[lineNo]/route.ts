// apps/web/app/api/erp/sales/invoices/[id]/lines/[lineNo]/route.ts
// Sales Invoice line removal endpoint

import { kernel } from "@workspace/api-kernel";
import { getDomainContainer, getDb } from "@workspace/app-runtime";
import { SALES_TOKENS } from "@workspace/domain";
import { InvoiceOutput } from "@workspace/validation/erp/sales/invoice";

/**
 * DELETE /api/erp/sales/invoices/:id/lines/:lineNo
 * Remove a line by line number
 * DRAFT only
 */
export const DELETE = kernel({
  method: "DELETE",
  routeId: "erp.sales.invoices.lines.remove",
  tenant: { required: true },
  auth: { mode: "required" },
  output: InvoiceOutput,

  async handler({ tenantId, actorId, params, ctx }) {
    if (!actorId) {
      throw new Error("Actor ID required");
    }

    const invoiceId = params.id as string;
    const lineNo = parseInt(params.lineNo as string, 10);

    if (isNaN(lineNo)) {
      throw new Error("Invalid line number");
    }

    const container = await getDomainContainer();
    const invoiceService = container.get(SALES_TOKENS.SalesInvoiceService);
    const db = getDb();

    const invoice = await invoiceService.removeLine(
      {
        tenantId,
        actorUserId: actorId,
        traceId: ctx.traceId,
      },
      invoiceId,
      lineNo,
      db
    );

    return invoice;
  },
});
