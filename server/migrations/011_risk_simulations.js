/**
 * Migration 011: Risk Simulations (AI-powered scenario analysis)
 */
exports.up = function (knex) {
  return knex.schema.createTable('risk_simulations', (t) => {
    t.uuid('id').primary().defaultTo(knex.fn.uuid());
    t.string('risk_id').notNullable().references('id').inTable('risks').onDelete('CASCADE');
    t.jsonb('risk_snapshot').notNullable();
    t.jsonb('scenario_best').notNullable();
    t.jsonb('scenario_likely').notNullable();
    t.jsonb('scenario_worst').notNullable();
    t.jsonb('mitigation_strategies').notNullable();
    t.decimal('confidence_score', 3, 2);
    t.uuid('simulated_by').references('id').inTable('users').onDelete('SET NULL');
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.index('risk_id');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('risk_simulations');
};
