// apps/web/app/api/reports/generate/route.ts
// POST /api/reports/generate - Generate report (EVI020)

import { kernel } from "@workspace/api-kernel";
import { reportGenerateInputSchema, reportGenerateOutputSchema } from "@workspace/validation";
import { REPORTS_TOKENS } from "@workspace/domain";
import { getDomainContainer } from "@workspace/app-runtime";

export const POST = kernel({
  method: "POST",
  routeId: "reports.generate",
  tenant: { required: true },
  auth: { mode: "required" },
  body: reportGenerateInputSchema,
  output: reportGenerateOutputSchema,

  async handler({ tenantId, actorId, ctx, body }) {
    if (!actorId) {
      throw new Error("Actor ID required");
    }

    const container = await getDomainContainer();
    const reportService = container.get(REPORTS_TOKENS.ReportService);

    const receipt = await reportService.generate(
      { tenantId, actorId, traceId: ctx.traceId },
      {
        reportType: body.reportType,
        entityId: body.entityId,
        format: body.format,
        locale: body.locale,
        timeZone: body.timeZone,
        filters: body.filters,
      }
    );

    return receipt;
  },
});
