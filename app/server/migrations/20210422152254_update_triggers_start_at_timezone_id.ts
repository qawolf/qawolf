import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("triggers", (table) => {
    // set start_at as UTC independent of timezone
    // for example this is 9:30am for every timezone: new Date(UTC.Date(2021, 1, 1, 9, 30))
    table.timestamp("start_at");
    table.string("timezone_id");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("triggers", (table) => {
    table.dropColumn("start_at");
    table.dropColumn("timezone_id");
  });
}
