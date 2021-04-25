import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("tests", (table) => {
    table.string("name").nullable().alter();
  });

  await knex.raw(
    `ALTER TABLE tests ADD CONSTRAINT tests_require_name_or_path CHECK (num_nonnulls(name, path) = 1)`
  );

  return knex.raw(`CREATE UNIQUE INDEX tests_unique_path_team_id
  ON tests(path, team_id)
  WHERE deleted_at IS NULL`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(
    "ALTER TABLE tests DROP CONSTRAINT tests_require_name_or_path"
  );

  await knex.raw("DROP INDEX tests_unique_path_team_id");

  return knex.schema.alterTable("tests", (table) => {
    table.string("name").notNullable().alter();
  });
}
