import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("groups", (table) => {
    table.boolean("alert_only_on_failure").notNullable().defaultTo(false);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("groups", (table) => {
    table.dropColumn("alert_only_on_failure");
  });
}
