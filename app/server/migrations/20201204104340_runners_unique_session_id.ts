import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("runners", (table) => {
    table.string("session_id").unique().alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("runners", (table) => {
    table.string("session_id").alter();
  });
}
