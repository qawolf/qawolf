import * as Knex from "knex";

export async function up(knex: Knex): Promise<Knex.SchemaBuilder> {
  await knex.schema.raw(`
    ALTER TABLE groups RENAME TO triggers;
    ALTER INDEX IF EXISTS groups_pkey RENAME TO triggers_pkey;
    ALTER INDEX IF EXISTS groups_unique_name_team_id RENAME TO triggers_unique_name_team_id;
    ALTER INDEX IF EXISTS groups_unique_is_default_team_id RENAME TO triggers_unique_is_default_team_id;
`);

  await knex.schema.raw(`
    ALTER TABLE group_tests RENAME TO test_triggers;
    ALTER TABLE test_triggers RENAME COLUMN group_id TO trigger_id;
    ALTER INDEX IF EXISTS group_tests_pkey RENAME TO test_triggers_pkey;
    ALTER INDEX IF EXISTS group_tests_group_id_test_id_unique RENAME TO test_triggers_test_id_trigger_id_unique;
`);

  await knex.schema.raw(`
    ALTER TABLE github_commit_statuses RENAME COLUMN group_id TO trigger_id;
`);

  await knex.schema.raw(`
    ALTER TABLE suites RENAME COLUMN group_id TO trigger_id;
`);
}

export async function down(knex: Knex): Promise<Knex.SchemaBuilder> {
  await knex.schema.raw(`
    ALTER TABLE triggers RENAME TO groups;
`);

  await knex.schema.raw(`
    ALTER TABLE test_triggers RENAME TO group_tests;
    ALTER TABLE group_tests RENAME COLUMN trigger_id TO group_id;
    ALTER INDEX IF EXISTS test_triggers_pkey RENAME TO group_tests_pkey;
    ALTER INDEX IF EXISTS test_triggers_test_id_trigger_id_unique RENAME TO group_tests_group_id_test_id_unique;
`);

  await knex.schema.raw(`
    ALTER TABLE github_commit_statuses RENAME COLUMN trigger_id TO group_id;
`);

  await knex.schema.raw(`
    ALTER TABLE suites RENAME COLUMN trigger_id TO group_id;
`);
}
