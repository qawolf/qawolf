import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.renameTable("groups", "tags");

  await knex.schema.alterTable("tags", (table) => {
    table.string("color").notNullable().defaultTo("#4545E5");
  });

  await knex.raw(
    `ALTER INDEX IF EXISTS groups_name_team_id_unique RENAME TO tags_unique_name_team_id;
    ALTER INDEX groups_pkey RENAME to tags_pkey;`
  );

  await knex.schema.createTable("tag_tests", (table) => {
    table.string("id").primary();
    table.string("tag_id").notNullable();
    table.string("test_id").notNullable();

    table
      .foreign("tag_id")
      .references("id")
      .inTable("tags")
      .onDelete("CASCADE");
    table
      .foreign("test_id")
      .references("id")
      .inTable("tests")
      .onDelete("CASCADE");

    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();

    table.unique(["tag_id", "test_id"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("tag_tests");

  await knex.schema.alterTable("tags", (table) => {
    table.dropColumn("color");
  });

  await knex.schema.renameTable("tags", "groups");
}
