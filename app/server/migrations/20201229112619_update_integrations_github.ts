import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("integrations", (table) => {
    table.integer("github_installation_id");
    table.integer("github_repo_id");
    table.string("github_repo_name");

    table.unique(["github_repo_id", "team_id"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("integrations", (table) => {
    table.dropUnique(["github_repo_id", "team_id"]);

    table.dropColumn("github_installation_id");
    table.dropColumn("github_repo_id");
    table.dropColumn("github_repo_name");
  });
}
