import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("teams", (table) => {
    table.integer("base_price");
    table.integer("metered_price");
  });

  return knex.raw(`
    UPDATE teams
    SET base_price = 40, metered_price = 20
    WHERE teams.plan = 'business';
  `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("teams", (table) => {
    table.dropColumn("base_price");
    table.dropColumn("metered_price");
  });
}
