// apps/web/app/api/erp/sales/credits/route.ts
import { kernel } from "@workspace/api-kernel";
import type { CreditNoteCreateInput, CreditNoteListQuery } from "@workspace/validation/erp/sales/credit";

export const POST = kernel({
  routeId: "erp.sales.credits.create",
  permissions: ["erp.sales.credits.create"],
  input: {} as CreditNoteCreateInput,
  output: {} as any,
  handler: async ({ input, services, db }) => {
    return await services.sales.creditNote.create(services.context, input, db);
  },
});

export const GET = kernel({
  routeId: "erp.sales.credits.list",
  permissions: ["erp.sales.credits.list"],
  input: {} as CreditNoteListQuery,
  output: {} as any,
  handler: async ({ input, services, db }) => {
    return await services.sales.creditNote.list(services.context, input, db);
  },
});
