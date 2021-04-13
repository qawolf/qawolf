import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("teams", (table) => {
    table.timestamp("last_synced_at");
    table.timestamp("limit_reached_at");

    table
      .timestamp("renewed_at")
      .notNullable()
      .defaultTo(knex.fn.now())
      .alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("teams", (table) => {
    table.dropColumn("last_synced_at");
    table.dropColumn("limit_reached_at");

    table.timestamp("renewed_at").nullable().alter();
  });
}
