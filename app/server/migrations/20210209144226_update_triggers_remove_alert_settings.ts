import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("triggers", (table) => {
    table.dropColumn("alert_integration_id");
    table.dropColumn("alert_only_on_failure");
    table.dropColumn("is_email_enabled");
  });

  return knex.raw(`ALTER TABLE teams ADD CONSTRAINT teams_require_alert CHECK ( 
    NOT ( alert_integration_id IS NULL AND is_email_alert_enabled = FALSE ) 
  )`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw("ALTER TABLE teams DROP CONSTRAINT teams_require_alert");

  return knex.schema.alterTable("triggers", (table) => {
    table
      .string("alert_integration_id")
      .references("id")
      .inTable("integrations");
    table.boolean("alert_only_on_failure").notNullable().defaultTo(false);
    table.boolean("is_email_enabled").notNullable().defaultTo(true);
  });
}
