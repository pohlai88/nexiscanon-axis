// apps/web/app/api/erp/sales/invoices/[id]/route.ts
// Sales Invoice single resource endpoints

import { kernel } from "@workspace/api-kernel";
import { getDomainContainer, getDb } from "@workspace/app-runtime";
import { SALES_TOKENS } from "@workspace/domain";
import {
  InvoiceUpdateInput,
  InvoiceOutput,
} from "@workspace/validation/erp/sales/invoice";

/**
 * GET /api/erp/sales/invoices/:id
 * Get a single sales invoice with lines
 */
export const GET = kernel({
  method: "GET",
  routeId: "erp.sales.invoices.get",
  tenant: { required: true },
  auth: { mode: "required" },
  output: InvoiceOutput,

  async handler({ tenantId, actorId, params, ctx }) {
    if (!actorId) {
      throw new Error("Actor ID required");
    }

    const invoiceId = params.id as string;

    const container = await getDomainContainer();
    const invoiceService = container.get(SALES_TOKENS.SalesInvoiceService);
    const db = getDb();

    const invoice = await invoiceService.get(
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

/**
 * PATCH /api/erp/sales/invoices/:id
 * Update a sales invoice (DRAFT only)
 */
export const PATCH = kernel({
  method: "PATCH",
  routeId: "erp.sales.invoices.update",
  tenant: { required: true },
  auth: { mode: "required" },
  body: InvoiceUpdateInput,
  output: InvoiceOutput,

  async handler({ tenantId, actorId, params, body, ctx }) {
    if (!actorId) {
      throw new Error("Actor ID required");
    }

    const invoiceId = params.id as string;

    const container = await getDomainContainer();
    const invoiceService = container.get(SALES_TOKENS.SalesInvoiceService);
    const db = getDb();

    const invoice = await invoiceService.update(
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
