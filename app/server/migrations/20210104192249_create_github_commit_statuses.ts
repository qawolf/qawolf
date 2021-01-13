import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  const exists = await knex.schema.hasTable("github_commit_statuses");
  if (exists) return;

  return knex.schema.createTable("github_commit_statuses", (table) => {
    table.string("id").primary();
    table.string("context").notNullable();
    table.string("deployment_url").notNullable();
    table.integer("github_installation_id").notNullable();
    table.string("group_id").notNullable();
    table.string("owner").notNullable();
    table.string("repo").notNullable();
    table.string("sha").notNullable();
    table.string("suite_id").notNullable().unique();

    table.foreign("group_id").references("id").inTable("groups");
    table.foreign("suite_id").references("id").inTable("suites");

    table.timestamp("completed_at");
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  const exists = await knex.schema.hasTable("github_commit_statuses");
  if (!exists) return;

  return knex.schema.dropTable("github_commit_statuses");
}
