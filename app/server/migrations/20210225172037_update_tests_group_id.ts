import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("tests", (table) => {
    table
      .string("group_id")
      .references("id")
      .inTable("groups")
      .onDelete("SET NULL");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("tests", (table) => {
    table.dropColumn("group_id");
  });
}
