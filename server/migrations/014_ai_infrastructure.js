/**
 * Migration 014: AI Infrastructure (cache + usage tracking)
 * Adds ai_cache and ai_usage_logs tables for the unified AI service layer.
 */
exports.up = function (knex) {
  return knex.schema
    .createTable('ai_cache', (table) => {
      table.string('cache_key', 64).primary();
      table.text('value').notNullable();
      table.timestamp('expires_at').notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.index('expires_at');
    })
    .createTable('ai_usage_logs', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('feature', 50).notNullable();
      table.uuid('user_id').references('id').inTable('users').onDelete('SET NULL');
      table.string('model', 100);
      table.integer('input_tokens').defaultTo(0);
      table.integer('output_tokens').defaultTo(0);
      table.integer('total_tokens').defaultTo(0);
      table.integer('latency_ms');
      table.decimal('estimated_cost_usd', 10, 6).defaultTo(0);
      table.boolean('is_cache_hit').defaultTo(false);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.index(['feature', 'created_at']);
      table.index(['user_id', 'created_at']);
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('ai_usage_logs')
    .dropTableIfExists('ai_cache');
};
