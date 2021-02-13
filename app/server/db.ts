import knex from "knex";

import environment from "./environment";

export const connectDb = (): knex => {
  const db = knex({
    client: "pg",
    connection: async () => {
      if (environment.NODE_ENV === "test") {
        throw new Error("Use test db");
      }

      const connection: knex.PgConnectionConfig = {
        connectionString: environment.DATABASE_URL,
      };
      if (environment.DATABASE_SSL) connection.ssl = environment.DATABASE_SSL;

      return connection;
    },
  });

  return db;
};
