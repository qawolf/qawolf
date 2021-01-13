import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("environment_variables", (table) => {
    table.boolean("is_system").notNullable().defaultTo(false);

    table.string("group_id").nullable().alter();
    table.string("team_id").nullable().alter();
  });

  return knex.raw(
    `ALTER TABLE environment_variables ADD CONSTRAINT environment_variables_not_is_system_has_group_and_team CHECK ( 
      NOT ( is_system = FALSE AND ( group_id IS NULL OR team_id IS NULL ) ) 
    )`
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(
    "ALTER TABLE environment_variables DROP CONSTRAINT environment_variables_not_is_system_has_group_and_team"
  );

  return knex.schema.alterTable("environment_variables", (table) => {
    table.string("group_id").notNullable().alter();
    table.string("team_id").notNullable().alter();

    table.dropColumn("is_system");
  });
}
