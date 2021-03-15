import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("tests", (table) => {
    table.string("guide");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("tests", (table) => {
    table.dropColumn("guide");
  });
}
