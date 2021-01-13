import * as Knex from "knex";

export async function up(knex: Knex): Promise<Knex.SchemaBuilder> {
  const exists = await knex.schema.hasTable("team_users");
  if (exists) return;

  return knex.schema.createTable("team_users", (table) => {
    table.string("id").primary();
    table.string("role").notNullable();
    table.string("team_id").notNullable();
    table.string("user_id").notNullable();

    table.foreign("team_id").references("id").inTable("teams");
    table.foreign("user_id").references("id").inTable("users");

    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
  });
}

export async function down(knex: Knex): Promise<Knex.SchemaBuilder> {
  const exists = await knex.schema.hasTable("team_users");
  if (!exists) return;

  return knex.schema.dropTable("team_users");
}
