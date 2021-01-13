import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.raw(
    `ALTER TABLE suites RENAME CONSTRAINT "suites_trigger_id_foreign" TO "suites_group_id_foreign";`
  );
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.raw(
    `ALTER TABLE suites RENAME CONSTRAINT "suites_group_id_foreign" TO "suites_trigger_id_foreign";`
  );
}
