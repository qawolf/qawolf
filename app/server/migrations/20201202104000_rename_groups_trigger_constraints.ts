import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.raw(
    `ALTER TABLE groups RENAME CONSTRAINT "triggers_creator_id_foreign" TO "groups_creator_id_foreign";
     ALTER TABLE groups RENAME CONSTRAINT "triggers_team_id_foreign" TO "groups_team_id_foreign";
     ALTER INDEX triggers_pkey RENAME to groups_pkey;
     ALTER INDEX triggers_unique_name_team_id RENAME to groups_unique_name_team_id;`
  );
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.raw(
    `ALTER TABLE groups RENAME CONSTRAINT "groups_creator_id_foreign" TO "triggers_creator_id_foreign";
     ALTER TABLE groups RENAME CONSTRAINT "groups_team_id_foreign" TO "triggers_team_id_foreign";
     ALTER INDEX groups_pkey RENAME to triggers_pkey;
     ALTER INDEX groups_unique_name_team_id RENAME to triggers_unique_name_team_id;`
  );
}
