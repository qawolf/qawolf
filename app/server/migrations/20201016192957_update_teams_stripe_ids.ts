import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("teams", (table) => {
    table.string("stripe_customer_id").unique();
    table.string("stripe_subscription_id").unique();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("teams", (table) => {
    table.dropColumn("stripe_customer_id");
    table.dropColumn("stripe_subscription_id");
  });
}
