import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("teams", (table) => {
    table.string("file_url");
  });

  return knex.schema.alterTable("tests", (table) => {
    table.string("file_url");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("teams", (table) => {
    table.dropColumn("file_url");
  });

  return knex.schema.alterTable("tests", (table) => {
    table.dropColumn("file_url");
  });
}
