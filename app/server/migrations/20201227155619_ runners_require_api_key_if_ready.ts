import * as Knex from "knex";

export function up(knex: Knex): Promise<void> {
  return knex.raw(
    `ALTER TABLE runners ADD CONSTRAINT runners_require_api_key_if_ready CHECK ( 
      NOT ( api_key IS NULL AND ready_at IS NOT NULL ) 
    )`
  );
}

export function down(knex: Knex): Promise<void> {
  return knex.raw(
    "ALTER TABLE runners DROP CONSTRAINT runners_require_api_key_if_ready"
  );
}
