/**
 * Migration 003: BIA Module Tables
 * bia_assessments, bia_processes, bia_impact_ratings,
 * bia_dependencies, bia_recovery_strategies, bia_risk_links, bia_workflow_steps
 */
exports.up = function (knex) {
  return knex.schema
    .createTable('bia_assessments', (t) => {
      t.string('id').primary(); // BIA-ASM-XXX
      t.uuid('department_id').references('id').inTable('departments').onDelete('SET NULL');
      t.string('title').notNullable();
      t.string('title_en');
      t.enu('status', ['DRAFT', 'IN_REVIEW', 'APPROVED', 'ARCHIVED']).defaultTo('DRAFT');
      t.integer('fiscal_year').notNullable();
      t.uuid('created_by').references('id').inTable('users').onDelete('SET NULL');
      t.uuid('approved_by').references('id').inTable('users').onDelete('SET NULL');
      t.timestamp('approved_at');
      t.timestamps(true, true);
    })
    .createTable('bia_processes', (t) => {
      t.string('id').primary(); // BIA-PRC-XXX
      t.string('assessment_id').notNullable().references('id').inTable('bia_assessments').onDelete('CASCADE');
      t.string('process_name').notNullable();
      t.string('process_name_en');
      t.text('description');
      t.uuid('process_owner_id').references('id').inTable('users').onDelete('SET NULL');
      t.string('process_owner_name'); // Fallback display name
      t.enu('criticality_level', ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).defaultTo('MEDIUM');
      t.decimal('mtpd_hours', 10, 2).notNullable();
      t.decimal('rto_hours', 10, 2).notNullable();
      t.decimal('rpo_hours', 10, 2).notNullable();
      t.integer('mbco_percent').defaultTo(50).checkBetween([0, 100]);
      t.timestamps(true, true);
    })
    .createTable('bia_impact_ratings', (t) => {
      t.uuid('id').primary().defaultTo(knex.fn.uuid());
      t.string('process_id').notNullable().references('id').inTable('bia_processes').onDelete('CASCADE');
      t.enu('impact_category', ['OPERATIONAL', 'FINANCIAL', 'LEGAL_REGULATORY_STRATEGIC', 'REPUTATIONAL']).notNullable();
      t.integer('time_interval_hours').notNullable(); // 1, 4, 8, 24, 48, 72, 168
      t.integer('severity_score').notNullable().checkBetween([1, 5]);
      t.text('justification');
      t.timestamps(true, true);
      t.unique(['process_id', 'impact_category', 'time_interval_hours']);
    })
    .createTable('bia_dependencies', (t) => {
      t.uuid('id').primary().defaultTo(knex.fn.uuid());
      t.string('process_id').notNullable().references('id').inTable('bia_processes').onDelete('CASCADE');
      t.enu('dependency_type', ['IT_SYSTEM', 'APPLICATION', 'HUMAN_RESOURCE', 'SUPPLIER', 'FACILITY', 'DATA']).notNullable();
      t.string('resource_name').notNullable();
      t.string('resource_name_en');
      t.string('criticality').defaultTo('IMPORTANT'); // CRITICAL, IMPORTANT, STANDARD
      t.boolean('has_alternative').defaultTo(false);
      t.text('alternative_description');
      t.integer('min_staff_required').defaultTo(0);
      t.string('vendor_contract_ref');
      t.timestamps(true, true);
    })
    .createTable('bia_recovery_strategies', (t) => {
      t.uuid('id').primary().defaultTo(knex.fn.uuid());
      t.string('process_id').notNullable().references('id').inTable('bia_processes').onDelete('CASCADE');
      t.enu('strategy_phase', ['PRE_DISRUPTION', 'DURING_DISRUPTION', 'POST_DISRUPTION']).notNullable();
      t.text('strategy_description').notNullable();
      t.text('strategy_description_en');
      t.decimal('estimated_cost_sar', 12, 2).defaultTo(0);
      t.uuid('responsible_user_id').references('id').inTable('users').onDelete('SET NULL');
      t.string('responsible_user_name'); // Fallback display name
      t.timestamps(true, true);
    })
    .createTable('bia_risk_links', (t) => {
      t.uuid('id').primary().defaultTo(knex.fn.uuid());
      t.string('process_id').notNullable().references('id').inTable('bia_processes').onDelete('CASCADE');
      t.string('risk_id').notNullable().references('id').inTable('risks').onDelete('CASCADE');
      t.string('link_type').defaultTo('AFFECTED_BY'); // AFFECTED_BY, CAUSES
      t.text('notes');
      t.timestamps(true, true);
    })
    .createTable('bia_workflow_steps', (t) => {
      t.uuid('id').primary().defaultTo(knex.fn.uuid());
      t.string('assessment_id').notNullable().references('id').inTable('bia_assessments').onDelete('CASCADE');
      t.integer('step_order').notNullable();
      t.enu('approver_role', ['DEPT_HEAD', 'BC_COORDINATOR', 'CISO', 'CEO']).notNullable();
      t.uuid('approver_id').references('id').inTable('users').onDelete('SET NULL');
      t.string('approver_name');
      t.enu('decision', ['PENDING', 'APPROVED', 'REJECTED', 'ESCALATED']).defaultTo('PENDING');
      t.text('comments');
      t.timestamp('decided_at');
      t.timestamp('deadline');
      t.integer('sla_hours').defaultTo(120); // 5 days
      t.timestamps(true, true);
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('bia_workflow_steps')
    .dropTableIfExists('bia_risk_links')
    .dropTableIfExists('bia_recovery_strategies')
    .dropTableIfExists('bia_dependencies')
    .dropTableIfExists('bia_impact_ratings')
    .dropTableIfExists('bia_processes')
    .dropTableIfExists('bia_assessments');
};
