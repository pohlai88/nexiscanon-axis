// apps/web/app/api/erp/sales/credits/[id]/issue/route.ts
import { kernel } from "@workspace/api-kernel";

export const POST = kernel({
  routeId: "erp.sales.credits.issue",
  permissions: ["erp.sales.credits.issue"],
  input: {} as { id: string },
  output: {} as any,
  handler: async ({ input, services, db }) => {
    return await services.sales.creditNote.issue(services.context, input.id, db);
  },
});
