import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("emails", (table) => {
    table.boolean("is_outbound").notNullable().defaultTo(false);

    table.text("html").nullable().alter();
    table.text("text").nullable().alter();

    table.dropColumn("updated_at");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("emails", (table) => {
    table.dropColumn("is_outbound");

    table.text("html").notNullable().alter();
    table.text("text").notNullable().alter();

    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
  });
}
