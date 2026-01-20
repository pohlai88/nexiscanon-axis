// packages/db/src/repos/request-evidence-links-repo.ts
// Repository for request_evidence_links table (tenant-scoped)

import { eq, and } from "drizzle-orm";
import { type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "../schema";
import type { RequestEvidenceLink, NewRequestEvidenceLink } from "../schema";

export type RequestEvidenceLinksRepository = {
  create(params: {
    id: string;
    tenantId: string;
    requestId: string;
    evidenceFileId: string;
    linkedBy: string;
  }): Promise<RequestEvidenceLink>;

  listByRequestId(requestId: string, tenantId: string): Promise<
    Array<
      RequestEvidenceLink & {
        evidenceFile: {
          id: string;
          originalName: string;
          mimeType: string;
          sizeBytes: number;
          status: string;
          createdAt: Date;
        };
      }
    >
  >;

  findLink(
    requestId: string,
    evidenceFileId: string,
    tenantId: string
  ): Promise<RequestEvidenceLink | null>;

  checkEvidenceFreshness(
    requestId: string,
    tenantId: string,
    ttlSeconds: number | null
  ): Promise<{
    hasEvidence: boolean;
    isFresh: boolean | null; // null if no TTL policy
    latestEvidenceAt: Date | null;
    ageSeconds: number | null;
  }>;
};

export function createRequestEvidenceLinksRepository(
  db: PostgresJsDatabase<typeof schema>
): RequestEvidenceLinksRepository {
  return {
    async create(params) {
      const [link] = await db
        .insert(schema.requestEvidenceLinks)
        .values({
          id: params.id,
          tenantId: params.tenantId,
          requestId: params.requestId,
          evidenceFileId: params.evidenceFileId,
          linkedBy: params.linkedBy,
        })
        .returning();

      return link;
    },

    async listByRequestId(requestId, tenantId) {
      const results = await db
        .select({
          id: schema.requestEvidenceLinks.id,
          tenantId: schema.requestEvidenceLinks.tenantId,
          requestId: schema.requestEvidenceLinks.requestId,
          evidenceFileId: schema.requestEvidenceLinks.evidenceFileId,
          linkedBy: schema.requestEvidenceLinks.linkedBy,
          createdAt: schema.requestEvidenceLinks.createdAt,
          evidenceFile: {
            id: schema.evidenceFiles.id,
            originalName: schema.evidenceFiles.originalName,
            mimeType: schema.evidenceFiles.mimeType,
            sizeBytes: schema.evidenceFiles.sizeBytes,
            status: schema.evidenceFiles.status,
            createdAt: schema.evidenceFiles.createdAt,
          },
        })
        .from(schema.requestEvidenceLinks)
        .innerJoin(
          schema.evidenceFiles,
          eq(schema.requestEvidenceLinks.evidenceFileId, schema.evidenceFiles.id)
        )
        .where(
          and(
            eq(schema.requestEvidenceLinks.requestId, requestId),
            eq(schema.requestEvidenceLinks.tenantId, tenantId)
          )
        );

      return results;
    },

    async findLink(requestId, evidenceFileId, tenantId) {
      const [link] = await db
        .select()
        .from(schema.requestEvidenceLinks)
        .where(
          and(
            eq(schema.requestEvidenceLinks.requestId, requestId),
            eq(schema.requestEvidenceLinks.evidenceFileId, evidenceFileId),
            eq(schema.requestEvidenceLinks.tenantId, tenantId)
          )
        )
        .limit(1);

      return link || null;
    },

    async checkEvidenceFreshness(requestId, tenantId, ttlSeconds) {
      // Get latest evidence linked to this request
      const links = await db
        .select({
          createdAt: schema.requestEvidenceLinks.createdAt,
        })
        .from(schema.requestEvidenceLinks)
        .where(
          and(
            eq(schema.requestEvidenceLinks.requestId, requestId),
            eq(schema.requestEvidenceLinks.tenantId, tenantId)
          )
        )
        .orderBy(schema.requestEvidenceLinks.createdAt)
        .limit(1);

      if (links.length === 0) {
        return {
          hasEvidence: false,
          isFresh: null,
          latestEvidenceAt: null,
          ageSeconds: null,
        };
      }

      const latestEvidenceAt = links[0].createdAt;
      const now = new Date();
      const ageSeconds = Math.floor(
        (now.getTime() - latestEvidenceAt.getTime()) / 1000
      );

      // If no TTL policy, evidence is always "fresh" (no age check)
      if (ttlSeconds === null) {
        return {
          hasEvidence: true,
          isFresh: null, // null = no TTL policy
          latestEvidenceAt,
          ageSeconds,
        };
      }

      // Check if evidence is within TTL window
      const isFresh = ageSeconds <= ttlSeconds;

      return {
        hasEvidence: true,
        isFresh,
        latestEvidenceAt,
        ageSeconds,
      };
    },
  };
}
