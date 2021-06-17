import * as Knex from "knex";

export async function up(knex: Knex): Promise<Knex.SchemaBuilder> {
  const exists = await knex.schema.hasTable("files");
  if (!exists) return;

  return knex.schema.dropTable("files");
}

export async function down(knex: Knex): Promise<Knex.SchemaBuilder> {
  const exists = await knex.schema.hasTable("files");
  if (exists) return;

  return knex.schema.createTable("files", (table) => {
    table.string("id").primary();
    table.string("url").notNullable();

    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
  });
}
