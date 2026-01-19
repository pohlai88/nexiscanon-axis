// packages/db/src/repos/evidence-files-repo.ts
// Repository for evidence_files table (tenant-scoped)

import { eq, and } from "drizzle-orm";
import { type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "../schema";
import type { EvidenceFile, NewEvidenceFile } from "../schema";

export type EvidenceFileRepository = {
  create(params: {
    id: string;
    tenantId: string;
    uploadedBy: string;
    originalName: string;
    mimeType: string;
    sizeBytes: number;
    r2Key: string;
    sourceR2Key?: string;
    viewR2Key?: string;
    status: "READY" | "CONVERT_PENDING" | "CONVERT_FAILED" | "REJECTED_UNSUPPORTED";
    sha256?: string;
  }): Promise<EvidenceFile>;

  findById(id: string, tenantId: string): Promise<EvidenceFile | null>;

  updateStatus(
    id: string,
    tenantId: string,
    status: "READY" | "CONVERT_PENDING" | "CONVERT_FAILED" | "REJECTED_UNSUPPORTED"
  ): Promise<EvidenceFile>;

  updateViewKey(
    id: string,
    tenantId: string,
    viewR2Key: string,
    status: "READY" | "CONVERT_FAILED"
  ): Promise<EvidenceFile>;
};

export function createEvidenceFileRepository(
  db: PostgresJsDatabase<typeof schema>
): EvidenceFileRepository {
  return {
    async create(params) {
      const [file] = await db
        .insert(schema.evidenceFiles)
        .values({
          id: params.id,
          tenantId: params.tenantId,
          uploadedBy: params.uploadedBy,
          originalName: params.originalName,
          mimeType: params.mimeType,
          sizeBytes: params.sizeBytes,
          r2Key: params.r2Key,
          sourceR2Key: params.sourceR2Key,
          viewR2Key: params.viewR2Key,
          status: params.status,
          sha256: params.sha256,
        })
        .returning();

      return file;
    },

    async findById(id, tenantId) {
      const [file] = await db
        .select()
        .from(schema.evidenceFiles)
        .where(
          and(
            eq(schema.evidenceFiles.id, id),
            eq(schema.evidenceFiles.tenantId, tenantId)
          )
        )
        .limit(1);

      return file || null;
    },

    async updateStatus(id, tenantId, status) {
      const [file] = await db
        .update(schema.evidenceFiles)
        .set({ status })
        .where(
          and(
            eq(schema.evidenceFiles.id, id),
            eq(schema.evidenceFiles.tenantId, tenantId)
          )
        )
        .returning();

      return file;
    },

    async updateViewKey(id, tenantId, viewR2Key, status) {
      const [file] = await db
        .update(schema.evidenceFiles)
        .set({ viewR2Key, status })
        .where(
          and(
            eq(schema.evidenceFiles.id, id),
            eq(schema.evidenceFiles.tenantId, tenantId)
          )
        )
        .returning();

      return file;
    },
  };
}
