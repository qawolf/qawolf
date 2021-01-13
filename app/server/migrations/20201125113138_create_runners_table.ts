import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  const exists = await knex.schema.hasTable("runners");
  if (exists) return;

  return knex.schema.createTable("runners", (table) => {
    table.string("id").primary();

    table.string("api_key");
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("deleted_at");
    table.timestamp("deployed_at");
    table.timestamp("health_checked_at");
    table.string("location").notNullable();
    table.timestamp("ready_at");
    table.timestamp("restarted_at");
    table.string("session_id");
    table.foreign("session_id").references("id").inTable("sessions");
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  const exists = await knex.schema.hasTable("runners");
  if (!exists) return;

  return knex.schema.dropTable("runners");
}
