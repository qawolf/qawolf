import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("teams", (table) => {
    table.dropColumn("runs");
    table.integer("minutes").notNullable().defaultTo(30);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("teams", (table) => {
    table.dropColumn("minutes");
    table.integer("runs").notNullable().defaultTo(25);
  });
}
