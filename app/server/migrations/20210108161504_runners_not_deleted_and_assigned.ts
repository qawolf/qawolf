import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.raw(
    `ALTER TABLE runners ADD CONSTRAINT runners_not_deleted_and_assigned CHECK ( 
      NOT ( deleted_at IS NOT NULL AND ( run_id IS NOT NULL OR test_id IS NOT NULL ) ) 
    )`
  );
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(
    "ALTER TABLE runners DROP CONSTRAINT runners_not_deleted_and_assigned"
  );
}
