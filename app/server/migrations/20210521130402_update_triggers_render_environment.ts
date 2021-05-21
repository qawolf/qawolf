import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("triggers", (table) => {
    table.string("render_environment");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("triggers", (table) => {
    table.dropColumn("render_environment");
  });
}
