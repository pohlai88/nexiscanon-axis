// apps/web/app/api/erp/base/uoms/[id]/route.ts
// UoM item endpoints

import { kernel } from "@workspace/api-kernel";
import { getDomainContainer, getDb } from "@workspace/app-runtime";
import { ERP_BASE_TOKENS } from "@workspace/domain";
import {
  updateUomInput,
  uomOutput,
} from "@workspace/validation/erp/base/uom";

/**
 * GET /api/erp/base/uoms/:id
 * Get a unit of measure by ID
 */
export const GET = kernel({
  method: "GET",
  routeId: "erp.base.uoms.get",
  tenant: { required: true },
  auth: { mode: "required" },
  output: uomOutput,

  async handler({ params, tenantId, actorId, ctx }) {
    if (!actorId) {
      throw new Error("Actor ID required");
    }

    const id = params?.id as string;
    if (!id) {
      throw new Error("UoM ID parameter required");
    }

    const container = await getDomainContainer();
    const uomService = container.get(ERP_BASE_TOKENS.UomService);
    const db = getDb();

    const uom = await uomService.get(
      {
        tenantId,
        actorUserId: actorId,
        traceId: ctx.traceId,
      },
      id,
      db
    );

    return uom;
  },
});

/**
 * PATCH /api/erp/base/uoms/:id
 * Update a unit of measure
 */
export const PATCH = kernel({
  method: "PATCH",
  routeId: "erp.base.uoms.update",
  tenant: { required: true },
  auth: { mode: "required" },
  body: updateUomInput,
  output: uomOutput,

  async handler({ params, body, tenantId, actorId, ctx }) {
    if (!actorId) {
      throw new Error("Actor ID required");
    }

    const id = params?.id as string;
    if (!id) {
      throw new Error("UoM ID parameter required");
    }

    const container = await getDomainContainer();
    const uomService = container.get(ERP_BASE_TOKENS.UomService);
    const db = getDb();

    const uom = await uomService.update(
      {
        tenantId,
        actorUserId: actorId,
        traceId: ctx.traceId,
      },
      id,
      body,
      db
    );

    return uom;
  },
});

/**
 * DELETE /api/erp/base/uoms/:id
 * Archive a unit of measure (soft delete)
 */
export const DELETE = kernel({
  method: "DELETE",
  routeId: "erp.base.uoms.archive",
  tenant: { required: true },
  auth: { mode: "required" },
  output: uomOutput,

  async handler({ params, tenantId, actorId, ctx }) {
    if (!actorId) {
      throw new Error("Actor ID required");
    }

    const id = params?.id as string;
    if (!id) {
      throw new Error("UoM ID parameter required");
    }

    const container = await getDomainContainer();
    const uomService = container.get(ERP_BASE_TOKENS.UomService);
    const db = getDb();

    const uom = await uomService.archive(
      {
        tenantId,
        actorUserId: actorId,
        traceId: ctx.traceId,
      },
      id,
      db
    );

    return uom;
  },
});
