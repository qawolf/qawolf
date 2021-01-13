import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("teams", (table) => {
    table.boolean("is_enabled").notNullable().defaultTo(true);

    table.dropColumn("deleted_at");
    table.dropColumn("minutes");
  });
  // rename trial plan to free
  return knex("teams").where({ plan: "trial" }).update({ plan: "free" });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("teams", (table) => {
    table.dropColumn("is_enabled");

    table.timestamp("deleted_at");
    table.integer("minutes").notNullable().defaultTo(30);
  });

  return knex("teams").where({ plan: "free" }).update({ plan: "trial" });
}
