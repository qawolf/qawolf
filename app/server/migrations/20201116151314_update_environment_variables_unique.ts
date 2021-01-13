import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("environment_variables", (table) => {
    table.unique(["group_id", "name"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("environment_variables", (table) => {
    table.dropUnique(["group_id", "name"]);
  });
}
