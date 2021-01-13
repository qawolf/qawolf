import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("sessions", (table) => {
    table.string("api_key").nullable().alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("runs", (table) => {
    table.string("session_id").notNullable().defaultTo("").alter();
  });
}
