/**
 * Migration 013: BIA Asset Registry
 * Creates tables for asset management, process linking, and asset dependencies
 * per ISO 22301 Clause 8.2.2
 */
exports.up = async function(knex) {
  // 1 ── bia_assets ────────────────────────────────────────────────────────────
  await knex.schema.createTable('bia_assets', t => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('asset_code', 20).notNullable().unique();
    t.string('name', 200).notNullable();
    t.string('name_ar', 200);
    t.enum('asset_type', [
      'IT_SYSTEM', 'APPLICATION', 'FACILITY', 'EQUIPMENT',
      'PERSONNEL', 'VENDOR', 'DATA', 'DOCUMENT'
    ]).notNullable();
    t.text('description');
    t.text('description_ar');
    t.string('owner', 150);
    t.string('department', 100);
    t.string('location', 200);
    t.enum('criticality', ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).defaultTo('MEDIUM');
    t.enum('status', ['ACTIVE', 'INACTIVE', 'DECOMMISSIONED', 'PLANNED']).defaultTo('ACTIVE');
    t.integer('rto_hours');
    t.integer('rpo_hours');
    t.integer('mtpd_hours');
    t.text('recovery_procedure');
    t.string('vendor_name', 200);
    t.string('vendor_contact', 200);
    t.date('contract_expiry');
    t.jsonb('metadata').defaultTo('{}');
    t.timestamps(true, true);
    t.uuid('created_by');
    t.uuid('updated_by');

    t.index('asset_type');
    t.index('criticality');
    t.index('status');
    t.index('department');
  });

  // 2 ── bia_asset_process_links ───────────────────────────────────────────────
  await knex.schema.createTable('bia_asset_process_links', t => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('asset_id').notNullable().references('id').inTable('bia_assets').onDelete('CASCADE');
    t.uuid('process_id').notNullable();  // FK to bia_processes
    t.enum('dependency_type', ['CRITICAL', 'IMPORTANT', 'SUPPORTING', 'OPTIONAL']).defaultTo('IMPORTANT');
    t.boolean('is_alternative_available').defaultTo(false);
    t.text('alternative_description');
    t.text('notes');
    t.timestamps(true, true);

    t.unique(['asset_id', 'process_id']);
    t.index('asset_id');
    t.index('process_id');
  });

  // 3 ── bia_asset_dependencies (inter-asset relationships) ────────────────────
  await knex.schema.createTable('bia_asset_dependencies', t => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('source_asset_id').notNullable().references('id').inTable('bia_assets').onDelete('CASCADE');
    t.uuid('target_asset_id').notNullable().references('id').inTable('bia_assets').onDelete('CASCADE');
    t.enum('relationship_type', ['DEPENDS_ON', 'HOSTS', 'FEEDS_DATA', 'MANAGED_BY']).defaultTo('DEPENDS_ON');
    t.text('description');
    t.timestamps(true, true);

    t.unique(['source_asset_id', 'target_asset_id']);
    t.index('source_asset_id');
    t.index('target_asset_id');
  });
}

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('bia_asset_dependencies');
  await knex.schema.dropTableIfExists('bia_asset_process_links');
  await knex.schema.dropTableIfExists('bia_assets');
}
