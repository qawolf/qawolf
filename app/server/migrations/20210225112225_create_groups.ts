import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  const exists = await knex.schema.hasTable("groups");
  if (exists) return;

  await knex.schema.createTable("groups", (table) => {
    table.string("id").primary();
    table.string("name").notNullable();
    table.string("team_id").references("id").inTable("teams");

    table.unique(["name", "team_id"]);

    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  const exists = await knex.schema.hasTable("groups");
  if (!exists) return;

  return knex.schema.dropTable("groups");
}
