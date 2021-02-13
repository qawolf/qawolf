import { PluginDefinition } from "apollo-server-core";
import { ApolloServer } from "apollo-server-micro";
import { NextApiRequest, NextApiResponse } from "next";

import { context } from "../../server/context";
import { connectDb } from "../../server/db";
import { CLIENT_ERROR_CODES, ClientError } from "../../server/errors";
import { resolvers } from "../../server/resolvers";
import * as typeDefs from "../../server/schema.graphql";

const plugins: PluginDefinition[] = [];

const apolloServer = new ApolloServer({
  context,
  formatError: (err) => {
    const { code } = err.extensions;

    if (!CLIENT_ERROR_CODES.includes(code)) {
      console.error("critical", "unexpected error", err.message, code, err);
      return new ClientError("Internal server error");
    }

    return err;
  },
  plugins,
  resolvers,
  typeDefs,
});

// https://nextjs.org/docs/api-routes/api-middlewares#custom-config
export const config = { api: { bodyParser: false } };

const graphqlHandler = apolloServer.createHandler({ path: "/api/graphql" });

export default async function (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = connectDb();
  (req as any).db = db;

  await graphqlHandler(req, res);

  await db.destroy();
}
