import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  const exists = await knex.schema.hasTable("invites");
  if (exists) return;

  return knex.schema.createTable("invites", (table) => {
    table.string("id").primary();
    table.string("creator_id").notNullable();
    table.string("email").notNullable();
    table.string("team_id").notNullable();
    table.string("wolf_name").notNullable();
    table.integer("wolf_number").notNullable();
    table.string("wolf_variant").notNullable();

    table.foreign("creator_id").references("id").inTable("users");
    table.foreign("team_id").references("id").inTable("teams");

    table.timestamp("accepted_at");
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("expires_at").notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  const exists = await knex.schema.hasTable("invites");
  if (!exists) return;

  return knex.schema.dropTable("invites");
}
