import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("triggers", (table) => {
    table.integer("start_hour");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("triggers", (table) => {
    table.dropColumn("start_hour");
  });
}
