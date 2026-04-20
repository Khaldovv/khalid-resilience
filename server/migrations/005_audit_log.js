/**
 * Migration 005: Immutable Audit Log
 * INSERT-only table — no UPDATE or DELETE operations should ever target this table.
 */
exports.up = function (knex) {
  return knex.schema.createTable('audit_log', (t) => {
    t.bigIncrements('id').primary();
    t.uuid('user_id').references('id').inTable('users').onDelete('SET NULL');
    t.string('action').notNullable(); // e.g. "POST /api/v1/risks"
    t.string('entity_type'); // e.g. "risks", "bia", "sumood"
    t.string('entity_id'); // e.g. "RSK-1042"
    t.jsonb('details'); // Full request/response metadata
    t.string('ip_address');
    t.text('user_agent');
    t.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    // Index for fast queries
    t.index(['entity_type', 'entity_id']);
    t.index(['user_id', 'created_at']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('audit_log');
};
