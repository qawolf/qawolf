import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    `UPDATE tests SET runner_requested_at = NULL WHERE deleted_at IS NOT NULL`
  );

  await knex.raw(
    `ALTER TABLE tests ADD CONSTRAINT tests_not_deleted_and_runner_requested_at CHECK ( 
        NOT ( deleted_at IS NOT NULL AND runner_requested_at IS NOT NULL ) 
      )`
  );
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(
    "ALTER TABLE tests DROP CONSTRAINT tests_not_deleted_and_runner_requested_at"
  );
}
