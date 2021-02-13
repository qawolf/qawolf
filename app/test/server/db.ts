import cuid from "cuid";
import knex from "knex";
import path from "path";
import { Client } from "pg";

import environment from "../../server/environment";

if (environment.NODE_ENV !== "test") {
  throw new Error("Do not use test db outside of tests");
}

const createTestDb = async (name: string): Promise<void> => {
  const client = new Client();
  await client.connect();
  await client.query(`CREATE DATABASE ${name}`);
  await client.end();
};

const dropTestDb = async (testDb: knex, name: string): Promise<void> => {
  await testDb.destroy();
  const client = new Client();
  await client.connect();
  await client.query(`DROP DATABASE ${name}`);
  await client.end();
};

const migrateTestDb = async (testDb: knex): Promise<void> => {
  await testDb.migrate.latest({
    directory: path.join(__dirname, "../../server/migrations"),
  });
};

export const prepareTestDb = (): knex => {
  const testDbName = `test_${cuid()}`;

  const databaseCreatedPromise = createTestDb(testDbName);

  const testDb = knex({
    client: "pg",
    connection: async () => {
      await databaseCreatedPromise;

      return {
        database: testDbName,
        password: process.env.PGPASSWORD,
        user: process.env.PGUSER,
      };
    },
  });

  beforeAll(() => migrateTestDb(testDb));

  afterAll(() => dropTestDb(testDb, testDbName));

  return testDb;
};
