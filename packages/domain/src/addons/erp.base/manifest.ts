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
    const { provideValue } = api;

    // AuditService implementation
    // Phase 0: uses event bus (will use DB transaction in Phase 1)
    const auditService: ErpAuditService = {
      async emitTx(tx, ctx, event) {
        // Phase 1: will use tx.insert(erpAuditEvents).values(...)
        // For now: emit to event bus (Phase 0 only)
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
            _note: "Phase 0: event bus only, not durable",
          },
        });
      },

      async emitBatchTx(tx, ctx, events) {
        for (const event of events) {
          await this.emitTx(tx, ctx, event);
        }
      },

      async emitDiagnostic(ctx, event) {
        // Diagnostic events (no tx required)
        api.events.emit({
          name: `diagnostic.${event.eventType}`,
          at: new Date().toISOString(),
          traceId: ctx.traceId,
          tenantId: ctx.tenantId,
          data: {
            entityType: event.entityType,
            entityId: event.entityId,
            payload: event.payload,
          },
        });
      },
    };

    provideValue(ERP_AUDIT_SERVICE, auditService);
  },
};

export default erpBaseAddon;
