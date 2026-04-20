/**
 * Migration 006: AI Risk Intelligence Agent
 * ai_conversations, ai_messages, ai_scheduled_analyses, ai_insights
 */
exports.up = function (knex) {
  return knex.schema
    .createTable('ai_conversations', (t) => {
      t.uuid('id').primary().defaultTo(knex.fn.uuid());
      t.uuid('user_id').references('id').inTable('users').onDelete('SET NULL');
      t.string('title', 500);
      t.string('context_type', 50).notNullable(); // RISK_ANALYSIS, BIA_REVIEW, SUMOOD_GAP, POLICY_CHECK, GENERAL, INCIDENT_ADVISOR
      t.string('context_entity_id', 100); // optional link to risk_id, process_id, etc.
      t.string('status', 20).defaultTo('ACTIVE'); // ACTIVE, ARCHIVED
      t.timestamps(true, true);
    })
    .createTable('ai_messages', (t) => {
      t.uuid('id').primary().defaultTo(knex.fn.uuid());
      t.uuid('conversation_id').notNullable().references('id').inTable('ai_conversations').onDelete('CASCADE');
      t.string('role', 20).notNullable(); // user, assistant, system
      t.text('content').notNullable();
      t.integer('tokens_used').defaultTo(0);
      t.string('model', 50).defaultTo('claude-sonnet-4-20250514');
      t.timestamp('created_at').defaultTo(knex.fn.now());
    })
    .createTable('ai_scheduled_analyses', (t) => {
      t.uuid('id').primary().defaultTo(knex.fn.uuid());
      t.string('analysis_type', 50).notNullable(); // DAILY_RISK_SCAN, WEEKLY_BIA_REVIEW, MONTHLY_SUMOOD_AUDIT, COMPLIANCE_DRIFT_CHECK
      t.string('schedule_cron', 50).notNullable();
      t.timestamp('last_run_at');
      t.timestamp('next_run_at');
      t.boolean('is_active').defaultTo(true);
      t.jsonb('config').defaultTo('{}');
      t.uuid('created_by').references('id').inTable('users').onDelete('SET NULL');
      t.timestamp('created_at').defaultTo(knex.fn.now());
    })
    .createTable('ai_insights', (t) => {
      t.uuid('id').primary().defaultTo(knex.fn.uuid());
      t.uuid('analysis_id').references('id').inTable('ai_scheduled_analyses').onDelete('SET NULL');
      t.string('insight_type', 50).notNullable(); // RISK_ANOMALY, COMPLIANCE_GAP, BIA_INCONSISTENCY, SUMOOD_REGRESSION, POLICY_DRIFT, RECOMMENDATION
      t.string('severity', 20).notNullable(); // CRITICAL, HIGH, MEDIUM, LOW, INFO
      t.string('title', 500).notNullable();
      t.text('description').notNullable();
      t.jsonb('affected_entities').defaultTo('[]');
      t.jsonb('recommended_actions').defaultTo('[]');
      t.string('status', 20).defaultTo('NEW'); // NEW, ACKNOWLEDGED, IN_PROGRESS, RESOLVED, DISMISSED
      t.uuid('resolved_by').references('id').inTable('users').onDelete('SET NULL');
      t.timestamp('resolved_at');
      t.timestamp('created_at').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('ai_insights')
    .dropTableIfExists('ai_scheduled_analyses')
    .dropTableIfExists('ai_messages')
    .dropTableIfExists('ai_conversations');
};
