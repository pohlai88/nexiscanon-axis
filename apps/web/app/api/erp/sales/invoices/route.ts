// apps/web/app/api/erp/sales/invoices/route.ts
// Sales Invoice collection endpoints

import { kernel } from "@workspace/api-kernel";
import { getDomainContainer, getDb } from "@workspace/app-runtime";
import { SALES_TOKENS } from "@workspace/domain";
import {
  InvoiceCreateInput,
  InvoiceOutput,
  InvoiceListQuery,
  InvoiceListOutput,
} from "@workspace/validation/erp/sales/invoice";

/**
 * POST /api/erp/sales/invoices
 * Create a new sales invoice
 */
export const POST = kernel({
  method: "POST",
  routeId: "erp.sales.invoices.create",
  tenant: { required: true },
  auth: { mode: "required" },
  body: InvoiceCreateInput,
  output: InvoiceOutput,

  async handler({ tenantId, actorId, body, ctx }) {
    if (!actorId) {
      throw new Error("Actor ID required");
    }

    const container = await getDomainContainer();
    const invoiceService = container.get(SALES_TOKENS.SalesInvoiceService);
    const db = getDb();

    const invoice = await invoiceService.create(
      {
        tenantId,
        actorUserId: actorId,
        traceId: ctx.traceId,
      },
      body,
      db
    );

    return invoice;
  },
});

/**
 * GET /api/erp/sales/invoices
 * List sales invoices
 */
export const GET = kernel({
  method: "GET",
  routeId: "erp.sales.invoices.list",
  tenant: { required: true },
  auth: { mode: "required" },
  query: InvoiceListQuery,
  output: InvoiceListOutput,

  async handler({ tenantId, actorId, query, ctx }) {
    if (!actorId) {
      throw new Error("Actor ID required");
    }

    const container = await getDomainContainer();
    const invoiceService = container.get(SALES_TOKENS.SalesInvoiceService);
    const db = getDb();

    const result = await invoiceService.list(
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
