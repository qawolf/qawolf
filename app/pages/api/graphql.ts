import {
  ApolloServerPluginUsageReporting,
  PluginDefinition,
} from "apollo-server-core";
import { ApolloServer } from "apollo-server-micro";

import { context } from "../../server/context";
import { CLIENT_ERROR_CODES, ClientError } from "../../server/errors";
import { resolvers } from "../../server/resolvers";
import * as typeDefs from "../../server/schema.graphql";
import { Context } from "../../server/types";

const plugins: PluginDefinition[] = [
  {
    requestDidStart: () => ({
      willSendResponse: ({ context }) => {
        const { db } = context as Context;
        if (db) db.destroy();
      },
    }),
  },
];

if (process.env.APOLLO_KEY) {
  plugins.push(
    ApolloServerPluginUsageReporting({
      rewriteError(err) {
        const { code } = err?.extensions || {};

        // do not report client errors
        if (CLIENT_ERROR_CODES.includes(code)) return null;

        // report all unexpected errors
        return err;
      },
    })
  );
}

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

export default apolloServer.createHandler({ path: "/api/graphql" });
