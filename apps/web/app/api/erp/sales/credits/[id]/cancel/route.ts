// apps/web/app/api/erp/sales/credits/[id]/cancel/route.ts
import { kernel } from "@workspace/api-kernel";

export const POST = kernel({
  routeId: "erp.sales.credits.cancel",
  permissions: ["erp.sales.credits.cancel"],
  input: {} as { id: string },
  output: {} as any,
  handler: async ({ input, services, db }) => {
    return await services.sales.creditNote.cancel(services.context, input.id, db);
  },
});
