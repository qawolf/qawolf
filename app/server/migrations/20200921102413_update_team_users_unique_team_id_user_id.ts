import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("team_users", (table) => {
    table.unique(["team_id", "user_id"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("team_users", (table) => {
    table.dropUnique(["team_id", "user_id"]);
  });
}
