// apps/web/app/api/erp/sales/invoices/[id]/lines/route.ts
// Sales Invoice line upsert endpoint

import { kernel } from "@workspace/api-kernel";
import { getDomainContainer, getDb } from "@workspace/app-runtime";
import { SALES_TOKENS } from "@workspace/domain";
import {
  InvoiceLineUpsertInput,
  InvoiceOutput,
} from "@workspace/validation/erp/sales/invoice";

/**
 * POST /api/erp/sales/invoices/:id/lines
 * Upsert a line (update if lineNo exists, append if absent)
 * DRAFT only
 */
export const POST = kernel({
  method: "POST",
  routeId: "erp.sales.invoices.lines.upsert",
  tenant: { required: true },
  auth: { mode: "required" },
  body: InvoiceLineUpsertInput,
  output: InvoiceOutput,

  async handler({ tenantId, actorId, params, body, ctx }) {
    if (!actorId) {
      throw new Error("Actor ID required");
    }

    const invoiceId = params.id as string;

    const container = await getDomainContainer();
    const invoiceService = container.get(SALES_TOKENS.SalesInvoiceService);
    const db = getDb();

    const invoice = await invoiceService.upsertLine(
      {
        tenantId,
        actorUserId: actorId,
        traceId: ctx.traceId,
      },
      invoiceId,
      body,
      db
    );

    return invoice;
  },
});
