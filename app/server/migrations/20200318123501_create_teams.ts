import * as Knex from "knex";

export async function up(knex: Knex): Promise<Knex.SchemaBuilder> {
  const exists = await knex.schema.hasTable("teams");
  if (exists) return;

  return knex.schema.createTable("teams", (table) => {
    table.string("id").primary();
    table.string("name").defaultTo("").notNullable();
    table.string("plan").notNullable();
    table.integer("runs").notNullable();

    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("deleted_at");
    table.timestamp("renewed_at");
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
  });
}

export async function down(knex: Knex): Promise<Knex.SchemaBuilder> {
  const exists = await knex.schema.hasTable("teams");
  if (!exists) return;

  return knex.schema.dropTable("teams");
}
