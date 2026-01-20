// packages/domain/src/addons/reports/manifest.ts
// Reports addon: handles report generation contracts (EVI020)

import type { AddonManifest } from "../../types";
import { CORE_TOKENS } from "../core/manifest";
import { REPORTS_TOKENS, type ReportService } from "./tokens";
import type { ReportGenerateInput, ReportReceipt, ReportArtifact } from "./types";

// Re-export types for convenience
export type {
  ReportGenerateInput,
  ReportArtifact,
  ReportReceipt,
} from "./types";
export type { ReportService } from "./tokens";

// ---- Reports Addon Manifest ----

export const reportsAddon: AddonManifest = {
  id: "reports",
  version: "0.1.0",
  dependsOn: ["core"],

  async register({ provide, container }) {
    const auditService = container.get(CORE_TOKENS.AuditService);
    const idService = container.get(CORE_TOKENS.IdService);

    // In-memory store for report receipts (stub)
    const receipts = new Map<string, ReportReceipt>();

    // ReportService: generates report contracts (no renderer yet)
    provide(REPORTS_TOKENS.ReportService, () => {
      const service: ReportService = {
        async generate(ctx, input) {
          if (!ctx.tenantId) {
            throw new Error("Tenant ID required");
          }

          const jobId = idService.newId();
          const reportId = idService.newId();
          const now = new Date().toISOString();

          // Generate stub artifact based on format
          let artifact: ReportArtifact | null = null;

          if (input.format === "json") {
            artifact = {
              kind: "inline_json",
              summary: {
                reportType: input.reportType,
                entityId: input.entityId,
                note: "Stub data - renderer not implemented",
              },
            };
          } else if (input.format === "pdf_placeholder") {
            artifact = {
              kind: "placeholder",
              note: "renderer_not_enabled",
            };
          }

          const receipt: ReportReceipt = {
            jobId,
            reportId,
            reportType: input.reportType,
            entityId: input.entityId,
            format: input.format,
            status: "ACCEPTED",
            artifact,
            createdAt: now,
          };

          // Store receipt
          receipts.set(`${ctx.tenantId}:${reportId}`, receipt);

          // Emit audit event
          await auditService.write({
            name: "report.generate.requested",
            ctx,
            data: {
              reportId,
              jobId,
              reportType: input.reportType,
              entityId: input.entityId,
              format: input.format,
              locale: input.locale ?? null,
              source: "api",
            },
          });

          return receipt;
        },

        async getStatus(ctx, reportId) {
          if (!ctx.tenantId) {
            throw new Error("Tenant ID required");
          }

          return receipts.get(`${ctx.tenantId}:${reportId}`) ?? null;
        },
      };

      return service;
    });
  },
};
