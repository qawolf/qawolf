import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("runs", (table) => {
    table.string("session_id").nullable().alter();
    table.foreign("session_id").references("id").inTable("sessions");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("runs", (table) => {
    table.string("session_id").notNullable().alter();
  });
}
