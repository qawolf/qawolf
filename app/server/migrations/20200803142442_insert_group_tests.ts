import cuid from "cuid";
import * as Knex from "knex";

export async function up(knex: Knex): Promise<Knex.SchemaBuilder> {
  const tests = await knex
    .select(["tests.id as test_id", "groups.id as group_id"])
    .from("tests")
    .join("groups", "tests.team_id", "groups.team_id");

  const promises = tests.map((test) => {
    return knex("group_tests").insert({
      id: cuid(),
      group_id: test.group_id,
      test_id: test.test_id,
    });
  });

  await Promise.all(promises);
}

export async function down(knex: Knex): Promise<Knex.SchemaBuilder> {
  return knex("group_tests").delete();
}
