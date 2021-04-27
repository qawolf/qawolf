import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("runners", (table) => {
    table.string("test_branch");
  });

  await knex.raw(
    `ALTER TABLE runners ADD CONSTRAINT runners_test_branch_requires_test CHECK ( 
      NOT ( test_id IS NULL AND test_branch IS NOT NULL )
    )`
  );

  await knex.schema.alterTable("tests", (table) => {
    table.string("runner_requested_branch");
  });

  await knex.raw(
    `ALTER TABLE tests ADD CONSTRAINT tests_runner_requested_branch_and_runner_requested_at CHECK ( 
      NOT ( runner_requested_at IS NULL AND runner_requested_branch IS NOT NULL )
    )`
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(
    "ALTER TABLE runners DROP CONSTRAINT runners_test_branch_requires_test"
  );

  await knex.schema.alterTable("runners", (table) => {
    table.dropColumn("test_branch");
  });

  await knex.raw(
    "ALTER TABLE tests DROP CONSTRAINT tests_runner_requested_branch_and_runner_requested_at"
  );

  await knex.schema.alterTable("tests", (table) => {
    table.dropColumn("runner_requested_branch");
  });
}
