// apps/web/app/api/reports/[reportId]/route.ts
// GET /api/reports/:reportId - Get report status (EVI020)

import { apiKernel } from "@workspace/api-kernel";
import { z } from "zod";
import { REPORTS_TOKENS } from "@workspace/domain";

const paramsSchema = z.object({
  reportId: z.string().uuid(),
});

export const GET = apiKernel.wrap(
  {
    routeId: "reports.get",
    inputSchema: paramsSchema,
  },
  async (ctx, input, { params }) => {
    const { reportId } = await params;
    const reportService = ctx.container.get(REPORTS_TOKENS.ReportService);

    const receipt = await reportService.getStatus(ctx.auth, reportId);

    if (!receipt) {
      return apiKernel.notFound("Report not found");
    }

    return { data: receipt };
  }
);
