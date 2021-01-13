import * as Knex from "knex";

export async function up(knex: Knex): Promise<Knex.SchemaBuilder> {
  const exists = await knex.schema.hasTable("suites");
  if (exists) return;

  return knex.schema.createTable("suites", (table) => {
    table.string("id").primary();
    table.string("creator_id");
    table.string("team_id").notNullable();
    table.string("trigger_id").notNullable();

    table.foreign("creator_id").references("id").inTable("users");
    table.foreign("team_id").references("id").inTable("teams");
    table.foreign("trigger_id").references("id").inTable("triggers");

    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
  });
}

export async function down(knex: Knex): Promise<Knex.SchemaBuilder> {
  const exists = await knex.schema.hasTable("suites");
  if (!exists) return;

  return knex.schema.dropTable("suites");
}
