/**
 * ============================================================================
 *  Auto-Fix Migration: Performance Indexes
 * ============================================================================
 *  Adds missing PostgreSQL indexes identified by the Phase 4 benchmark audit.
 *  These indexes are CRITICAL for preventing full table scans on 20K+ row tables.
 *
 *  Run: cd server && npx knex migrate:latest
 * ============================================================================
 */
exports.up = function (knex) {
  return knex.schema

    // ── risks table — most queried table in the platform ───────────────────
    .alterTable('risks', (t) => {
      // Used by GET /risks?status=X (lifecycle filter)
      t.index('lifecycle_status', 'idx_risks_lifecycle_status');
      // Used by GET /risks?risk_type=X (type filter)
      t.index('risk_type', 'idx_risks_risk_type');
      // Used by GET /risks?department=X (department filter)
      t.index('department_id', 'idx_risks_department_id');
      // Used by archived row exclusion (WHERE is_archived = false)
      t.index('is_archived', 'idx_risks_is_archived');
      // Used by GET /risks?sort_by=created_at (default ordering)
      t.index('created_at', 'idx_risks_created_at');
      // Used by GET /risks/matrix (risk heatmap aggregation)
      t.index(['inherent_likelihood', 'inherent_impact'], 'idx_risks_inherent_matrix');
      // Used by GET /reports/risk-register (score ordering for exports)
      t.index('inherent_score', 'idx_risks_inherent_score');
      // Composite: most common filtered query pattern
      t.index(['is_archived', 'lifecycle_status', 'created_at'], 'idx_risks_archive_status_date');
    })

    // ── risk_audit_trail — grows 2x per risk (40K+ at scale) ──────────────
    .alterTable('risk_audit_trail', (t) => {
      t.index('risk_id', 'idx_audit_trail_risk_id');
      t.index('created_at', 'idx_audit_trail_created_at');
      t.index('user_id', 'idx_audit_trail_user_id');
    })

    // ── risk_treatments — FK lookups ──────────────────────────────────────
    .alterTable('risk_treatments', (t) => {
      t.index('risk_id', 'idx_treatments_risk_id');
      t.index('status', 'idx_treatments_status');
    })

    // ── bia_processes — most queried BIA table ────────────────────────────
    .alterTable('bia_processes', (t) => {
      t.index('assessment_id', 'idx_bia_proc_assessment_id');
      t.index('criticality_level', 'idx_bia_proc_criticality');
      t.index('rto_hours', 'idx_bia_proc_rto'); // for recovery priority sorting
    })

    // ── bia_assessments ──────────────────────────────────────────────────
    .alterTable('bia_assessments', (t) => {
      t.index('status', 'idx_bia_asm_status');
      t.index('fiscal_year', 'idx_bia_asm_fiscal_year');
      t.index(['status', 'fiscal_year'], 'idx_bia_asm_status_year');
    })

    // ── bia_dependencies ─────────────────────────────────────────────────
    .alterTable('bia_dependencies', (t) => {
      t.index('process_id', 'idx_bia_deps_process_id');
    })

    // ── bia_impact_ratings ───────────────────────────────────────────────
    .alterTable('bia_impact_ratings', (t) => {
      t.index('process_id', 'idx_bia_impact_process_id');
    })

    // ── sumood_assessments — unique constraint already acts as index,
    //    but add covering indexes for score computation queries ───────────
    .alterTable('sumood_assessments', (t) => {
      t.index('department_id', 'idx_sumood_asm_dept');
      t.index('fiscal_year', 'idx_sumood_asm_year');
      t.index(['department_id', 'fiscal_year'], 'idx_sumood_asm_dept_year');
    })

    // ── sumood_kpis ─────────────────────────────────────────────────────
    .alterTable('sumood_kpis', (t) => {
      t.index('component_id', 'idx_sumood_kpis_component');
      t.index('is_applicable', 'idx_sumood_kpis_applicable');
    })

    // ── sumood_components ───────────────────────────────────────────────
    .alterTable('sumood_components', (t) => {
      t.index('pillar_id', 'idx_sumood_comps_pillar');
    })

    // ── audit_log (from migration 005) ──────────────────────────────────
    .raw(`
      CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log (created_at);
      CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log (user_id);
      CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log (entity_type, entity_id);
    `);
};

exports.down = function (knex) {
  return knex.schema
    .alterTable('risks', (t) => {
      t.dropIndex(null, 'idx_risks_lifecycle_status');
      t.dropIndex(null, 'idx_risks_risk_type');
      t.dropIndex(null, 'idx_risks_department_id');
      t.dropIndex(null, 'idx_risks_is_archived');
      t.dropIndex(null, 'idx_risks_created_at');
      t.dropIndex(null, 'idx_risks_inherent_matrix');
      t.dropIndex(null, 'idx_risks_inherent_score');
      t.dropIndex(null, 'idx_risks_archive_status_date');
    })
    .alterTable('risk_audit_trail', (t) => {
      t.dropIndex(null, 'idx_audit_trail_risk_id');
      t.dropIndex(null, 'idx_audit_trail_created_at');
      t.dropIndex(null, 'idx_audit_trail_user_id');
    })
    .alterTable('risk_treatments', (t) => {
      t.dropIndex(null, 'idx_treatments_risk_id');
      t.dropIndex(null, 'idx_treatments_status');
    })
    .alterTable('bia_processes', (t) => {
      t.dropIndex(null, 'idx_bia_proc_assessment_id');
      t.dropIndex(null, 'idx_bia_proc_criticality');
      t.dropIndex(null, 'idx_bia_proc_rto');
    })
    .alterTable('bia_assessments', (t) => {
      t.dropIndex(null, 'idx_bia_asm_status');
      t.dropIndex(null, 'idx_bia_asm_fiscal_year');
      t.dropIndex(null, 'idx_bia_asm_status_year');
    })
    .alterTable('bia_dependencies', (t) => { t.dropIndex(null, 'idx_bia_deps_process_id'); })
    .alterTable('bia_impact_ratings', (t) => { t.dropIndex(null, 'idx_bia_impact_process_id'); })
    .alterTable('sumood_assessments', (t) => {
      t.dropIndex(null, 'idx_sumood_asm_dept');
      t.dropIndex(null, 'idx_sumood_asm_year');
      t.dropIndex(null, 'idx_sumood_asm_dept_year');
    })
    .alterTable('sumood_kpis', (t) => {
      t.dropIndex(null, 'idx_sumood_kpis_component');
      t.dropIndex(null, 'idx_sumood_kpis_applicable');
    })
    .alterTable('sumood_components', (t) => { t.dropIndex(null, 'idx_sumood_comps_pillar'); })
    .raw(`
      DROP INDEX IF EXISTS idx_audit_log_created_at;
      DROP INDEX IF EXISTS idx_audit_log_user_id;
      DROP INDEX IF EXISTS idx_audit_log_entity;
    `);
};
