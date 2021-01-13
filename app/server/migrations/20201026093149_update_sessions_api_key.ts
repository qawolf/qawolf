import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("sessions", (table) => {
    table.string("api_key").notNullable().defaultTo("");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("sessions", (table) => {
    table.dropColumn("api_key");
  });
}
