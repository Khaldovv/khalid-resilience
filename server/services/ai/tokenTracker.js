/**
 * Token Tracker — logs every AI call with cost estimates, provides aggregated stats.
 */
const db = require('../../config/database');

class TokenTracker {
  async track({ feature, userId, model, inputTokens, outputTokens, latencyMs, estimatedCostUSD }) {
    try {
      await db('ai_usage_logs').insert({
        feature,
        user_id: userId || null,
        model,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        total_tokens: inputTokens + outputTokens,
        latency_ms: latencyMs,
        estimated_cost_usd: estimatedCostUSD,
        created_at: new Date(),
      });
    } catch {
      // Table may not exist yet — silently ignore
    }
  }

  async trackCacheHit(feature, userId) {
    try {
      await db('ai_usage_logs').insert({
        feature,
        user_id: userId || null,
        is_cache_hit: true,
        created_at: new Date(),
      });
    } catch {
      // Table may not exist yet
    }
  }

  async getUsageStats(period = '30days') {
    const since = new Date(Date.now() - this._periodToMs(period));

    try {
      const totalCost = await db('ai_usage_logs')
        .where('created_at', '>=', since)
        .sum('estimated_cost_usd as total_usd')
        .first();

      const byFeature = await db('ai_usage_logs')
        .where('created_at', '>=', since)
        .groupBy('feature')
        .select('feature')
        .sum('total_tokens as tokens')
        .sum('estimated_cost_usd as cost_usd')
        .count('id as calls')
        .avg('latency_ms as avg_latency');

      const byModel = await db('ai_usage_logs')
        .where('created_at', '>=', since)
        .whereNotNull('model')
        .groupBy('model')
        .select('model')
        .sum('total_tokens as tokens')
        .sum('estimated_cost_usd as cost_usd')
        .count('id as calls');

      const cacheStats = await db('ai_usage_logs')
        .where('created_at', '>=', since)
        .select(
          db.raw('COUNT(*) as total_calls'),
          db.raw('COUNT(*) FILTER (WHERE is_cache_hit = true) as cache_hits')
        )
        .first();

      const hitRate = cacheStats && cacheStats.total_calls > 0
        ? (cacheStats.cache_hits / cacheStats.total_calls) * 100
        : 0;

      return {
        totalCostUSD: parseFloat(totalCost?.total_usd || 0),
        totalCostSAR: parseFloat(totalCost?.total_usd || 0) * 3.75,
        byFeature,
        byModel,
        cacheHitRate: parseFloat(hitRate.toFixed(1)),
      };
    } catch {
      return {
        totalCostUSD: 0, totalCostSAR: 0,
        byFeature: [], byModel: [], cacheHitRate: 0,
      };
    }
  }

  _periodToMs(period) {
    const map = {
      '24hours': 86400000,
      '7days': 604800000,
      '30days': 2592000000,
    };
    return map[period] || map['30days'];
  }
}

module.exports = { TokenTracker };
