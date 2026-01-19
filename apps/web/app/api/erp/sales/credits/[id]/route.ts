// apps/web/app/api/erp/sales/credits/[id]/route.ts
import { kernel } from "@workspace/api-kernel";
import type { CreditNoteUpdateInput } from "@workspace/validation/erp/sales/credit";

export const GET = kernel({
  routeId: "erp.sales.credits.get",
  permissions: ["erp.sales.credits.get"],
  input: {} as { id: string },
  output: {} as any,
  handler: async ({ input, services, db }) => {
    return await services.sales.creditNote.get(services.context, input.id, db);
  },
});

export const PATCH = kernel({
  routeId: "erp.sales.credits.update",
  permissions: ["erp.sales.credits.update"],
  input: {} as { id: string } & CreditNoteUpdateInput,
  output: {} as any,
  handler: async ({ input, services, db }) => {
    const { id, ...patch } = input;
    return await services.sales.creditNote.update(services.context, id, patch, db);
  },
});
