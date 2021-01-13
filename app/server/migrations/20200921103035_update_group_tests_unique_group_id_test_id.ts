import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("group_tests", (table) => {
    table.unique(["group_id", "test_id"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("group_tests", (table) => {
    table.dropUnique(["group_id", "test_id"]);
  });
}
