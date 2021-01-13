import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("suites", (table) => {
    table.text("environment_variables");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("suites", (table) => {
    table.dropColumn("environment_variables");
  });
}
