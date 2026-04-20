/**
 * Migration 018 — pgvector RAG support
 * Adds vector embeddings to risks, BIA processes, and Sumood documents
 * for semantic search and AI context retrieval.
 */
exports.up = function (knex) {
  return knex.schema.raw(`
    -- Enable pgvector extension (requires superuser or extension grant)
    CREATE EXTENSION IF NOT EXISTS vector;

    -- Add embedding columns to key tables for semantic search
    ALTER TABLE risks
      ADD COLUMN IF NOT EXISTS embedding vector(1536);
    ALTER TABLE bia_processes
      ADD COLUMN IF NOT EXISTS embedding vector(1536);

    -- Create IVFFlat indexes for fast approximate nearest-neighbor search
    -- These indexes require at least 100 rows to be effective
    CREATE INDEX IF NOT EXISTS risks_embedding_idx
      ON risks USING ivfflat (embedding vector_cosine_ops)
      WITH (lists = 10);
    CREATE INDEX IF NOT EXISTS bia_processes_embedding_idx
      ON bia_processes USING ivfflat (embedding vector_cosine_ops)
      WITH (lists = 10);
  `);
};

exports.down = function (knex) {
  return knex.schema.raw(`
    DROP INDEX IF EXISTS risks_embedding_idx;
    DROP INDEX IF EXISTS bia_processes_embedding_idx;
    ALTER TABLE risks DROP COLUMN IF EXISTS embedding;
    ALTER TABLE bia_processes DROP COLUMN IF EXISTS embedding;
    DROP EXTENSION IF EXISTS vector;
  `);
};
