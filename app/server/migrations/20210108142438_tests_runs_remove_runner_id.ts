import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("runs", (table) => {
    table.dropColumn("runner_id");
  });

  await knex.schema.alterTable("tests", (table) => {
    table.dropColumn("runner_id");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("runs", (table) => {
    table.string("runner_id").unique().references("id").inTable("runners");
  });

  await knex.schema.alterTable("tests", (table) => {
    table.string("runner_id").unique().references("id").inTable("runners");
  });
}
