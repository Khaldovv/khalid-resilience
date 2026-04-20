/**
 * Migration 008: Monte Carlo Risk Quantification + Regulatory Intelligence
 */
exports.up = function (knex) {
  return knex.schema
    // ── Monte Carlo Quantification ───────────────────────────────────────────
    .createTable('risk_quantification', (t) => {
      t.uuid('id').primary().defaultTo(knex.fn.uuid());
      t.string('risk_id', 20).notNullable().references('id').inTable('risks').onDelete('CASCADE');
      // Input parameters
      t.decimal('min_impact_sar', 15, 2).notNullable();
      t.decimal('most_likely_impact_sar', 15, 2).notNullable();
      t.decimal('max_impact_sar', 15, 2).notNullable();
      t.decimal('probability_pct', 5, 2).notNullable(); // 0-100
      // Simulation results
      t.integer('simulation_runs').defaultTo(10000);
      t.decimal('mean_loss_sar', 15, 2);
      t.decimal('median_loss_sar', 15, 2);
      t.decimal('percentile_90_sar', 15, 2);
      t.decimal('percentile_95_sar', 15, 2);
      t.decimal('percentile_99_sar', 15, 2);
      t.decimal('annualized_loss_expectancy_sar', 15, 2);
      t.decimal('var_95_sar', 15, 2);
      t.jsonb('simulation_data'); // histogram: [{bucket, count}]
      // Metadata
      t.uuid('calculated_by').references('id').inTable('users').onDelete('SET NULL');
      t.timestamp('calculated_at').defaultTo(knex.fn.now());
      t.text('notes');
      t.timestamp('created_at').defaultTo(knex.fn.now());
    })
    .createTable('risk_quantification_portfolio', (t) => {
      t.uuid('id').primary().defaultTo(knex.fn.uuid());
      t.string('title', 255).notNullable().defaultTo('Enterprise Risk Portfolio');
      t.integer('fiscal_year').notNullable();
      t.decimal('total_ale_sar', 15, 2);
      t.decimal('portfolio_var_95_sar', 15, 2);
      t.decimal('portfolio_var_99_sar', 15, 2);
      t.integer('risk_count');
      t.jsonb('simulation_data'); // portfolio histogram
      t.uuid('generated_by').references('id').inTable('users').onDelete('SET NULL');
      t.timestamp('generated_at').defaultTo(knex.fn.now());
    })

    // ── Regulatory Intelligence ──────────────────────────────────────────────
    .createTable('regulatory_bodies', (t) => {
      t.string('id', 20).primary(); // NCA, SAMA, DGA, etc.
      t.string('name_ar', 255).notNullable();
      t.string('name_en', 255).notNullable();
      t.string('website_url', 500);
      t.boolean('is_active').defaultTo(true);
    })
    .createTable('regulatory_updates', (t) => {
      t.uuid('id').primary().defaultTo(knex.fn.uuid());
      t.string('regulatory_body_id', 20).references('id').inTable('regulatory_bodies').onDelete('SET NULL');
      t.string('title', 500).notNullable();
      t.string('title_ar', 500);
      t.text('description');
      t.text('description_ar');
      t.string('update_type', 50).notNullable(); // NEW_REGULATION, AMENDMENT, CIRCULAR, GUIDANCE, ENFORCEMENT, DEADLINE
      t.string('severity', 20).notNullable(); // CRITICAL, HIGH, MEDIUM, LOW
      t.date('effective_date');
      t.date('compliance_deadline');
      t.string('source_url', 500);
      t.string('document_reference', 255);
      // Impact analysis
      t.jsonb('affected_frameworks').defaultTo('[]');
      t.jsonb('affected_modules').defaultTo('[]');
      t.text('impact_summary');
      t.text('impact_summary_ar');
      // Tracking
      t.string('status', 30).defaultTo('NEW'); // NEW, UNDER_REVIEW, ACTION_REQUIRED, COMPLIANT, ARCHIVED
      t.uuid('assigned_to').references('id').inTable('users').onDelete('SET NULL');
      t.uuid('reviewed_by').references('id').inTable('users').onDelete('SET NULL');
      t.timestamp('reviewed_at');
      t.uuid('created_by').references('id').inTable('users').onDelete('SET NULL');
      t.timestamps(true, true);
    })
    .createTable('regulatory_action_items', (t) => {
      t.uuid('id').primary().defaultTo(knex.fn.uuid());
      t.uuid('regulatory_update_id').notNullable().references('id').inTable('regulatory_updates').onDelete('CASCADE');
      t.text('description').notNullable();
      t.text('description_ar');
      t.uuid('owner_id').references('id').inTable('users').onDelete('SET NULL');
      t.date('deadline');
      t.string('status', 20).defaultTo('OPEN'); // OPEN, IN_PROGRESS, COMPLETED, OVERDUE
      t.date('completion_date');
      t.text('evidence_notes');
      t.timestamps(true, true);
    })
    // ── Seed regulatory bodies ───────────────────────────────────────────────
    .then(() => {
      return knex('regulatory_bodies').insert([
        { id: 'NCA',   name_ar: 'الهيئة الوطنية للأمن السيبراني',             name_en: 'National Cybersecurity Authority',       website_url: 'https://nca.gov.sa' },
        { id: 'SAMA',  name_ar: 'البنك المركزي السعودي',                       name_en: 'Saudi Central Bank',                     website_url: 'https://sama.gov.sa' },
        { id: 'DGA',   name_ar: 'هيئة الحكومة الرقمية',                        name_en: 'Digital Government Authority',            website_url: 'https://dga.gov.sa' },
        { id: 'NDMO',  name_ar: 'المركز الوطني لإدارة حالات الطوارئ',         name_en: 'National Center for Emergency Management', website_url: 'https://ndmo.gov.sa' },
        { id: 'SDAIA', name_ar: 'الهيئة السعودية للبيانات والذكاء الاصطناعي', name_en: 'Saudi Data & AI Authority',               website_url: 'https://sdaia.gov.sa' },
        { id: 'CMA',   name_ar: 'هيئة السوق المالية',                          name_en: 'Capital Market Authority',                website_url: 'https://cma.org.sa' },
      ]);
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('regulatory_action_items')
    .dropTableIfExists('regulatory_updates')
    .dropTableIfExists('regulatory_bodies')
    .dropTableIfExists('risk_quantification_portfolio')
    .dropTableIfExists('risk_quantification');
};
