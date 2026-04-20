/**
 * Migration 007: TPRM (vendors, assessments, links) + Incident Management
 */
exports.up = function (knex) {
  return knex.schema
    // ── TPRM Tables ──────────────────────────────────────────────────────────
    .createTable('vendors', (t) => {
      t.uuid('id').primary().defaultTo(knex.fn.uuid());
      t.string('vendor_name', 500).notNullable();
      t.string('vendor_name_ar', 500);
      t.string('registration_number', 100);
      t.string('category', 50).notNullable(); // IT_SERVICES, CLOUD_PROVIDER, CONSULTING, HARDWARE, TELECOM, FACILITIES, FINANCIAL, OTHER
      t.string('country', 100).defaultTo('Saudi Arabia');
      t.string('contact_name', 255);
      t.string('contact_email', 255);
      t.string('contact_phone', 50);
      t.string('website', 500);
      t.date('contract_start');
      t.date('contract_end');
      t.decimal('contract_value_sar', 15, 2);
      t.string('data_access_level', 30).defaultTo('NONE'); // NONE, LIMITED, MODERATE, EXTENSIVE, FULL
      t.boolean('hosts_data_offshore').defaultTo(false);
      t.boolean('is_critical').defaultTo(false);
      t.string('status', 20).defaultTo('ACTIVE'); // ACTIVE, UNDER_REVIEW, SUSPENDED, TERMINATED
      t.uuid('department_id').references('id').inTable('departments').onDelete('SET NULL');
      t.uuid('created_by').references('id').inTable('users').onDelete('SET NULL');
      t.timestamps(true, true);
    })
    .createTable('vendor_assessments', (t) => {
      t.uuid('id').primary().defaultTo(knex.fn.uuid());
      t.uuid('vendor_id').notNullable().references('id').inTable('vendors').onDelete('CASCADE');
      t.date('assessment_date').notNullable().defaultTo(knex.fn.now());
      t.uuid('assessor_id').references('id').inTable('users').onDelete('SET NULL');
      // Risk scoring dimensions (1-5)
      t.integer('financial_stability_score').checkBetween([1, 5]);
      t.integer('cybersecurity_score').checkBetween([1, 5]);
      t.integer('compliance_score').checkBetween([1, 5]);
      t.integer('operational_reliability_score').checkBetween([1, 5]);
      t.integer('data_privacy_score').checkBetween([1, 5]);
      t.integer('business_continuity_score').checkBetween([1, 5]);
      // Computed
      t.decimal('overall_score', 3, 1);
      t.string('risk_tier', 20); // CRITICAL, HIGH, MEDIUM, LOW
      // Evidence
      t.text('notes');
      t.jsonb('attachments').defaultTo('[]');
      t.date('next_review_date');
      t.timestamp('created_at').defaultTo(knex.fn.now());
    })
    .createTable('vendor_bia_links', (t) => {
      t.uuid('id').primary().defaultTo(knex.fn.uuid());
      t.uuid('vendor_id').notNullable().references('id').inTable('vendors').onDelete('CASCADE');
      t.uuid('dependency_id').notNullable().references('id').inTable('bia_dependencies').onDelete('CASCADE');
      t.text('notes');
      t.timestamp('created_at').defaultTo(knex.fn.now());
      t.unique(['vendor_id', 'dependency_id']);
    })
    .createTable('vendor_risk_links', (t) => {
      t.uuid('id').primary().defaultTo(knex.fn.uuid());
      t.uuid('vendor_id').notNullable().references('id').inTable('vendors').onDelete('CASCADE');
      t.string('risk_id', 20).notNullable().references('id').inTable('risks').onDelete('CASCADE');
      t.string('link_type', 30).defaultTo('ASSOCIATED'); // ASSOCIATED, CAUSED_BY, MITIGATED_BY
      t.timestamp('created_at').defaultTo(knex.fn.now());
      t.unique(['vendor_id', 'risk_id']);
    })

    // ── Incident Management Tables ───────────────────────────────────────────
    .createTable('incidents', (t) => {
      t.string('id', 20).primary(); // INC-YYYY-XXXX format
      t.string('title', 500).notNullable();
      t.text('description');
      t.string('incident_type', 50).notNullable(); // CYBER_ATTACK, SYSTEM_OUTAGE, DATA_BREACH, NATURAL_DISASTER, SUPPLY_CHAIN, OPERATIONAL_FAILURE, COMPLIANCE_VIOLATION, OTHER
      t.string('severity', 20).notNullable(); // P1_CRITICAL, P2_HIGH, P3_MEDIUM, P4_LOW
      t.string('status', 30).defaultTo('OPEN'); // OPEN, INVESTIGATING, CONTAINED, RESOLVED, CLOSED, POST_REVIEW
      t.timestamp('detected_at').notNullable().defaultTo(knex.fn.now());
      t.timestamp('responded_at');
      t.timestamp('contained_at');
      t.timestamp('resolved_at');
      t.timestamp('closed_at');
      // Impact assessment
      t.jsonb('affected_departments').defaultTo('[]');
      t.jsonb('affected_systems').defaultTo('[]');
      t.decimal('estimated_financial_impact_sar', 15, 2);
      t.integer('data_records_affected').defaultTo(0);
      t.decimal('service_downtime_hours', 10, 2).defaultTo(0);
      // Assignment
      t.uuid('incident_commander_id').references('id').inTable('users').onDelete('SET NULL');
      t.uuid('department_id').references('id').inTable('departments').onDelete('SET NULL');
      // Classification
      t.text('root_cause');
      t.text('lessons_learned');
      // Regulatory
      t.boolean('requires_regulatory_notification').defaultTo(false);
      t.string('regulatory_body', 100); // SAMA, NCA, NDMO, DGA, SDAIA
      t.timestamp('notification_deadline');
      t.timestamp('notification_sent_at');
      // Links
      t.boolean('triggered_bcp').defaultTo(false);
      t.string('bcp_plan_id', 100);
      t.uuid('created_by').references('id').inTable('users').onDelete('SET NULL');
      t.timestamps(true, true);
    })
    .createTable('incident_timeline', (t) => {
      t.uuid('id').primary().defaultTo(knex.fn.uuid());
      t.string('incident_id', 20).notNullable().references('id').inTable('incidents').onDelete('CASCADE');
      t.timestamp('event_time').notNullable().defaultTo(knex.fn.now());
      t.string('event_type', 50).notNullable(); // DETECTION, ESCALATION, ACTION_TAKEN, STATUS_CHANGE, COMMUNICATION, RESOLUTION, NOTE
      t.text('description').notNullable();
      t.uuid('user_id').references('id').inTable('users').onDelete('SET NULL');
      t.jsonb('attachments').defaultTo('[]');
      t.timestamp('created_at').defaultTo(knex.fn.now());
    })
    .createTable('incident_risk_links', (t) => {
      t.uuid('id').primary().defaultTo(knex.fn.uuid());
      t.string('incident_id', 20).notNullable().references('id').inTable('incidents').onDelete('CASCADE');
      t.string('risk_id', 20).notNullable().references('id').inTable('risks').onDelete('CASCADE');
      t.string('link_type', 30).defaultTo('MATERIALIZED'); // MATERIALIZED, RELATED, DISCOVERED
      t.timestamp('created_at').defaultTo(knex.fn.now());
      t.unique(['incident_id', 'risk_id']);
    })
    .createTable('post_incident_reviews', (t) => {
      t.uuid('id').primary().defaultTo(knex.fn.uuid());
      t.string('incident_id', 20).notNullable().references('id').inTable('incidents').onDelete('CASCADE').unique();
      t.date('review_date');
      t.uuid('reviewer_id').references('id').inTable('users').onDelete('SET NULL');
      t.text('what_happened');
      t.text('what_went_well');
      t.text('what_went_wrong');
      t.jsonb('action_items').defaultTo('[]'); // [{description, owner_id, deadline, status}]
      t.text('prevention_measures');
      t.boolean('bcp_update_required').defaultTo(false);
      t.boolean('risk_register_update_required').defaultTo(false);
      t.string('status', 20).defaultTo('DRAFT'); // DRAFT, FINAL
      t.timestamps(true, true);
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('post_incident_reviews')
    .dropTableIfExists('incident_risk_links')
    .dropTableIfExists('incident_timeline')
    .dropTableIfExists('incidents')
    .dropTableIfExists('vendor_risk_links')
    .dropTableIfExists('vendor_bia_links')
    .dropTableIfExists('vendor_assessments')
    .dropTableIfExists('vendors');
};
