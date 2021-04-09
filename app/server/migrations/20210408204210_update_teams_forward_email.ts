import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("teams", (table) => {
    table.string("forward_email");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("teams", (table) => {
    table.dropColumn("forward_email");
  });
}
