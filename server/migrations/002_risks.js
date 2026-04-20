/**
 * Migration 002: Risks, Risk Treatments, Risk Audit Trail
 */
exports.up = function (knex) {
  return knex.schema
    .createTable('risks', (t) => {
      t.string('id').primary(); // RSK-XXXX format
      t.uuid('department_id').references('id').inTable('departments').onDelete('SET NULL');
      t.string('risk_name').notNullable();
      t.text('description');
      t.string('risk_type'); // Cybersecurity, Operational, Compliance, Financial, etc.
      t.integer('inherent_likelihood').notNullable().checkBetween([1, 5]);
      t.integer('inherent_impact').notNullable().checkBetween([1, 5]);
      t.integer('inherent_score').notNullable(); // likelihood * impact
      t.string('inherent_level'); // Catastrophic, High, Medium, Low, Very Low
      t.integer('residual_likelihood').checkBetween([1, 5]);
      t.integer('residual_impact').checkBetween([1, 5]);
      t.integer('residual_score');
      t.string('residual_level');
      t.integer('confidence_level').notNullable().defaultTo(3).checkBetween([1, 5]);
      t.uuid('risk_owner_id').references('id').inTable('users').onDelete('SET NULL');
      t.string('response_type'); // AVOID, TRANSFER, MITIGATE, ACCEPT
      t.string('lifecycle_status').defaultTo('IDENTIFIED'); // IDENTIFIED, IN_PROGRESS, MONITORED, CLOSED, etc.
      t.text('mitigation_plan');
      t.uuid('plan_owner_id').references('id').inTable('users').onDelete('SET NULL');
      t.string('implementation_timeframe');
      t.text('notes');
      t.uuid('created_by').references('id').inTable('users').onDelete('SET NULL');
      t.boolean('is_archived').defaultTo(false);
      t.timestamps(true, true);
    })
    .createTable('risk_treatments', (t) => {
      t.uuid('id').primary().defaultTo(knex.fn.uuid());
      t.string('risk_id').notNullable().references('id').inTable('risks').onDelete('CASCADE');
      t.enu('treatment_type', ['AVOID', 'TRANSFER', 'MITIGATE', 'ACCEPT']).notNullable();
      t.text('description').notNullable();
      t.uuid('plan_owner_id').references('id').inTable('users').onDelete('SET NULL');
      t.date('target_date');
      t.string('status').defaultTo('PLANNED'); // PLANNED, IN_PROGRESS, COMPLETED
      t.integer('completion_pct').defaultTo(0).checkBetween([0, 100]);
      t.timestamps(true, true);
    })
    .createTable('risk_audit_trail', (t) => {
      t.uuid('id').primary().defaultTo(knex.fn.uuid());
      t.string('risk_id').notNullable().references('id').inTable('risks').onDelete('CASCADE');
      t.string('action').notNullable(); // CREATED, UPDATED, STATUS_CHANGED, ARCHIVED
      t.string('field_changed');
      t.text('old_value');
      t.text('new_value');
      t.uuid('user_id').references('id').inTable('users').onDelete('SET NULL');
      t.timestamp('created_at').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('risk_audit_trail')
    .dropTableIfExists('risk_treatments')
    .dropTableIfExists('risks');
};
