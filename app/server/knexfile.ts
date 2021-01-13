import { PgConnectionConfig } from "knex";

import environment from "./environment";

const connection: PgConnectionConfig = {
  connectionString: environment.DATABASE_URL,
};
if (environment.DATABASE_SSL) connection.ssl = environment.DATABASE_SSL;

module.exports = {
  client: "pg",
  connection,
};
