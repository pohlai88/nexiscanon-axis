// apps/web/app/api/erp/accounting/ledger/[id]/route.ts
// GET /api/erp/accounting/ledger/[id] - Get ledger entry by ID

import { kernel } from "@workspace/api-kernel";
import { LedgerEntryOutput } from "@workspace/validation";
import { getDb } from "@workspace/app-runtime";
import { getDomainContainer, ACCOUNTING_TOKENS } from "@workspace/domain";

export const GET = kernel({
  method: "GET",
  routeId: "erp.accounting.ledgers.get",
  tenant: { required: true },
  auth: { mode: "required" },
  output: LedgerEntryOutput,
  async handler(ctx) {
    const id = ctx.params.id as string;

    const container = await getDomainContainer();
    const ledgerService = container.get(ACCOUNTING_TOKENS.LedgerService);

    const db = getDb();
    return ledgerService.get(ctx, id, db);
  },
});
