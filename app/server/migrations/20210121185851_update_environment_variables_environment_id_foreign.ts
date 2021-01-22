import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    "ALTER TABLE environment_variables DROP CONSTRAINT environment_variables_not_is_system_has_group_and_team"
  );

  await knex.schema.alterTable("environment_variables", (table) => {
    table.unique(["environment_id", "name"]);

    table.dropUnique(["group_id", "name"]);
    table.dropColumn("group_id");
  });

  return knex.raw(
    `ALTER TABLE environment_variables ADD CONSTRAINT environment_variables_not_is_system_has_environment_and_team CHECK ( 
        NOT ( is_system = FALSE AND ( environment_id IS NULL OR team_id IS NULL ) ) 
      )`
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(
    "ALTER TABLE environment_variables DROP CONSTRAINT environment_variables_not_is_system_has_environment_and_team"
  );

  await knex.schema.alterTable("environment_variables", (table) => {
    table.dropForeign(["environment_id"]);

    table.string("group_id");
    table.foreign("group_id").references("id").inTable("groups");
  });

  return knex.raw(
    `ALTER TABLE environment_variables ADD CONSTRAINT environment_variables_not_is_system_has_group_and_team CHECK ( 
          NOT ( is_system = FALSE AND ( group_id IS NULL OR team_id IS NULL ) ) 
        )`
  );
}
