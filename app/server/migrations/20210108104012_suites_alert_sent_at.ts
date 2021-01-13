import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("suites", (table) => {
    table.timestamp("alert_sent_at");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("suites", (table) => {
    table.dropColumn("alert_sent_at");
  });
}
