import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("groups", (table) => {
    table.boolean("is_default").notNullable().defaultTo(false);
  });

  // only allow one default group per team
  await knex.raw(`CREATE UNIQUE INDEX groups_unique_is_default_team_id
  ON groups(is_default, team_id)
  WHERE is_default = TRUE`);

  // delete stale group_test records
  await knex.raw(`
    DELETE FROM group_tests
    WHERE group_tests.test_id IN (
        SELECT id
        FROM tests
        WHERE deleted_at IS NOT NULL
    )
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("groups", (table) => {
    table.dropColumn("is_default");
  });

  return knex.raw("DROP INDEX groups_unique_is_default_team_id");
}
