import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("users", (table) => {
    table.timestamp("subscribed_at");
  });

  await knex.raw(
    `UPDATE users SET subscribed_at = now() WHERE users.email IN (SELECT email FROM subscribers);`
  );
  await knex.raw(
    `DELETE FROM subscribers WHERE email IN (SELECT email FROM users);`
  );
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("users", (table) => {
    table.dropColumn("subscribed_at");
  });
}
