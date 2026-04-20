/**
 * Two-tier AI Response Cache — in-memory Map + PostgreSQL `ai_cache` table.
 */
const crypto = require('crypto');
const db = require('../../config/database');

class CacheManager {
  constructor() {
    this.memoryCache = new Map();
    this.maxMemorySize = 500;
  }

  generateKey(model, messages, temperature) {
    const hash = crypto.createHash('sha256');
    hash.update(JSON.stringify({ model, messages, temperature }));
    return hash.digest('hex');
  }

  async get(key) {
    // L1 — memory
    const memHit = this.memoryCache.get(key);
    if (memHit && memHit.expiresAt > Date.now()) return memHit.value;

    // L2 — database
    try {
      const dbHit = await db('ai_cache')
        .where('cache_key', key)
        .where('expires_at', '>', new Date())
        .first();

      if (dbHit) {
        const value = JSON.parse(dbHit.value);
        this.memoryCache.set(key, { value, expiresAt: new Date(dbHit.expires_at).getTime() });
        return value;
      }
    } catch {
      // Table may not exist yet — silently ignore
    }

    return null;
  }

  async set(key, value, ttlSeconds = 3600) {
    const expiresAt = Date.now() + ttlSeconds * 1000;

    // Evict oldest entry if memory full
    if (this.memoryCache.size >= this.maxMemorySize) {
      const firstKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(firstKey);
    }
    this.memoryCache.set(key, { value, expiresAt });

    // Persist to DB
    try {
      await db('ai_cache')
        .insert({
          cache_key: key,
          value: JSON.stringify(value),
          expires_at: new Date(expiresAt),
        })
        .onConflict('cache_key')
        .merge();
    } catch {
      // Table may not exist yet — memory-only cache
    }
  }

  async clear() {
    this.memoryCache.clear();
    try {
      await db('ai_cache').delete();
    } catch {
      // Table may not exist
    }
  }
}

module.exports = { CacheManager };
