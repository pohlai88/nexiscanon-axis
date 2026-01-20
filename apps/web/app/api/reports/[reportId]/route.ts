// apps/web/app/api/reports/[reportId]/route.ts
// GET /api/reports/:reportId - Get report status (EVI020)

import { kernel } from "@workspace/api-kernel";
import { KernelError, ErrorCode } from "@workspace/api-kernel/errors";
import { reportGenerateOutputSchema } from "@workspace/validation";
import { REPORTS_TOKENS } from "@workspace/domain";
import { getDomainContainer } from "@workspace/app-runtime";

export const GET = kernel({
  method: "GET",
  routeId: "reports.get",
  tenant: { required: true },
  auth: { mode: "required" },
  output: reportGenerateOutputSchema,

  async handler({ tenantId, actorId, params, ctx }) {
    const reportId = params.reportId as string;

    if (!reportId) {
      throw new KernelError(ErrorCode.INVALID_INPUT, "Report ID is required");
    }

    if (!actorId) {
      throw new Error("Actor ID required");
    }

    const container = await getDomainContainer();
    const reportService = container.get(REPORTS_TOKENS.ReportService);

    const receipt = await reportService.getStatus(
      { tenantId, actorId, traceId: ctx.traceId },
      reportId
    );

    if (!receipt) {
      throw new KernelError(ErrorCode.NOT_FOUND, "Report not found");
    }

    return receipt;
  },
});
