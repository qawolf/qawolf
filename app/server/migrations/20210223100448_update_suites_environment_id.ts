import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("environment_variables", (table) => {
    table.dropForeign(["environment_id"]);

    table
      .foreign("environment_id")
      .references("environments.id")
      .onDelete("CASCADE");
  });

  await knex.schema.alterTable("triggers", (table) => {
    table.dropForeign(["environment_id"], "groups_environment_id_foreign");

    table
      .foreign("environment_id")
      .references("environments.id")
      .onDelete("Set NULL");
  });

  return knex.schema.alterTable("suites", (table) => {
    table
      .string("environment_id")
      .references("id")
      .inTable("environments")
      .onDelete("Set NULL");

    table.string("trigger_id").nullable().alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("environment_variables", (table) => {
    table.dropForeign(["environment_id"]);

    table.foreign("environment_id").references("environments.id");
  });

  await knex.schema.alterTable("triggers", (table) => {
    table.dropForeign(["environment_id"]);

    table.foreign("environment_id").references("environments.id");
  });

  return knex.schema.alterTable("suites", (table) => {
    table.dropColumn("environment_id");

    table.string("trigger_id").notNullable().alter();
  });
}
