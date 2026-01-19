// apps/web/app/api/erp/sales/credits/[id]/lines/[lineNo]/route.ts
import { kernel } from "@workspace/api-kernel";

export const DELETE = kernel({
  routeId: "erp.sales.credits.lines.remove",
  permissions: ["erp.sales.credits.update"],
  input: {} as { id: string; lineNo: number },
  output: {} as any,
  handler: async ({ input, services, db }) => {
    return await services.sales.creditNote.removeLine(services.context, input.id, input.lineNo, db);
  },
});
