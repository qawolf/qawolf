import * as Knex from "knex";

export async function up(knex: Knex): Promise<Knex.SchemaBuilder> {
  const exists = await knex.schema.hasTable("tests");
  if (exists) return;

  await knex.schema.createTable("tests", (table) => {
    table.string("id").primary();
    table.text("code").notNullable();
    table.string("creator_id").notNullable();
    table.boolean("is_enabled").notNullable().defaultTo(false);
    table.string("name").notNullable();
    table.string("team_id").notNullable();
    table.string("url").notNullable();
    table.integer("version").notNullable().defaultTo(0);

    table.foreign("team_id").references("id").inTable("teams");
    table.foreign("creator_id").references("id").inTable("users");

    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("deleted_at");
  });

  return knex.raw(`CREATE UNIQUE INDEX tests_unique_name_team_id
  ON tests(name, team_id)
  WHERE deleted_at IS NULL`);
}

export async function down(knex: Knex): Promise<Knex.SchemaBuilder> {
  const exists = await knex.schema.hasTable("tests");
  if (!exists) return;

  await knex.schema.dropTable("tests");
  return knex.raw("DROP INDEX tests_unique_name_team_id");
}
