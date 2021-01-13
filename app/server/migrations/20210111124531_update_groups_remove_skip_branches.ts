import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    "ALTER TABLE groups DROP CONSTRAINT groups_branches_or_skip_branches"
  );

  return knex.schema.alterTable("groups", (table) => {
    table.renameColumn("branches", "deployment_branches");
    table.string("deployment_environment");

    table.dropColumn("skip_branches");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("groups", (table) => {
    table.string("skip_branches");

    table.renameColumn("deployment_branches", "branches");
    table.dropColumn("deployment_environment");
  });

  return knex.raw(
    `ALTER TABLE groups ADD CONSTRAINT groups_branches_or_skip_branches CHECK ( 
        NOT ( branches IS NOT NULL AND skip_branches IS NOT NULL ) 
      )`
  );
}
