import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("groups", (table) => {
    table.string("integration_id");
    table.boolean("is_email_enabled").notNullable().defaultTo(true);

    table.foreign("integration_id").references("id").inTable("integrations");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("groups", (table) => {
    table.dropColumn("integration_id");
    table.dropColumn("is_email_enabled");
  });
}
