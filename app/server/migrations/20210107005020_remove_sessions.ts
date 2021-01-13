import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("runners", (table) => {
    table.dropColumn("session_id");

    table.timestamp("session_expires_at");

    table.string("run_id").unique().references("id").inTable("runs");
    table.string("test_id").unique().references("id").inTable("tests");
  });

  await knex.raw(
    `ALTER TABLE runners ADD CONSTRAINT runners_run_id_or_test_id CHECK ( 
      NOT ( run_id IS NOT NULL AND test_id IS NOT NULL )
    )`
  );

  await knex.schema.alterTable("runs", (table) => {
    table.string("runner_id").unique().references("id").inTable("runners");
  });

  await knex.schema.alterTable("tests", (table) => {
    table.string("runner_id").unique().references("id").inTable("runners");
    table.text("runner_locations");
    table.timestamp("runner_requested_at");
  });

  await knex.raw(
    `ALTER TABLE tests ADD CONSTRAINT tests_runner_id_or_runner_requested_at CHECK ( 
      NOT ( runner_id IS NOT NULL AND runner_requested_at IS NOT NULL )
    )`
  );

  await knex.schema.dropTable("sessions");
}

export async function down(): Promise<void> {
  // this is a one way migration
}
