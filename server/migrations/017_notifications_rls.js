exports.up = function(knex) {
  return knex.schema
    // ── Notifications Table ─────────────────────────────────────────────────
    .createTable('notifications', table => {
      table.bigIncrements('id').primary();
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.string('type', 50).notNullable(); // RISK_ESCALATED, INCIDENT_P1, DEADLINE, BCP_ACTIVATED, APPROVAL_REQUIRED
      table.string('title', 500).notNullable();
      table.text('message');
      table.string('link', 500);             // Deep link to relevant page
      table.jsonb('metadata').defaultTo('{}'); // Extra structured data
      table.boolean('is_read').defaultTo(false);
      table.boolean('email_sent').defaultTo(false);
      table.timestamp('read_at');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      
      table.index(['user_id', 'is_read']);
      table.index('created_at');
    })
    
    // ── Row-Level Security Policies (as comments for manual SQL) ────────────
    // Note: RLS must be applied via raw SQL after migration runs
    .then(() => knex.raw(`
      -- Enable RLS on sensitive tables
      DO $$
      BEGIN
        -- Only apply if the tables exist and RLS is not already enabled
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'risks') THEN
          ALTER TABLE risks ENABLE ROW LEVEL SECURITY;
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'incidents') THEN
          ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bia_assessments') THEN
          ALTER TABLE bia_assessments ENABLE ROW LEVEL SECURITY;
        END IF;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE NOTICE 'RLS setup skipped: %', SQLERRM;
      END
      $$;
    `))
    .then(() => knex.raw(`
      -- Department isolation policy for risks
      DO $$
      BEGIN
        CREATE POLICY risk_dept_isolation ON risks
          FOR ALL
          USING (
            department_id = current_setting('app.user_dept', true)::uuid
            OR current_setting('app.user_role', true) IN ('ADMIN', 'CRO', 'CEO', 'CISO')
          );
      EXCEPTION
        WHEN duplicate_object THEN
          RAISE NOTICE 'Policy risk_dept_isolation already exists';
        WHEN OTHERS THEN
          RAISE NOTICE 'RLS policy skipped: %', SQLERRM;
      END
      $$;
    `))
    .then(() => knex.raw(`
      -- Department isolation policy for incidents
      DO $$
      BEGIN
        CREATE POLICY incident_dept_isolation ON incidents
          FOR ALL
          USING (
            department_id = current_setting('app.user_dept', true)::uuid
            OR current_setting('app.user_role', true) IN ('ADMIN', 'CRO', 'CEO', 'CISO')
          );
      EXCEPTION
        WHEN duplicate_object THEN
          RAISE NOTICE 'Policy incident_dept_isolation already exists';
        WHEN OTHERS THEN
          RAISE NOTICE 'RLS policy skipped: %', SQLERRM;
      END
      $$;
    `));
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('notifications')
    .then(() => knex.raw(`
      DO $$
      BEGIN
        ALTER TABLE risks DISABLE ROW LEVEL SECURITY;
        ALTER TABLE incidents DISABLE ROW LEVEL SECURITY;
        ALTER TABLE bia_assessments DISABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS risk_dept_isolation ON risks;
        DROP POLICY IF EXISTS incident_dept_isolation ON incidents;
      EXCEPTION
        WHEN OTHERS THEN NULL;
      END
      $$;
    `));
};
