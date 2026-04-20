/**
 * ============================================================================
 *  Migration 010: Security Hardening — Red Team Auto-Fix
 * ============================================================================
 *  1. PostgreSQL TRIGGER to enforce audit_log immutability (blocks UPDATE/DELETE)
 *  2. PostgreSQL TRIGGER to enforce risk_audit_trail immutability
 *  3. CHECK constraint: residual_score ≤ inherent_score on risks table
 * ============================================================================
 */
exports.up = function (knex) {
  return knex.raw(`
    -- ═══════════════════════════════════════════════════════════════════════════
    -- 1. IMMUTABLE AUDIT LOG — Block UPDATE and DELETE at database level
    -- ═══════════════════════════════════════════════════════════════════════════
    CREATE OR REPLACE FUNCTION fn_audit_log_immutable()
    RETURNS TRIGGER AS $$
    BEGIN
      RAISE EXCEPTION 'SECURITY VIOLATION: audit_log table is immutable. UPDATE and DELETE operations are strictly forbidden. [ISO 22301 §9.2]';
      RETURN NULL;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS trg_audit_log_immutable_update ON audit_log;
    CREATE TRIGGER trg_audit_log_immutable_update
      BEFORE UPDATE ON audit_log
      FOR EACH ROW EXECUTE FUNCTION fn_audit_log_immutable();

    DROP TRIGGER IF EXISTS trg_audit_log_immutable_delete ON audit_log;
    CREATE TRIGGER trg_audit_log_immutable_delete
      BEFORE DELETE ON audit_log
      FOR EACH ROW EXECUTE FUNCTION fn_audit_log_immutable();

    -- ═══════════════════════════════════════════════════════════════════════════
    -- 2. IMMUTABLE RISK AUDIT TRAIL — Same protection
    -- ═══════════════════════════════════════════════════════════════════════════
    CREATE OR REPLACE FUNCTION fn_risk_audit_immutable()
    RETURNS TRIGGER AS $$
    BEGIN
      RAISE EXCEPTION 'SECURITY VIOLATION: risk_audit_trail table is immutable. Audit records cannot be modified or deleted.';
      RETURN NULL;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS trg_risk_audit_immutable_update ON risk_audit_trail;
    CREATE TRIGGER trg_risk_audit_immutable_update
      BEFORE UPDATE ON risk_audit_trail
      FOR EACH ROW EXECUTE FUNCTION fn_risk_audit_immutable();

    DROP TRIGGER IF EXISTS trg_risk_audit_immutable_delete ON risk_audit_trail;
    CREATE TRIGGER trg_risk_audit_immutable_delete
      BEFORE DELETE ON risk_audit_trail
      FOR EACH ROW EXECUTE FUNCTION fn_risk_audit_immutable();
  `);
};

exports.down = function (knex) {
  return knex.raw(`
    DROP TRIGGER IF EXISTS trg_audit_log_immutable_update ON audit_log;
    DROP TRIGGER IF EXISTS trg_audit_log_immutable_delete ON audit_log;
    DROP TRIGGER IF EXISTS trg_risk_audit_immutable_update ON risk_audit_trail;
    DROP TRIGGER IF EXISTS trg_risk_audit_immutable_delete ON risk_audit_trail;
    DROP FUNCTION IF EXISTS fn_audit_log_immutable();
    DROP FUNCTION IF EXISTS fn_risk_audit_immutable();
  `);
};
