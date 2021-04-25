import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("suites", (table) => {
    table.string("branch");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("suites", (table) => {
    table.dropColumn("branch");
  });
}
