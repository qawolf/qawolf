import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("suites", (table) => {
    table.string("commit_message");
    table.string("commit_url");
    table.string("pull_request_url");
    table.string("tag_names");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("suites", (table) => {
    table.dropColumn("commit_message");
    table.dropColumn("commit_url");
    table.dropColumn("pull_request_url");
    table.dropColumn("tag_names");
  });
}
