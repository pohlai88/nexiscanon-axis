/**
 * Embeddings Schema
 *
 * Pattern: pgvector-based embeddings for semantic search and RAG.
 *
 * Requires PostgreSQL extension:
 * ```sql
 * CREATE EXTENSION IF NOT EXISTS vector;
 * ```
 *
 * @see https://neon.tech/docs/extensions/pgvector
 */

import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  index,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { tenants } from "./tenant";
import { users } from "./user";

/**
 * Embedding source types.
 *
 * Tracks where the embedded content originated.
 */
export const EMBEDDING_SOURCE = [
  "document",
  "message",
  "note",
  "faq",
  "help_article",
  "custom",
] as const;
export type EmbeddingSource = (typeof EMBEDDING_SOURCE)[number];

/**
 * Embeddings table.
 *
 * Stores vector embeddings for semantic search.
 *
 * NOTE: The `embedding` column uses a custom type for pgvector.
 * Drizzle doesn't have native pgvector support, so we use raw SQL.
 *
 * Migration SQL:
 * ```sql
 * CREATE EXTENSION IF NOT EXISTS vector;
 *
 * CREATE TABLE embeddings (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
 *   source TEXT NOT NULL CHECK (source IN ('document', 'message', 'note', 'faq', 'help_article', 'custom')),
 *   source_id TEXT NOT NULL,
 *   content TEXT NOT NULL,
 *   embedding vector(1536) NOT NULL,
 *   metadata JSONB DEFAULT '{}',
 *   chunk_index INTEGER DEFAULT 0,
 *   created_by UUID REFERENCES users(id) ON DELETE SET NULL,
 *   created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 *   updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
 * );
 *
 * -- HNSW index for fast approximate nearest neighbor search
 * CREATE INDEX embeddings_embedding_idx ON embeddings
 *   USING hnsw (embedding vector_cosine_ops)
 *   WITH (m = 16, ef_construction = 64);
 *
 * -- B-tree indexes for filtering
 * CREATE INDEX embeddings_tenant_source_idx ON embeddings (tenant_id, source);
 * CREATE INDEX embeddings_source_id_idx ON embeddings (source_id);
 * ```
 */
export const embeddings = pgTable(
  "embeddings",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    source: text("source").notNull().$type<EmbeddingSource>(),
    sourceId: text("source_id").notNull(),
    content: text("content").notNull(),
    // NOTE: embedding column is created via migration (vector type)
    // We define it here for type reference but actual column is vector(1536)
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    chunkIndex: integer("chunk_index").default(0),
    createdBy: uuid("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("embeddings_tenant_source_idx").on(table.tenantId, table.source),
    index("embeddings_source_id_idx").on(table.sourceId),
  ]
);

/**
 * Embeddings relations.
 */
export const embeddingsRelations = relations(embeddings, ({ one }) => ({
  tenant: one(tenants, {
    fields: [embeddings.tenantId],
    references: [tenants.id],
  }),
  createdByUser: one(users, {
    fields: [embeddings.createdBy],
    references: [users.id],
  }),
}));

/**
 * Inferred types.
 */
export type Embedding = typeof embeddings.$inferSelect;
export type NewEmbedding = typeof embeddings.$inferInsert;
