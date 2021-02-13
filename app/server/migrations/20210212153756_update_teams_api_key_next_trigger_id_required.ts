import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("teams", (table) => {
    table.string("api_key").notNullable().alter();
    table.string("next_trigger_id").notNullable().alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("teams", (table) => {
    table.string("api_key").nullable().alter();
    table.string("next_trigger_id").nullable().alter();
  });
}
