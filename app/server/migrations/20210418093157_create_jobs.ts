import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("suites", (table) => {
    table.dropColumn("alert_sent_at");
  });

  const exists = await knex.schema.hasTable("jobs");
  if (exists) return;

  await knex.schema.createTable("jobs", (table) => {
    table.string("id").primary();
    table.string("name").notNullable();
    table.string("suite_id").references("id").inTable("suites").notNullable();

    table.timestamp("started_at");
    table.timestamp("completed_at");

    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
  });

  // await knex.raw(`ALTER TABLE jobs ADD CONSTRAINT jobs_unique_name_suite_id CHECK (
  //   UNIQUE (name, suite_id) WHERE name = 'alert' OR name = 'github_commit_status'
  // )`);

  // do not allow multiple pending jobs of the same type for a suite
  await knex.raw(`CREATE UNIQUE INDEX jobs_unique_name_suite_id_alert
  ON jobs(name, suite_id)
  WHERE name = 'alert'`);

  await knex.raw(`CREATE UNIQUE INDEX jobs_unique_name_suite_id_github_commit_status
  ON jobs(name, suite_id)
  WHERE name = 'github_commit_status'`);

  await knex.raw(`CREATE UNIQUE INDEX jobs_unique_name_suite_id_pull_request_comment
  ON jobs(name, suite_id)
  WHERE name = 'pull_request_comment' AND started_at IS NULL`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("suites", (table) => {
    table.timestamp("alert_sent_at");
  });

  const exists = await knex.schema.hasTable("jobs");
  if (!exists) return;

  await knex.schema.dropTable("jobs");
}
