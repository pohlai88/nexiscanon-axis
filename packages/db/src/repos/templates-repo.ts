// packages/db/src/repos/templates-repo.ts
// Drizzle implementation of TemplatesRepository port

import { and, eq } from "drizzle-orm";
import type { Database } from "../client";
import { requestTemplates } from "../schema";

export type TemplateCreateInput = {
  name: string;
  description?: string | null;
  evidenceRequiredForApproval?: boolean;
  evidenceTtlSeconds?: number | null;
};

export type TemplateDTO = {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  evidenceRequiredForApproval: boolean;
  evidenceTtlSeconds: number | null;
  createdAt: Date;
};

/**
 * Create Drizzle-backed TemplatesRepository.
 * All queries are tenant-scoped (enforces tenant discipline).
 */
export function createTemplatesRepo(db: Database) {
  return {
    async createTemplate(args: {
      tenantId: string;
      actorId: string;
      input: TemplateCreateInput;
    }): Promise<TemplateDTO> {
      const now = new Date();

      const [row] = await db
        .insert(requestTemplates)
        .values({
          tenantId: args.tenantId,
          name: args.input.name,
          description: args.input.description ?? null,
          evidenceRequiredForApproval:
            args.input.evidenceRequiredForApproval ?? false,
          evidenceTtlSeconds: args.input.evidenceTtlSeconds ?? null,
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      return {
        id: row.id,
        tenantId: row.tenantId,
        name: row.name,
        description: row.description,
        evidenceRequiredForApproval: row.evidenceRequiredForApproval,
        evidenceTtlSeconds: row.evidenceTtlSeconds,
        createdAt: row.createdAt,
      };
    },

    async listTemplates(args: { tenantId: string }): Promise<TemplateDTO[]> {
      const rows = await db
        .select()
        .from(requestTemplates)
        .where(eq(requestTemplates.tenantId, args.tenantId))
        .orderBy(requestTemplates.createdAt);

      return rows.map((row) => ({
        id: row.id,
        tenantId: row.tenantId,
        name: row.name,
        description: row.description,
        evidenceRequiredForApproval: row.evidenceRequiredForApproval,
        evidenceTtlSeconds: row.evidenceTtlSeconds,
        createdAt: row.createdAt,
      }));
    },

    async findById(args: {
      tenantId: string;
      templateId: string;
    }): Promise<TemplateDTO | null> {
      const [row] = await db
        .select()
        .from(requestTemplates)
        .where(
          and(
            eq(requestTemplates.tenantId, args.tenantId),
            eq(requestTemplates.id, args.templateId)
          )
        )
        .limit(1);

      if (!row) return null;

      return {
        id: row.id,
        tenantId: row.tenantId,
        name: row.name,
        description: row.description,
        evidenceRequiredForApproval: row.evidenceRequiredForApproval,
        evidenceTtlSeconds: row.evidenceTtlSeconds,
        createdAt: row.createdAt,
      };
    },
  };
}
