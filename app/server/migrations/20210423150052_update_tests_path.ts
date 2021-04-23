import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("suites", (table) => {
    table.text("helpers").notNullable().defaultTo("");
  });

  await knex.schema.alterTable("tests", (table) => {
    table.text("path");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("suites", (table) => {
    table.dropColumn("helpers");
  });

  await knex.schema.alterTable("tests", (table) => {
    table.dropColumn("path");
  });
}
