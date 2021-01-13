import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("users", (table) => {
    table.string("access_token").nullable().alter();
    table.string("avatar_url").nullable().alter();
    table.integer("github_id").nullable().alter();
    table.string("github_login").nullable().alter();

    table.string("password_digest");

    table.unique(["email"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("users", (table) => {
    table.string("access_token").notNullable().alter();
    table.string("avatar_url").notNullable().alter();
    table.integer("github_id").notNullable().unique().alter();
    table.string("github_login").notNullable().unique().alter();

    table.dropColumn("password_digest");

    table.dropUnique(["email"]);
  });
}
