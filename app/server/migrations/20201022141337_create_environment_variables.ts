import * as Knex from "knex";

export async function up(knex: Knex): Promise<Knex.SchemaBuilder> {
  const exists = await knex.schema.hasTable("environment_variables");
  if (exists) return;

  return knex.schema.createTable("environment_variables", (table) => {
    table.string("id").primary();
    table.string("group_id").notNullable();
    table.string("name").notNullable();
    table.string("team_id").notNullable();
    table.text("value").notNullable();

    table.foreign("group_id").references("id").inTable("groups");
    table.foreign("team_id").references("id").inTable("teams");

    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
  });
}

export async function down(knex: Knex): Promise<Knex.SchemaBuilder> {
  const exists = await knex.schema.hasTable("environment_variables");
  if (!exists) return;

  return knex.schema.dropTable("environment_variables");
}
