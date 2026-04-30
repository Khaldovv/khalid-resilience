/**
 * AI Configuration — OpenRouter provider settings.
 * All values are overridable via environment variables.
 *
 * Model IDs must match valid OpenRouter model slugs.
 * See https://openrouter.ai/models for the full list.
 */
function getConfig() {
  return {
    provider: 'openrouter',
    openrouter: {
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
    },
    models: {
      // Primary: high-quality model for complex reasoning (Arabic + English)
      primary: process.env.AI_PRIMARY_MODEL || 'qwen/qwen3-235b-a22b',
      // Fast: lightweight model for quick tasks
      fast: process.env.AI_FAST_MODEL || 'deepseek/deepseek-chat-v3-0324:free',
      // Fallback: backup model if primary/fast fail
      fallback: process.env.AI_FALLBACK_MODEL || 'meta-llama/llama-3.3-70b-instruct',
      // Free tier model (always free on OpenRouter)
      free: 'deepseek/deepseek-chat-v3-0324:free',
    },
    cache: {
      enabled: process.env.AI_CACHE_ENABLED !== 'false',
      ttl: parseInt(process.env.AI_CACHE_TTL_SECONDS || '3600'),
    },
  };
}

module.exports = { getConfig };
