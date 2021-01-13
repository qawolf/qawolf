import cuid from "cuid";
import knex from "knex";
import path from "path";
import { Client } from "pg";

import environment from "./environment";

const TEST_DATABASE_NAME = `test_${cuid()}`;

export const createTestDb = async (): Promise<void> => {
  const client = new Client();
  await client.connect();
  await client.query(`CREATE DATABASE ${TEST_DATABASE_NAME}`);
  await client.end();
};

let databaseReadyPromise = Promise.resolve();
if (environment.NODE_ENV === "test") {
  databaseReadyPromise = createTestDb();
}

export const db = knex({
  client: "pg",
  connection: async () => {
    await databaseReadyPromise;

    if (environment.NODE_ENV === "test") {
      return {
        database: TEST_DATABASE_NAME,
        password: process.env.PGPASSWORD,
        user: process.env.PGUSER,
      };
    }

    const connection: knex.PgConnectionConfig = {
      connectionString: environment.DATABASE_URL,
    };
    if (environment.DATABASE_SSL) connection.ssl = environment.DATABASE_SSL;

    return connection;
  },
});

export const dropTestDb = async (): Promise<void> => {
  await db.destroy();
  const client = new Client();
  await client.connect();
  await client.query(`DROP DATABASE ${TEST_DATABASE_NAME}`);
  await client.end();
};

export const migrateDb = async (): Promise<void> => {
  await db.migrate.latest({ directory: path.join(__dirname, "migrations") });
};
