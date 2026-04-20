/**
 * Migration 018 — pgvector RAG support
 * Adds vector embeddings to risks, BIA processes, and Sumood documents
 * for semantic search and AI context retrieval.
 * 
 * NOTE: This migration is optional — if pgvector extension is not available
 * (e.g. on Railway free tier), it will skip silently and the platform
 * will work without semantic search features.
 */
exports.up = async function (knex) {
  try {
    await knex.schema.raw(`
      CREATE EXTENSION IF NOT EXISTS vector;

      ALTER TABLE risks
        ADD COLUMN IF NOT EXISTS embedding vector(1536);
      ALTER TABLE bia_processes
        ADD COLUMN IF NOT EXISTS embedding vector(1536);

      CREATE INDEX IF NOT EXISTS risks_embedding_idx
        ON risks USING ivfflat (embedding vector_cosine_ops)
        WITH (lists = 10);
      CREATE INDEX IF NOT EXISTS bia_processes_embedding_idx
        ON bia_processes USING ivfflat (embedding vector_cosine_ops)
        WITH (lists = 10);
    `);
  } catch (err) {
    console.warn('[Migration 018] pgvector not available — skipping RAG columns:', err.message);
    // Migration succeeds even without pgvector
  }
};

exports.down = async function (knex) {
  try {
    await knex.schema.raw(`
      DROP INDEX IF EXISTS risks_embedding_idx;
      DROP INDEX IF EXISTS bia_processes_embedding_idx;
      ALTER TABLE risks DROP COLUMN IF EXISTS embedding;
      ALTER TABLE bia_processes DROP COLUMN IF EXISTS embedding;
      DROP EXTENSION IF EXISTS vector;
    `);
  } catch {
    // ignore
  }
};
