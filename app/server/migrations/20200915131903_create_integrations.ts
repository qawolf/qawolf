import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  const exists = await knex.schema.hasTable("integrations");
  if (exists) return;

  return knex.schema.createTable("integrations", (table) => {
    table.string("id").primary();
    table.string("settings_url");
    table.string("slack_channel");
    table.string("team_id").notNullable();
    table.string("team_name");
    table.string("type").notNullable();
    table.string("webhook_url");

    table.foreign("team_id").references("id").inTable("teams");

    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  const exists = await knex.schema.hasTable("integrations");
  if (!exists) return;

  return knex.schema.dropTable("integrations");
}
