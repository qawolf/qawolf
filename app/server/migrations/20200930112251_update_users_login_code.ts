import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("users", (table) => {
    table.dropColumn("access_token");
    table.dropColumn("password_digest");

    table.string("login_code");
    table.timestamp("login_code_expires_at");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("users", (table) => {
    table.string("access_token");
    table.string("password_digest");

    table.dropColumn("login_code");
    table.dropColumn("login_code_expires_at");
  });
}
