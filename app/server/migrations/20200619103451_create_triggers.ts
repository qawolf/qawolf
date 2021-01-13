import * as Knex from "knex";

export async function up(knex: Knex): Promise<Knex.SchemaBuilder> {
  const exists = await knex.schema.hasTable("triggers");
  if (exists) return;

  await knex.schema.createTable("triggers", (table) => {
    table.string("id").primary();
    table.string("creator_id").notNullable();
    table.string("name").notNullable();
    table.string("team_id").notNullable();
    table.timestamp("next_at");
    table.integer("repeat_minutes");

    table.foreign("team_id").references("id").inTable("teams");
    table.foreign("creator_id").references("id").inTable("users");

    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("deleted_at");
  });

  return knex.raw(`CREATE UNIQUE INDEX triggers_unique_name_team_id
  ON triggers(name, team_id)
  WHERE deleted_at IS NULL`);
}

export async function down(knex: Knex): Promise<Knex.SchemaBuilder> {
  const exists = await knex.schema.hasTable("triggers");
  if (!exists) return;

  await knex.schema.dropTable("triggers");
  return knex.raw("DROP INDEX triggers_unique_name_team_id");
}
