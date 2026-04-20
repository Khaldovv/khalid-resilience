exports.up = function(knex) {
  return knex.schema
    .createTable('bcp_plans', table => {
      table.string('id', 20).primary(); // BCP-2026-001
      table.string('title_ar', 500).notNullable();
      table.string('title_en', 500);
      
      // What scenario is this BCP for?
      table.string('disruption_scenario', 500).notNullable();
      
      table.text('scenario_description_ar');
      table.text('scenario_description_en');
      
      // Scope
      table.uuid('department_id').references('id').inTable('departments');
      table.string('scope_type', 30); // DEPARTMENT, ORGANIZATION, SITE, SYSTEM
      table.string('scope_site', 255);
      
      // Linked BIA
      table.string('bia_assessment_id', 20).references('id').inTable('bia_assessments');
      
      // Classification
      table.string('classification', 30).defaultTo('CONFIDENTIAL');
      
      // Status
      table.string('status', 30).defaultTo('DRAFT');
      
      // Versioning
      table.string('version', 20).defaultTo('1.0');
      table.timestamp('approved_at');
      table.uuid('approved_by').references('id').inTable('users');
      table.date('next_review_date');
      table.date('expiry_date');
      
      // Activation criteria
      table.jsonb('activation_criteria').defaultTo('[]');
      
      // Teams
      table.jsonb('crisis_management_team').defaultTo('[]');
      table.jsonb('recovery_teams').defaultTo('[]');
      
      // Communication
      table.jsonb('communication_plan').defaultTo('{}');
      
      // Recovery procedures (ordered steps)
      table.jsonb('recovery_procedures').defaultTo('[]');
      
      // Resource requirements
      table.jsonb('required_resources').defaultTo('[]');
      
      // Linked processes (from BIA)
      table.jsonb('critical_processes').defaultTo('[]');
      
      // Linked assets (from BIA Asset Registry)
      table.jsonb('critical_assets').defaultTo('[]');
      
      // Testing
      table.jsonb('testing_schedule').defaultTo('[]');
      
      // Generated document
      table.text('generated_docx_path');
      table.timestamp('last_generated_at');
      
      // Metadata
      table.uuid('created_by').references('id').inTable('users');
      table.uuid('last_updated_by').references('id').inTable('users');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      
      table.index('department_id');
      table.index('status');
      table.index('bia_assessment_id');
    })
    
    // Track activations (when BCP was actually triggered)
    .createTable('bcp_activations', table => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('bcp_id', 20).references('id').inTable('bcp_plans').onDelete('CASCADE');
      table.string('incident_id', 20).references('id').inTable('incidents');
      table.timestamp('activated_at').defaultTo(knex.fn.now());
      table.timestamp('deactivated_at');
      table.uuid('activated_by').references('id').inTable('users');
      table.text('activation_reason');
      table.string('status', 30).defaultTo('ACTIVE');
      table.jsonb('lessons_learned');
      table.timestamp('created_at').defaultTo(knex.fn.now());
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('bcp_activations')
    .dropTableIfExists('bcp_plans');
};
