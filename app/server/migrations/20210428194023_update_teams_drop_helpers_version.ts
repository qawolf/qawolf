import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("teams", (table) => {
    table.dropColumn("helpers_version");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("teams", (table) => {
    table.integer("helpers_version").notNullable().defaultTo(0);
  });
}
