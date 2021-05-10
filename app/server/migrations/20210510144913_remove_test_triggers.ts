import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("teams", (table) => {
    table.dropColumn("next_trigger_id");
  });

  const exists = await knex.schema.hasTable("test_triggers");
  if (!exists) return;

  await knex.schema.dropTable("test_triggers");
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("teams", (table) => {
    table.string("next_trigger_id").unique();
  });

  const exists = await knex.schema.hasTable("test_triggers");
  if (exists) return;

  return knex.schema.createTable("test_triggers", (table) => {
    table.string("id").primary();
    table.string("test_id").notNullable();
    table.string("trigger_id").notNullable();

    table.foreign("test_id").references("id").inTable("tests");
    table.foreign("trigger_id").references("id").inTable("triggers");

    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
  });
}
