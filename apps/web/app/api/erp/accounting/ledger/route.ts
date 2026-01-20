// apps/web/app/api/erp/accounting/ledger/route.ts
// GET /api/erp/accounting/ledger - List ledger entries

import { kernel } from "@workspace/api-kernel";
import { LedgerListQuery, LedgerListOutput } from "@workspace/validation";
import { getDb } from "@workspace/app-runtime";
import { getDomainContainer, ACCOUNTING_TOKENS } from "@workspace/domain";

export const GET = kernel({
  method: "GET",
  routeId: "erp.accounting.ledgers.list",
  tenant: { required: true },
  auth: { mode: "required" },
  output: LedgerListOutput,
  async handler(ctx, request) {
    const url = new URL(request.url);
    const query = LedgerListQuery.parse({
      sourceType: url.searchParams.get("sourceType") || undefined,
      sourceId: url.searchParams.get("sourceId") || undefined,
      postedAfter: url.searchParams.get("postedAfter") || undefined,
      postedBefore: url.searchParams.get("postedBefore") || undefined,
      cursor: url.searchParams.get("cursor") || undefined,
      limit: url.searchParams.has("limit")
        ? parseInt(url.searchParams.get("limit")!, 10)
        : undefined,
    });

    const container = await getDomainContainer();
    const ledgerService = container.get(ACCOUNTING_TOKENS.LedgerService);

    const db = getDb();
    return ledgerService.list(ctx, query, db);
  },
});
