import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  const exists = await knex.schema.hasTable("pull_request_comments");
  if (exists) return;

  return knex.schema.createTable("pull_request_comments", (table) => {
    table.string("id").primary();
    table.text("body").notNullable();
    table
      .string("deployment_integration_id")
      .notNullable()
      .references("id")
      .inTable("integrations")
      .onDelete("CASCADE");
    table.integer("comment_id").notNullable();
    table.timestamp("last_commit_at").notNullable();
    table.integer("pull_request_id").notNullable();
    table.string("suite_id").notNullable().references("id").inTable("suites");
    table
      .string("trigger_id")
      .notNullable()
      .references("id")
      .inTable("triggers");
    table.string("user_id").notNullable().references("id").inTable("users");

    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  const exists = await knex.schema.hasTable("pull_request_comments");
  if (!exists) return;

  return knex.schema.dropTable("pull_request_comments");
}
