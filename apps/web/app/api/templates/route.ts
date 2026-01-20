import { kernel } from "@workspace/api-kernel";
import {
  templateCreateInputSchema,
  templateOutputSchema,
  templatesListOutputSchema,
} from "@workspace/validation";
import { getTemplatesRepo, getAuditLogsRepo } from "@workspace/app-runtime";

export const runtime = "nodejs";

/**
 * POST /api/templates
 * Create a new request template.
 * Requires authentication and tenant.
 */
export const POST = kernel({
  method: "POST",
  routeId: "templates.create",
  tenant: { required: true },
  auth: { mode: "required" },
  body: templateCreateInputSchema,
  output: templateOutputSchema,

  async handler({ tenantId, actorId, body, ctx }) {
    if (!actorId) {
      throw new Error("Actor ID required");
    }

    const templatesRepo = await getTemplatesRepo();

    const template = await templatesRepo.createTemplate({
      tenantId: tenantId!,
      actorId,
      input: body,
    });

    // Append audit log (EVI015)
    const auditRepo = await getAuditLogsRepo();
    await auditRepo.append({
      tenantId: tenantId!,
      actorId,
      traceId: ctx.traceId,
      eventName: "template.created",
      eventData: {
        templateId: template.id,
        name: template.name,
        evidencePolicy: {
          required: template.evidenceRequiredForApproval,
          ttlSeconds: template.evidenceTtlSeconds,
        },
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

/**
 * GET /api/templates
 * List all templates for the current tenant.
 * Requires authentication and tenant.
 */
export const GET = kernel({
  method: "GET",
  routeId: "templates.list",
  tenant: { required: true },
  auth: { mode: "required" },
  output: templatesListOutputSchema,

  async handler({ tenantId, actorId, ctx }) {
    const templatesRepo = await getTemplatesRepo();

    const templates = await templatesRepo.listTemplates({
      tenantId: tenantId!,
    });

    // Append audit log (EVI015)
    const auditRepo = await getAuditLogsRepo();
    await auditRepo.append({
      tenantId: tenantId!,
      actorId: actorId!,
      traceId: ctx.traceId,
      eventName: "template.listed",
      eventData: {
        count: templates.length,
      },
    });

    return {
      templates: templates.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        evidenceRequiredForApproval: t.evidenceRequiredForApproval,
        evidenceTtlSeconds: t.evidenceTtlSeconds,
        createdAt: t.createdAt.toISOString(),
      })),
    };
  },
});
