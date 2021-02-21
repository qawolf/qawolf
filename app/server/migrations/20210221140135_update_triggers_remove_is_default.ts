import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("triggers", (table) => {
    table.dropColumn("is_default");

    table.string("color").notNullable().defaultTo("#4545E5");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("triggers", (table) => {
    table.boolean("is_default").notNullable().defaultTo(false);

    table.dropColumn("color");
  });
}
