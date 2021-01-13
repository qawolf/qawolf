import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`UPDATE tests 
  SET code = 'const { context } = await launch();' || E'\n' || 'const page = await context.newPage();' || E'\n' || code`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`UPDATE tests
  SET code = RIGHT(code, LENGTH(code) - 74)`);
}
