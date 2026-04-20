/**
 * In-memory Rate Limiter — per-user, per-feature sliding window.
 */
class RateLimiter {
  constructor() {
    this.buckets = new Map();
    this.limits = {
      ai_agent:            { requests: 30, windowMs: 60000 },
      risk_simulation:     { requests: 10, windowMs: 60000 },
      risk_generator:      { requests: 15, windowMs: 60000 },
      sumood_compliance:   { requests: 5,  windowMs: 60000 },
      predictive_insights: { requests: 20, windowMs: 60000 },
      default:             { requests: 20, windowMs: 60000 },
    };
  }

  async check(userId, feature) {
    if (!userId) return true;

    const limit = this.limits[feature] || this.limits.default;
    const key = `${userId}:${feature}`;
    const now = Date.now();

    let bucket = this.buckets.get(key) || { count: 0, resetAt: now + limit.windowMs };

    if (now > bucket.resetAt) {
      bucket = { count: 0, resetAt: now + limit.windowMs };
    }

    if (bucket.count >= limit.requests) {
      const waitSeconds = Math.ceil((bucket.resetAt - now) / 1000);
      throw new Error(
        `تجاوزت حد الاستخدام لـ ${feature}. الرجاء الانتظار ${waitSeconds} ثانية.`
      );
    }

    bucket.count++;
    this.buckets.set(key, bucket);
    return true;
  }
}

module.exports = { RateLimiter };
