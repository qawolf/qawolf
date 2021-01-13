import * as Knex from "knex";

export async function up(knex: Knex): Promise<Knex.SchemaBuilder> {
  const exists = await knex.schema.hasTable("emails");
  if (exists) return;

  return knex.schema.createTable("emails", (table) => {
    table.string("id").primary();
    table.string("email").notNullable();
    table.string("plan").notNullable();

    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
  });
}

export async function down(knex: Knex): Promise<Knex.SchemaBuilder> {
  const exists = await knex.schema.hasTable("emails");
  if (!exists) return;

  return knex.schema.dropTable("emails");
}
