import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("teams", (table) => {
    table.boolean("alert_only_on_failure").notNullable().defaultTo(false);
    table.boolean("is_email_alert_enabled").notNullable().defaultTo(false);
    table
      .string("alert_integration_id")
      .references("id")
      .inTable("integrations");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("teams", (table) => {
    table.dropColumn("alert_only_on_failure");
    table.dropColumn("is_email_alert_enabled");
    table.dropColumn("alert_integration_id");
  });
}
