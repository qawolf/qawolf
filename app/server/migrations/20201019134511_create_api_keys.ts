import * as Knex from "knex";

export async function up(knex: Knex): Promise<Knex.SchemaBuilder> {
  const exists = await knex.schema.hasTable("api_keys");
  if (exists) return;

  return knex.schema.createTable("api_keys", (table) => {
    table.string("id").primary();
    table.string("name").notNullable();
    table.string("team_id").notNullable();
    table.string("token_digest").notNullable().unique();
    table.string("token_end").notNullable();

    table.foreign("team_id").references("id").inTable("teams");

    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("last_used_at");
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
  });
}

export async function down(knex: Knex): Promise<Knex.SchemaBuilder> {
  const exists = await knex.schema.hasTable("api_keys");
  if (!exists) return;

  return knex.schema.dropTable("api_keys");
}
