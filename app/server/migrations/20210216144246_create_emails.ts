import * as Knex from "knex";

import { cuid } from "../utils";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("teams", (table) => {
    table.string("inbox").notNullable().unique().defaultTo(cuid());
  });

  const exists = await knex.schema.hasTable("emails");
  if (exists) return;

  return knex.schema.createTable("emails", (table) => {
    table.string("id").primary();
    table.text("body").notNullable();
    table.string("from", 320).notNullable();
    table.text("subject").notNullable();
    table.string("team_id").notNullable().references("id").inTable("teams");
    table.string("to").notNullable();

    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("teams", (table) => {
    table.dropColumn("inbox");
  });

  const exists = await knex.schema.hasTable("emails");
  if (!exists) return;

  return knex.schema.dropTable("emails");
}
