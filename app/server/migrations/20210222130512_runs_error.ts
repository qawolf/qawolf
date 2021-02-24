import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("runs", (table) => {
    table.text("error");
    table.integer("retries");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("runs", (table) => {
    table.dropColumn("error");
    table.dropColumn("retries");
  });
}
