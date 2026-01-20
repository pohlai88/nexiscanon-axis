// apps/web/app/api/reports/generate/route.ts
// POST /api/reports/generate - Generate report (EVI020)

import { apiKernel } from "@workspace/api-kernel";
import { reportGenerateInputSchema } from "@workspace/validation";
import { REPORTS_TOKENS } from "@workspace/domain";

export const POST = apiKernel.wrap(
  {
    routeId: "reports.generate",
    inputSchema: reportGenerateInputSchema,
  },
  async (ctx, input) => {
    const reportService = ctx.container.get(REPORTS_TOKENS.ReportService);

    const receipt = await reportService.generate(ctx.auth, {
      reportType: input.reportType,
      entityId: input.entityId,
      format: input.format,
      locale: input.locale,
      timeZone: input.timeZone,
      filters: input.filters,
    });

    return { data: receipt };
  }
);
