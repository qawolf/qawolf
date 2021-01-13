import * as Knex from "knex";

export async function up(knex: Knex): Promise<Knex.SchemaBuilder> {
  const exists = await knex.schema.hasTable("runs");
  if (exists) return;

  return knex.schema.createTable("runs", (table) => {
    table.string("id").primary();
    table.timestamp("completed_at");
    table.string("session_id").notNullable();
    table.timestamp("started_at");
    table.string("status").notNullable();
    table.string("suite_id");
    table.string("test_id").notNullable();

    table.foreign("suite_id").references("id").inTable("suites");
    table.foreign("test_id").references("id").inTable("tests");

    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
  });
}

export async function down(knex: Knex): Promise<Knex.SchemaBuilder> {
  const exists = await knex.schema.hasTable("runs");
  if (!exists) return;

  return knex.schema.dropTable("runs");
}
