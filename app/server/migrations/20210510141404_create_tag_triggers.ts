import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  const exists = await knex.schema.hasTable("tag_triggers");
  if (exists) return;

  await knex.schema.createTable("tag_triggers", (table) => {
    table.string("id").primary();
    table.string("tag_id").notNullable();
    table.string("trigger_id").notNullable();

    table
      .foreign("tag_id")
      .references("id")
      .inTable("tags")
      .onDelete("CASCADE");
    table
      .foreign("trigger_id")
      .references("id")
      .inTable("triggers")
      .onDelete("CASCADE");

    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();

    table.unique(["tag_id", "trigger_id"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  const exists = await knex.schema.hasTable("tag_triggers");
  if (!exists) return;

  return knex.schema.dropTable("tag_triggers");
}
