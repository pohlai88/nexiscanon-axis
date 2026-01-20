import { kernel } from "@workspace/api-kernel";
import { KernelError, ErrorCode } from "@workspace/api-kernel/errors";
import { templateOutputSchema } from "@workspace/validation";
import { getTemplatesRepo, getAuditLogsRepo } from "@workspace/app-runtime";

export const runtime = "nodejs";

/**
 * GET /api/templates/:id
 * Get a single template by ID (tenant-scoped).
 * Requires authentication and tenant.
 */
export const GET = kernel({
  method: "GET",
  routeId: "templates.get",
  tenant: { required: true },
  auth: { mode: "required" },
  output: templateOutputSchema,

  async handler({ tenantId, actorId, params, ctx }) {
    const templateId = params.id as string;

    if (!templateId) {
      throw new KernelError(ErrorCode.INVALID_INPUT, "Template ID is required");
    }

    const templatesRepo = await getTemplatesRepo();

    const template = await templatesRepo.findById({
      tenantId: tenantId!,
      templateId,
    });

    if (!template) {
      // Do NOT append audit on 404 (leak-safe)
      throw new KernelError(
        ErrorCode.NOT_FOUND,
        `Template ${templateId} not found`
      );
    }

    // Append audit log (EVI015) - success only
    const auditRepo = await getAuditLogsRepo();
    await auditRepo.append({
      tenantId: tenantId!,
      actorId: actorId!,
      traceId: ctx.traceId,
      eventName: "template.read",
      eventData: {
        templateId: template.id,
      },
    });

    return {
      id: template.id,
      tenantId: template.tenantId,
      name: template.name,
      description: template.description,
      evidenceRequiredForApproval: template.evidenceRequiredForApproval,
      evidenceTtlSeconds: template.evidenceTtlSeconds,
      createdAt: template.createdAt.toISOString(),
    };
  },
});
