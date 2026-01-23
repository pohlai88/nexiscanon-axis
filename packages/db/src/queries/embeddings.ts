/**
 * Embedding Query Functions
 *
 * Pattern: Drizzle ORM queries for vector search with pgvector.
 *
 * NOTE: Some queries use raw SQL due to pgvector operators not being
 * natively supported by Drizzle ORM.
 */

import { eq, and, sql, inArray } from "drizzle-orm";
import type { Database } from "../client/neon";
import {
  embeddings,
  type Embedding,
  type EmbeddingSource,
} from "../schema/embeddings";

/**
 * Search result with similarity score.
 */
export interface EmbeddingSearchResult {
  id: string;
  content: string;
  source: EmbeddingSource;
  sourceId: string;
  metadata: Record<string, unknown> | null;
  chunkIndex: number | null;
  similarity: number;
}

/**
 * Insert a new embedding.
 *
 * NOTE: The embedding vector must be passed via raw SQL.
 */
export async function insertEmbedding(
  db: Database,
  data: {
    tenantId: string;
    source: EmbeddingSource;
    sourceId: string;
    content: string;
    embedding: number[];
    metadata?: Record<string, unknown>;
    chunkIndex?: number;
    createdBy?: string;
  }
): Promise<string> {
  const embeddingVector = `[${data.embedding.join(",")}]`;

  const result = await db.execute(sql`
    INSERT INTO embeddings (
      tenant_id, source, source_id, content, embedding, metadata, chunk_index, created_by
    ) VALUES (
      ${data.tenantId}::uuid,
      ${data.source},
      ${data.sourceId},
      ${data.content},
      ${embeddingVector}::vector,
      ${JSON.stringify(data.metadata ?? {})}::jsonb,
      ${data.chunkIndex ?? 0},
      ${data.createdBy ?? null}::uuid
    )
    RETURNING id
  `);

  return (result.rows[0] as { id: string }).id;
}

/**
 * Insert multiple embeddings in a batch.
 */
export async function insertEmbeddingsBatch(
  db: Database,
  items: Array<{
    tenantId: string;
    source: EmbeddingSource;
    sourceId: string;
    content: string;
    embedding: number[];
    metadata?: Record<string, unknown>;
    chunkIndex?: number;
    createdBy?: string;
  }>
): Promise<string[]> {
  if (items.length === 0) return [];

  // Build VALUES clause
  const values = items.map((item, idx) => {
    const embeddingVector = `[${item.embedding.join(",")}]`;
    return sql`(
      ${item.tenantId}::uuid,
      ${item.source},
      ${item.sourceId},
      ${item.content},
      ${embeddingVector}::vector,
      ${JSON.stringify(item.metadata ?? {})}::jsonb,
      ${item.chunkIndex ?? idx},
      ${item.createdBy ?? null}::uuid
    )`;
  });

  const result = await db.execute(sql`
    INSERT INTO embeddings (
      tenant_id, source, source_id, content, embedding, metadata, chunk_index, created_by
    ) VALUES ${sql.join(values, sql`, `)}
    RETURNING id
  `);

  return result.rows.map((row) => (row as { id: string }).id);
}

/**
 * Search for similar embeddings using cosine similarity.
 *
 * Uses pgvector's `<=>` operator for cosine distance (1 - similarity).
 */
export async function searchEmbeddings(
  db: Database,
  params: {
    tenantId: string;
    embedding: number[];
    limit?: number;
    minSimilarity?: number;
    sources?: EmbeddingSource[];
  }
): Promise<EmbeddingSearchResult[]> {
  const { tenantId, embedding, limit = 10, minSimilarity = 0.5, sources } = params;
  const embeddingVector = `[${embedding.join(",")}]`;

  // Build source filter if provided
  const sourceFilter = sources?.length
    ? sql`AND source = ANY(${sources}::text[])`
    : sql``;

  const result = await db.execute(sql`
    SELECT
      id,
      content,
      source,
      source_id,
      metadata,
      chunk_index,
      1 - (embedding <=> ${embeddingVector}::vector) as similarity
    FROM embeddings
    WHERE tenant_id = ${tenantId}::uuid
      AND 1 - (embedding <=> ${embeddingVector}::vector) >= ${minSimilarity}
      ${sourceFilter}
    ORDER BY embedding <=> ${embeddingVector}::vector
    LIMIT ${limit}
  `);

  return result.rows.map((row) => ({
    id: (row as Record<string, unknown>).id as string,
    content: (row as Record<string, unknown>).content as string,
    source: (row as Record<string, unknown>).source as EmbeddingSource,
    sourceId: (row as Record<string, unknown>).source_id as string,
    metadata: (row as Record<string, unknown>).metadata as Record<string, unknown> | null,
    chunkIndex: (row as Record<string, unknown>).chunk_index as number | null,
    similarity: Number((row as Record<string, unknown>).similarity),
  }));
}

/**
 * Delete embeddings for a source.
 */
export async function deleteEmbeddingsBySource(
  db: Database,
  tenantId: string,
  source: EmbeddingSource,
  sourceId: string
): Promise<number> {
  const result = await db
    .delete(embeddings)
    .where(
      and(
        eq(embeddings.tenantId, tenantId),
        eq(embeddings.source, source),
        eq(embeddings.sourceId, sourceId)
      )
    )
    .returning({ id: embeddings.id });

  return result.length;
}

/**
 * Delete embeddings by IDs.
 */
export async function deleteEmbeddingsById(
  db: Database,
  tenantId: string,
  ids: string[]
): Promise<number> {
  if (ids.length === 0) return 0;

  const result = await db
    .delete(embeddings)
    .where(
      and(eq(embeddings.tenantId, tenantId), inArray(embeddings.id, ids))
    )
    .returning({ id: embeddings.id });

  return result.length;
}

/**
 * Get embedding by ID.
 */
export async function getEmbeddingById(
  db: Database,
  id: string
): Promise<Embedding | null> {
  const result = await db
    .select()
    .from(embeddings)
    .where(eq(embeddings.id, id))
    .limit(1);

  return result[0] ?? null;
}

/**
 * List embeddings for a source.
 */
export async function listEmbeddingsBySource(
  db: Database,
  tenantId: string,
  source: EmbeddingSource,
  sourceId: string
): Promise<Embedding[]> {
  return db
    .select()
    .from(embeddings)
    .where(
      and(
        eq(embeddings.tenantId, tenantId),
        eq(embeddings.source, source),
        eq(embeddings.sourceId, sourceId)
      )
    )
    .orderBy(embeddings.chunkIndex);
}

/**
 * Count embeddings for a tenant.
 */
export async function countEmbeddings(
  db: Database,
  tenantId: string,
  source?: EmbeddingSource
): Promise<number> {
  const result = await db.execute(sql`
    SELECT COUNT(*) as count
    FROM embeddings
    WHERE tenant_id = ${tenantId}::uuid
    ${source ? sql`AND source = ${source}` : sql``}
  `);

  return Number((result.rows[0] as { count: string }).count);
}
