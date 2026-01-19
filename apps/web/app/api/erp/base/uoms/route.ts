// apps/web/app/api/erp/base/uoms/route.ts
// UoM collection endpoints

import { kernel } from "@workspace/api-kernel";
import { getDomainContainer, getDb } from "@workspace/app-runtime";
import { ERP_BASE_TOKENS } from "@workspace/domain";
import {
  createUomInput,
  uomOutput,
  uomListQuery,
  uomListOutput,
} from "@workspace/validation/erp/base/uom";

/**
 * POST /api/erp/base/uoms
 * Create a new unit of measure
 */
export const POST = kernel({
  method: "POST",
  routeId: "erp.base.uoms.create",
  tenant: { required: true },
  auth: { mode: "required" },
  body: createUomInput,
  output: uomOutput,

  async handler({ tenantId, actorId, body, ctx }) {
    if (!actorId) {
      throw new Error("Actor ID required");
    }

    const container = await getDomainContainer();
    const uomService = container.get(ERP_BASE_TOKENS.UomService);
    const db = getDb();

    const uom = await uomService.create(
      {
        tenantId,
        actorUserId: actorId,
        traceId: ctx.traceId,
      },
      body,
      db
    );

    return uom;
  },
});

/**
 * GET /api/erp/base/uoms
 * List units of measure
 */
export const GET = kernel({
  method: "GET",
  routeId: "erp.base.uoms.list",
  tenant: { required: true },
  auth: { mode: "required" },
  query: uomListQuery,
  output: uomListOutput,

  async handler({ tenantId, actorId, query, ctx }) {
    if (!actorId) {
      throw new Error("Actor ID required");
    }

    const container = await getDomainContainer();
    const uomService = container.get(ERP_BASE_TOKENS.UomService);
    const db = getDb();

    const result = await uomService.list(
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
