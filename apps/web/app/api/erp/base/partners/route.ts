// apps/web/app/api/erp/base/partners/route.ts
// Partner collection endpoints

import { kernel } from "@workspace/api-kernel";
import { getDomainContainer, getDb } from "@workspace/app-runtime";
import { ERP_BASE_TOKENS } from "@workspace/domain";
import {
  createPartnerInput,
  partnerOutput,
  partnerListQuery,
  partnerListOutput,
} from "@workspace/validation/erp/base/partner";

/**
 * POST /api/erp/base/partners
 * Create a new partner
 */
export const POST = kernel({
  method: "POST",
  routeId: "erp.base.partners.create",
  tenant: { required: true },
  auth: { mode: "required" },
  body: createPartnerInput,
  output: partnerOutput,

  async handler({ tenantId, actorId, body, ctx }) {
    if (!actorId) {
      throw new Error("Actor ID required");
    }

    const container = await getDomainContainer();
    const partnerService = container.get(ERP_BASE_TOKENS.PartnerService);
    const db = getDb();

    const partner = await partnerService.create(
      {
        tenantId,
        actorUserId: actorId,
        traceId: ctx.traceId,
      },
      body,
      db
    );

    return partner;
  },
});

/**
 * GET /api/erp/base/partners
 * List partners
 */
export const GET = kernel({
  method: "GET",
  routeId: "erp.base.partners.list",
  tenant: { required: true },
  auth: { mode: "required" },
  query: partnerListQuery,
  output: partnerListOutput,

  async handler({ tenantId, actorId, query, ctx }) {
    if (!actorId) {
      throw new Error("Actor ID required");
    }

    const container = await getDomainContainer();
    const partnerService = container.get(ERP_BASE_TOKENS.PartnerService);
    const db = getDb();

    const result = await partnerService.list(
      {
        tenantId,
        actorUserId: actorId,
        traceId: ctx.traceId,
      },
      query,
      db
    );

    return result;
  },
});
