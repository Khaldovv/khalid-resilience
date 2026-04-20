/**
 * Embedding Service — RAG (Retrieval-Augmented Generation) support.
 *
 * Uses OpenRouter to generate embeddings for risk descriptions,
 * BIA processes, and other text content. Stores them as pgvector
 * columns for fast semantic search.
 */
const db = require('../config/database');
const logger = require('../config/logger');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const EMBEDDING_MODEL = 'openai/text-embedding-3-small';
const EMBEDDING_DIM = 1536;

/**
 * Generate embedding vector for a text string using OpenRouter.
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>} Embedding vector (1536 dimensions)
 */
async function generateEmbedding(text) {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY not configured — embeddings disabled');
  }

  const cleanText = text.replace(/\s+/g, ' ').trim().slice(0, 8000);

  try {
    const response = await fetch('https://openrouter.ai/api/v1/embeddings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: cleanText,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Embedding API error: ${response.status} ${err}`);
    }

    const data = await response.json();
    return data.data?.[0]?.embedding || [];
  } catch (err) {
    logger.error('Embedding generation failed', { error: err.message, textLength: text.length });
    throw err;
  }
}

/**
 * Embed text content and store it in the specified table.
 * @param {string} table - Database table name
 * @param {string|number} id - Row ID
 * @param {string} text - Text to embed
 */
async function embedAndStore(table, id, text) {
  const embedding = await generateEmbedding(text);

  await db(table)
    .where('id', id)
    .update({ embedding: JSON.stringify(embedding) });

  logger.info('Embedding stored', { table, id, dim: embedding.length });
}

/**
 * Perform semantic search using cosine distance.
 * @param {string} table - Table to search
 * @param {string} query - Natural language query
 * @param {number} limit - Max results (default 5)
 * @param {string[]} selectColumns - Additional columns to return
 * @returns {Promise<Array>} Matching rows sorted by relevance
 */
async function semanticSearch(table, query, limit = 5, selectColumns = ['*']) {
  const queryEmbedding = await generateEmbedding(query);
  const embeddingStr = `[${queryEmbedding.join(',')}]`;

  const results = await db.raw(`
    SELECT ${selectColumns.join(', ')},
           embedding <=> ?::vector AS distance
    FROM ${table}
    WHERE embedding IS NOT NULL
    ORDER BY distance ASC
    LIMIT ?
  `, [embeddingStr, limit]);

  return results.rows || [];
}

/**
 * Batch embed all un-embedded rows in a table.
 * Used for initial backfill after migration.
 * @param {string} table - Table to backfill
 * @param {string} textColumn - Column containing text to embed
 * @param {number} batchSize - Rows per batch (default 50)
 */
async function backfillEmbeddings(table, textColumn, batchSize = 50) {
  const unembedded = await db(table)
    .whereNull('embedding')
    .limit(batchSize)
    .select('id', textColumn);

  let count = 0;
  for (const row of unembedded) {
    try {
      const text = row[textColumn];
      if (!text || text.length < 10) continue;

      await embedAndStore(table, row.id, text);
      count++;

      // Rate limit: ~50 requests per second for embedding API
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (err) {
      logger.warn('Backfill skip', { table, id: row.id, error: err.message });
    }
  }

  logger.info('Backfill complete', { table, count, total: unembedded.length });
  return count;
}

/**
 * Build context for AI Agent by finding semantically similar content.
 * @param {string} userQuery - User's question
 * @param {number} topK - Results per table
 * @returns {Promise<string>} Compiled context string
 */
async function buildRAGContext(userQuery, topK = 3) {
  const context = [];

  try {
    const risks = await semanticSearch('risks', userQuery, topK, ['id', 'risk_name', 'description', 'risk_type', 'inherent_likelihood', 'inherent_impact']);
    if (risks.length > 0) {
      context.push('=== Related Risks ===');
      risks.forEach(r => {
        context.push(`- [${r.id}] ${r.risk_name}: ${r.description} (Type: ${r.risk_type}, Score: ${(r.inherent_likelihood || 0) * (r.inherent_impact || 0)})`);
      });
    }
  } catch { /* table may not have embeddings yet */ }

  try {
    const processes = await semanticSearch('bia_processes', userQuery, topK, ['id', 'process_name', 'description', 'rto_hours', 'rpo_hours']);
    if (processes.length > 0) {
      context.push('=== Related BIA Processes ===');
      processes.forEach(p => {
        context.push(`- [${p.id}] ${p.process_name}: ${p.description} (RTO: ${p.rto_hours}h, RPO: ${p.rpo_hours}h)`);
      });
    }
  } catch { /* table may not have embeddings yet */ }

  return context.join('\n');
}

module.exports = {
  generateEmbedding,
  embedAndStore,
  semanticSearch,
  backfillEmbeddings,
  buildRAGContext,
};
