import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("triggers", (table) => {
    table.dropIndex("triggers_unique_is_default_team_id");
    table.dropColumn("is_default");

    table.string("color").notNullable().defaultTo("#4545E5");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("triggers", (table) => {
    table.boolean("is_default").notNullable().defaultTo(false);

    table.dropColumn("color");
  });

  // only allow one default group per team
  return knex.raw(`CREATE UNIQUE INDEX triggers_unique_is_default_team_id
    ON triggers(is_default, team_id)
    WHERE is_default = TRUE`);
}
