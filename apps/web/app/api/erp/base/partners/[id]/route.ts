// apps/web/app/api/erp/base/partners/[id]/route.ts
// Partner item endpoints

import { kernel } from "@workspace/api-kernel";
import { getDomainContainer, getDb } from "@workspace/app-runtime";
import { ERP_BASE_TOKENS } from "@workspace/domain";
import {
  updatePartnerInput,
  partnerOutput,
} from "@workspace/validation/erp/base/partner";

/**
 * GET /api/erp/base/partners/:id
 * Get a partner by ID
 */
export const GET = kernel({
  method: "GET",
  routeId: "erp.base.partners.get",
  tenant: { required: true },
  auth: { mode: "required" },
  output: partnerOutput,

  async handler({ params, tenantId, actorId, ctx }) {
    if (!actorId) {
      throw new Error("Actor ID required");
    }

    const id = params?.id as string;
    if (!id) {
      throw new Error("Partner ID parameter required");
    }

    const container = await getDomainContainer();
    const partnerService = container.get(ERP_BASE_TOKENS.PartnerService);
    const db = getDb();

    const partner = await partnerService.get(
      {
        tenantId,
        actorUserId: actorId,
        traceId: ctx.traceId,
      },
      id,
      db
    );

    return partner;
  },
});

/**
 * PATCH /api/erp/base/partners/:id
 * Update a partner
 */
export const PATCH = kernel({
  method: "PATCH",
  routeId: "erp.base.partners.update",
  tenant: { required: true },
  auth: { mode: "required" },
  body: updatePartnerInput,
  output: partnerOutput,

  async handler({ params, body, tenantId, actorId, ctx }) {
    if (!actorId) {
      throw new Error("Actor ID required");
    }

    const id = params?.id as string;
    if (!id) {
      throw new Error("Partner ID parameter required");
    }

    const container = await getDomainContainer();
    const partnerService = container.get(ERP_BASE_TOKENS.PartnerService);
    const db = getDb();

    const partner = await partnerService.update(
      {
        tenantId,
        actorUserId: actorId,
        traceId: ctx.traceId,
      },
      id,
      body,
      db
    );

    return partner;
  },
});

/**
 * DELETE /api/erp/base/partners/:id
 * Archive a partner (soft delete)
 */
export const DELETE = kernel({
  method: "DELETE",
  routeId: "erp.base.partners.archive",
  tenant: { required: true },
  auth: { mode: "required" },
  output: partnerOutput,

  async handler({ params, tenantId, actorId, ctx }) {
    if (!actorId) {
      throw new Error("Actor ID required");
    }

    const id = params?.id as string;
    if (!id) {
      throw new Error("Partner ID parameter required");
    }

    const container = await getDomainContainer();
    const partnerService = container.get(ERP_BASE_TOKENS.PartnerService);
    const db = getDb();

    const partner = await partnerService.archive(
      {
        tenantId,
        actorUserId: actorId,
        traceId: ctx.traceId,
      },
      id,
      db
    );

    return partner;
  },
});
