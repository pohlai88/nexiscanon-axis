// apps/web/app/api/erp/sales/credits/from-invoice/[invoiceId]/route.ts
import { kernel } from "@workspace/api-kernel";
import type { CreateCreditFromInvoiceInput } from "@workspace/validation/erp/sales/credit";

export const POST = kernel({
  routeId: "erp.sales.credits.createFromInvoice",
  permissions: ["erp.sales.credits.create"],
  input: {} as { invoiceId: string } & CreateCreditFromInvoiceInput,
  output: {} as any,
  handler: async ({ input, services, db }) => {
    return await services.sales.creditNote.createFromInvoice(services.context, input.invoiceId, db);
  },
});
