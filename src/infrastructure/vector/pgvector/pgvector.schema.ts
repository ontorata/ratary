/**
 * DDL for pgvector-backed memory_vectors table (ADR-011).
 * Apply via ops runbook before enabling VECTOR_PROVIDER=pgvector.
 */
export const PGVECTOR_EXTENSION_SQL = `CREATE EXTENSION IF NOT EXISTS vector;`;

export const PGVECTOR_MEMORY_VECTORS_DDL = `
CREATE TABLE IF NOT EXISTS memory_vectors (
  id TEXT PRIMARY KEY,
  memory_id TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  workspace_id TEXT,
  model_id TEXT NOT NULL,
  dimensions INTEGER NOT NULL,
  embedding vector NOT NULL,
  content_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  UNIQUE (memory_id, owner_id, model_id)
);

CREATE INDEX IF NOT EXISTS idx_memory_vectors_owner ON memory_vectors(owner_id);
`;
