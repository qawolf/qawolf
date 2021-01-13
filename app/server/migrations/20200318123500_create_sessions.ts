import * as Knex from "knex";

export async function up(knex: Knex): Promise<Knex.SchemaBuilder> {
  const exists = await knex.schema.hasTable("sessions");
  if (exists) return;

  return knex.schema.createTable("sessions", (table) => {
    table.string("id").primary();
    table.string("job_id");
    table.string("location").notNullable();
    table.text("result");
    table.string("status").notNullable();

    table.timestamp("checked_at");
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("claimed_at");
    table.timestamp("expires_at");
    table.timestamp("killed_at");
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
  });
}

export async function down(knex: Knex): Promise<Knex.SchemaBuilder> {
  const exists = await knex.schema.hasTable("sessions");
  if (!exists) return;

  return knex.schema.dropTable("sessions");
}
