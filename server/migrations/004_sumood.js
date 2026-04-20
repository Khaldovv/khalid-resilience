/**
 * Migration 004: Sumood (National Resilience Index) Tables
 * sumood_pillars, sumood_components, sumood_kpis, sumood_assessments
 */
exports.up = function (knex) {
  return knex.schema
    .createTable('sumood_pillars', (t) => {
      t.string('id').primary(); // P1, P2, ...
      t.string('name_ar').notNullable();
      t.string('name_en').notNullable();
      t.integer('sort_order').notNullable();
    })
    .createTable('sumood_components', (t) => {
      t.string('id').primary(); // P1-C1, P1-C2, ...
      t.string('pillar_id').notNullable().references('id').inTable('sumood_pillars').onDelete('CASCADE');
      t.string('code').notNullable(); // RM-01, EC-01, ...
      t.string('name_ar').notNullable();
      t.string('name_en').notNullable();
    })
    .createTable('sumood_kpis', (t) => {
      t.string('id').primary(); // KPI-001, KPI-002, ...
      t.string('component_id').notNullable().references('id').inTable('sumood_components').onDelete('CASCADE');
      t.string('kpi_code').notNullable(); // RM-01-001
      t.text('kpi_text_ar').notNullable();
      t.text('kpi_text_en');
      t.decimal('weight', 5, 2).defaultTo(1.0);
      t.boolean('is_applicable').defaultTo(true);
    })
    .createTable('sumood_assessments', (t) => {
      t.uuid('id').primary().defaultTo(knex.fn.uuid());
      t.string('kpi_id').notNullable().references('id').inTable('sumood_kpis').onDelete('CASCADE');
      t.uuid('department_id').references('id').inTable('departments').onDelete('SET NULL');
      t.integer('fiscal_year').notNullable();
      t.integer('maturity_level').notNullable().checkBetween([1, 7]);
      t.text('evidence_notes');
      t.jsonb('attachments').defaultTo('[]');
      t.uuid('assessed_by').references('id').inTable('users').onDelete('SET NULL');
      t.timestamps(true, true);
      t.unique(['kpi_id', 'department_id', 'fiscal_year']);
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('sumood_assessments')
    .dropTableIfExists('sumood_kpis')
    .dropTableIfExists('sumood_components')
    .dropTableIfExists('sumood_pillars');
};
