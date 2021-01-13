import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("users", (table) => {
    table.dropColumn("session_id");
  });

  return knex.schema.alterTable("tests", (table) => {
    table.string("session_id");

    table
      .foreign("session_id")
      .references("id")
      .inTable("sessions")
      .onDelete("SET NULL");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("tests", (table) => {
    table.dropColumn("session_id");
  });

  return knex.schema.alterTable("users", (table) => {
    table.string("session_id");

    table
      .foreign("session_id")
      .references("id")
      .inTable("sessions")
      .onDelete("SET NULL");
  });
}
