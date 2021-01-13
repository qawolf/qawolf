import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("groups", (table) => {
    table.renameColumn("integration_id", "alert_integration_id");

    table.string("deployment_integration_id");
    table
      .foreign("deployment_integration_id")
      .references("id")
      .inTable("integrations");
    table.string("branches");
    table.string("skip_branches");
  });

  return knex.raw(
    `ALTER TABLE groups ADD CONSTRAINT groups_branches_or_skip_branches CHECK ( 
      NOT ( branches IS NOT NULL AND skip_branches IS NOT NULL ) 
    )`
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(
    "ALTER TABLE groups DROP CONSTRAINT groups_branches_or_skip_branches"
  );

  return knex.schema.alterTable("groups", (table) => {
    table.renameColumn("alert_integration_id", "integration_id");

    table.dropColumn("deployment_integration_id");
    table.dropColumn("branches");
    table.dropColumn("skip_branches");
  });
}
