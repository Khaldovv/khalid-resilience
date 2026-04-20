/**
 * Migration 012: Sumood Document Compliance Analysis Tables
 */
exports.up = function (knex) {
  return knex.schema
    .createTable('sumood_documents', (t) => {
      t.uuid('id').primary().defaultTo(knex.fn.uuid());
      t.uuid('department_id').references('id').inTable('departments');
      t.integer('fiscal_year').notNullable();
      t.string('file_name', 500).notNullable();
      t.string('file_type', 50);
      t.integer('file_size_bytes');
      t.string('storage_path', 1000);
      t.string('file_hash', 64);
      t.string('document_type', 50);
      t.string('document_type_ar', 100);
      t.text('document_summary_ar');
      t.text('document_summary_en');
      t.string('status', 30).defaultTo('UPLOADED');
      t.text('error_message');
      t.integer('total_pages');
      t.integer('tokens_processed');
      t.string('ai_model', 50);
      t.timestamp('analyzed_at');
      t.uuid('uploaded_by').references('id').inTable('users');
      t.timestamp('created_at').defaultTo(knex.fn.now());
      t.timestamp('updated_at').defaultTo(knex.fn.now());
      t.index(['department_id', 'fiscal_year']);
      t.index('file_hash');
    })
    .createTable('sumood_document_kpi_mappings', (t) => {
      t.uuid('id').primary().defaultTo(knex.fn.uuid());
      t.uuid('document_id').references('id').inTable('sumood_documents').onDelete('CASCADE');
      t.string('kpi_id').references('id').inTable('sumood_kpis');
      t.string('compliance_level', 20).notNullable();
      t.integer('suggested_maturity_level');
      t.decimal('confidence_score', 3, 2);
      t.text('evidence_quote');
      t.integer('evidence_page_number');
      t.text('evidence_section');
      t.text('reasoning_ar');
      t.text('reasoning_en');
      t.text('identified_gaps_ar');
      t.text('identified_gaps_en');
      t.jsonb('improvement_suggestions');
      t.string('review_status', 20).defaultTo('AI_GENERATED');
      t.uuid('reviewed_by').references('id').inTable('users');
      t.timestamp('reviewed_at');
      t.text('reviewer_notes');
      t.timestamp('created_at').defaultTo(knex.fn.now());
      t.index(['document_id', 'kpi_id']);
      t.index('compliance_level');
    })
    .createTable('sumood_analysis_summaries', (t) => {
      t.uuid('id').primary().defaultTo(knex.fn.uuid());
      t.uuid('document_id').references('id').inTable('sumood_documents').onDelete('CASCADE');
      t.integer('total_kpis_assessed');
      t.integer('kpis_fully_met');
      t.integer('kpis_partially_met');
      t.integer('kpis_mentioned');
      t.integer('kpis_not_addressed');
      t.decimal('avg_maturity_level', 3, 2);
      t.jsonb('pillar_coverage');
      t.jsonb('top_gaps');
      t.jsonb('top_recommendations');
      t.text('executive_summary_ar');
      t.text('executive_summary_en');
      t.timestamp('created_at').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('sumood_analysis_summaries')
    .dropTableIfExists('sumood_document_kpi_mappings')
    .dropTableIfExists('sumood_documents');
};
