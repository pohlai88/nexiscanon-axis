// packages/domain/src/addons/erp.base/manifest.ts
// erp.base addon: foundation module for all ERP functionality
//
// Provides:
// - AuditService (durable business event logging)
// - SequenceService (document numbering - Phase 1)
// - PartnerService (customers/vendors - Phase 1)
// - ProductService (items - Phase 1)
// - UomService (units of measure - Phase 1)

import type { AddonManifest, AddonAPI } from "../../types";
import { ERP_AUDIT_SERVICE, type ErpAuditService } from "./services/audit-service";

// ---- Addon Manifest ----

export const erpBaseAddon: AddonManifest = {
  id: "erp.base",
  version: "0.1.0",
  dependsOn: ["core"], // depends on core for IdService

  async register(api: AddonAPI) {
    const { provideValue, deps } = api;

    // AuditService placeholder implementation
    // Full implementation will be added when DB connection is wired
    const auditService: ErpAuditService = {
      async emit(ctx, event) {
        // Phase 0: emit to domain event bus for now
        // Phase 1: will insert into erp_audit_events table
        api.events.emit({
          name: event.eventType,
          at: new Date().toISOString(),
          traceId: ctx.traceId,
          tenantId: ctx.tenantId,
          actorId: ctx.actorUserId,
          data: {
            entityType: event.entityType,
            entityId: event.entityId,
            payload: event.payload,
          },
        });
      },

      async emitBatch(ctx, events) {
        for (const event of events) {
          await this.emit(ctx, event);
        }
      },
    };

    provideValue(ERP_AUDIT_SERVICE, auditService);
  },
};

export default erpBaseAddon;
