import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  const exists = await knex.schema.hasTable("environments");
  if (exists) return;

  await knex.schema.createTable("environments", (table) => {
    table.string("id").primary();

    table.string("name").notNullable();
    table.string("team_id").notNullable();

    table.foreign("team_id").references("id").inTable("teams");
    table.unique(["name", "team_id"]);

    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
  });

  await knex.schema.alterTable("environment_variables", (table) => {
    table.string("environment_id").references("id").inTable("environments");
  });

  return knex.schema.alterTable("groups", (table) => {
    table.string("environment_id").references("id").inTable("environments");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("groups", (table) => {
    table.dropColumn("environment_id");
  });

  await knex.schema.alterTable("environment_variables", (table) => {
    table.dropColumn("environment_id");
  });

  const exists = await knex.schema.hasTable("environments");
  if (!exists) return;

  await knex.schema.dropTable("environments");
}
