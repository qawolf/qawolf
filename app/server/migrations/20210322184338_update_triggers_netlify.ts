import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("triggers", (table) => {
    table.string("deployment_provider");
    table.string("netlify_event");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("triggers", (table) => {
    table.dropColumn("deployment_provider");
    table.dropColumn("netlify_event");
  });
}
