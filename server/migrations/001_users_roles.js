/**
 * Migration 001: Users, Roles, Departments
 */
exports.up = function (knex) {
  return knex.schema
    .createTable('departments', (t) => {
      t.uuid('id').primary().defaultTo(knex.fn.uuid());
      t.string('name_ar').notNullable();
      t.string('name_en').notNullable();
      t.uuid('parent_id').references('id').inTable('departments').onDelete('SET NULL');
      t.uuid('head_user_id'); // FK added after users table exists
      t.timestamps(true, true);
    })
    .createTable('users', (t) => {
      t.uuid('id').primary().defaultTo(knex.fn.uuid());
      t.string('email').notNullable().unique();
      t.string('password_hash').notNullable();
      t.string('full_name_ar').notNullable();
      t.string('full_name_en').notNullable();
      t.uuid('department_id').references('id').inTable('departments').onDelete('SET NULL');
      t.enu('role', [
        'ADMIN', 'CRO', 'CISO', 'CEO', 'DEPT_HEAD', 'BC_COORDINATOR', 'ANALYST', 'VIEWER',
      ]).notNullable().defaultTo('VIEWER');
      t.jsonb('permissions').defaultTo('[]');
      t.boolean('is_active').defaultTo(true);
      t.timestamps(true, true);
    })
    .then(() => {
      // Add FK from departments.head_user_id → users.id
      return knex.schema.alterTable('departments', (t) => {
        t.foreign('head_user_id').references('id').inTable('users').onDelete('SET NULL');
      });
    });
};

exports.down = function (knex) {
  return knex.schema
    .alterTable('departments', (t) => { t.dropForeign('head_user_id'); })
    .dropTableIfExists('users')
    .dropTableIfExists('departments');
};
