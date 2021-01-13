import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("runs", (table) => {
    table.dropColumn("session_id");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("runs", (table) => {
    table.string("session_id");
    table.foreign("session_id").references("id").inTable("sessions");
  });
}
