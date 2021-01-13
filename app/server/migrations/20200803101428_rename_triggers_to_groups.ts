import * as Knex from "knex";

export async function up(knex: Knex): Promise<Knex.SchemaBuilder> {
  await knex.schema.raw(`
        ALTER TABLE triggers RENAME TO groups;
    `);

  return knex.schema.raw(`
        ALTER TABLE suites RENAME COLUMN trigger_id TO group_id;
    `);
}

export async function down(knex: Knex): Promise<Knex.SchemaBuilder> {
  await knex.schema.raw(`
    ALTER TABLE groups RENAME TO triggers;
`);

  return knex.schema.raw(`
ALTER TABLE suites RENAME COLUMN group_id TO trigger_id;
`);
}
