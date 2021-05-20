import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("triggers", (table) => {
    table.string("deployment_preview_url");
  });

  return knex.raw(
    `ALTER TABLE triggers ADD CONSTRAINT triggers_render_and_preview_url CHECK ( 
      NOT ( deployment_preview_url IS NULL AND deployment_provider = 'render' ) 
    )`
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(
    "ALTER TABLE triggers DROP CONSTRAINT triggers_render_and_preview_url"
  );

  return knex.schema.alterTable("triggers", (table) => {
    table.dropColumn("deployment_preview_url");
  });
}
