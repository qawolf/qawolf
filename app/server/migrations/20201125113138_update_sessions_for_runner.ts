import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("sessions", (table) => {
    table.dropColumn("checked_at");
    table.dropColumn("claimed_at");
    table.dropColumn("job_id");
    table.dropColumn("killed_at");
    table.dropColumn("result");
    table.dropColumn("status");
    table.dropColumn("location");

    table.timestamp("assigned_at");
    table.string("edit_test_id");
    table.foreign("edit_test_id").references("id").inTable("tests");
    table.text("locations");
    table.string("run_id");
    table.foreign("run_id").references("id").inTable("runs");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("sessions", (table) => {
    table.timestamp("checked_at");
    table.timestamp("claimed_at");
    table.string("job_id");
    table.timestamp("killed_at");
    table.string("location").notNullable();
    table.text("result");
    table.string("status").notNullable();

    table.dropColumn("assigned_at");
    table.dropColumn("locations");
    table.dropColumn("run_id");
    table.dropColumn("runner_id");
    table.dropColumn("test_id");
  });
}
