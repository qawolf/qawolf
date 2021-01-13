import * as Knex from "knex";

export async function up(knex: Knex): Promise<Knex.SchemaBuilder> {
  const exists = await knex.schema.hasTable("group_tests");
  if (exists) return;

  return knex.schema.createTable("group_tests", (table) => {
    table.string("id").primary();
    table.string("group_id").notNullable();
    table.string("test_id").notNullable();

    table.foreign("group_id").references("id").inTable("groups");
    table.foreign("test_id").references("id").inTable("tests");

    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
  });
}

export async function down(knex: Knex): Promise<Knex.SchemaBuilder> {
  const exists = await knex.schema.hasTable("group_tests");
  if (!exists) return;

  return knex.schema.dropTable("group_tests");
}
