/**
 * Migration 015 — MFA & Security Hardening
 * - Adds TOTP-based MFA columns to users table
 * - Creates failed_logins table for account lockout tracking
 */
exports.up = function (knex) {
  return knex.schema
    .alterTable('users', (table) => {
      table.boolean('mfa_enabled').defaultTo(false);
      table.string('mfa_secret', 100);
      table.specificType('mfa_backup_codes', 'TEXT[]');
      table.timestamp('mfa_enabled_at');
    })
    .createTable('failed_logins', (table) => {
      table.bigIncrements('id').primary();
      table.string('email', 255);
      table.string('ip_address', 45);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.index(['email', 'created_at']);
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('failed_logins')
    .alterTable('users', (table) => {
      table.dropColumn('mfa_enabled');
      table.dropColumn('mfa_secret');
      table.dropColumn('mfa_backup_codes');
      table.dropColumn('mfa_enabled_at');
    });
};
