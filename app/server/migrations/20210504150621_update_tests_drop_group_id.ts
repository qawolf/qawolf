import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table("tests", (table) => {
    table.dropColumn("group_id");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table("tests", (table) => {
    table.foreign("group_id").references("id").inTable("groups");
  });
}
