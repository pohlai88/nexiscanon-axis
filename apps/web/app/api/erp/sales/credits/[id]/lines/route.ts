// apps/web/app/api/erp/sales/credits/[id]/lines/route.ts
import { kernel } from "@workspace/api-kernel";
import type { CreditNoteLineUpsertInput } from "@workspace/validation/erp/sales/credit";

export const POST = kernel({
  routeId: "erp.sales.credits.lines.upsert",
  permissions: ["erp.sales.credits.update"],
  input: {} as { id: string } & CreditNoteLineUpsertInput,
  output: {} as any,
  handler: async ({ input, services, db }) => {
    const { id, ...lineInput } = input;
    return await services.sales.creditNote.upsertLine(services.context, id, lineInput, db);
  },
});
