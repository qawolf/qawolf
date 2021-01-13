import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("runs", (table) => {
    table.text("code").notNullable().defaultTo("");
    table.integer("current_line");
  });

  // use the latest code for previous runs
  return knex.raw(`UPDATE runs  
  SET code = tests.code
  FROM tests
  WHERE runs.test_id = tests.id`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("runs", (table) => {
    table.dropColumn("code");
    table.dropColumn("current_line");
  });
}
