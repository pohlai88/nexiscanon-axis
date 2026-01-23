-- =============================================================================
-- STATUS: UNKNOWN
-- Origin: apps/web/db/migrations/003_add_embeddings.sql
-- Moved: 2026-01-24
-- Action: Check if embeddings table exists in Drizzle schema or production.
--         If not, consider adding to Drizzle schema properly.
-- =============================================================================

-- Migration: Add embeddings table for vector search
-- Requires: pgvector extension (Neon supports this natively)

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create embeddings table
CREATE TABLE IF NOT EXISTS embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('document', 'message', 'note', 'faq', 'help_article', 'custom')),
  source_id TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536) NOT NULL, -- OpenAI text-embedding-3-small dimension
  metadata JSONB DEFAULT '{}',
  chunk_index INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- HNSW index for fast approximate nearest neighbor search
-- Uses cosine similarity (most common for text embeddings)
CREATE INDEX IF NOT EXISTS embeddings_embedding_idx ON embeddings
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- B-tree indexes for filtering
CREATE INDEX IF NOT EXISTS embeddings_tenant_source_idx ON embeddings (tenant_id, source);
CREATE INDEX IF NOT EXISTS embeddings_source_id_idx ON embeddings (source_id);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_embeddings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER embeddings_updated_at
  BEFORE UPDATE ON embeddings
  FOR EACH ROW
  EXECUTE FUNCTION update_embeddings_updated_at();

-- Add comment
COMMENT ON TABLE embeddings IS 'Vector embeddings for semantic search and RAG';
COMMENT ON COLUMN embeddings.embedding IS 'OpenAI text-embedding-3-small (1536 dimensions)';
COMMENT ON COLUMN embeddings.source IS 'Origin type: document, message, note, faq, help_article, custom';
COMMENT ON COLUMN embeddings.source_id IS 'Reference ID of the source object';
COMMENT ON COLUMN embeddings.chunk_index IS 'Index when source is split into chunks';
