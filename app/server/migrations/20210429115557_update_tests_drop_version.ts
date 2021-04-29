import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("tests", (table) => {
    table.dropColumn("version");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("tests", (table) => {
    table.integer("version").notNullable().defaultTo(0);
  });
}
