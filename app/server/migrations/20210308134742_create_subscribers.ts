import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  const exists = await knex.schema.hasTable("subscribers");
  if (exists) return;

  await knex.schema.createTable("subscribers", (table) => {
    table.string("id").primary();
    table.string("email").notNullable().unique();

    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  const exists = await knex.schema.hasTable("subscribers");
  if (!exists) return;

  return knex.schema.dropTable("subscribers");
}
