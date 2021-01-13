import * as Knex from "knex";

export async function up(knex: Knex): Promise<Knex.SchemaBuilder> {
  const exists = await knex.schema.hasTable("users");
  if (exists) return;

  return knex.schema.createTable("users", (table) => {
    table.string("id").primary();
    table.string("access_token").notNullable();
    table.string("avatar_url").notNullable();
    table.string("email").notNullable();
    table.integer("github_id").notNullable().unique();
    table.string("github_login").notNullable().unique();
    table.string("name");
    table.string("session_id");

    table.string("wolf_name").notNullable();
    table.integer("wolf_number").notNullable();
    table.string("wolf_variant").notNullable();

    table
      .foreign("session_id")
      .references("id")
      .inTable("sessions")
      .onDelete("SET NULL");

    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("onboarded_at");
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
  });
}

export async function down(knex: Knex): Promise<Knex.SchemaBuilder> {
  const exists = await knex.schema.hasTable("users");
  if (!exists) return;

  return knex.schema.dropTable("users");
}
