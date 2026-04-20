/**
 * AI Configuration — OpenRouter provider settings.
 * All values are overridable via environment variables.
 */
function getConfig() {
  return {
    provider: 'openrouter',
    openrouter: {
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
    },
    models: {
      primary: process.env.AI_PRIMARY_MODEL || 'qwen/qwen-2.5-72b-instruct',
      fast: process.env.AI_FAST_MODEL || 'deepseek/deepseek-chat',
      fallback: process.env.AI_FALLBACK_MODEL || 'meta-llama/llama-3.3-70b-instruct',
      free: 'meta-llama/llama-3.1-8b-instruct:free',
    },
    cache: {
      enabled: process.env.AI_CACHE_ENABLED !== 'false',
      ttl: parseInt(process.env.AI_CACHE_TTL_SECONDS || '3600'),
    },
  };
}

module.exports = { getConfig };
