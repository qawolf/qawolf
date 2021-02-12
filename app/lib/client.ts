import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import { onError } from "@apollo/link-error";

import { state } from "./state";

export const JWT_KEY = "qaw_token";

// these errors we handle with custom ui
const ERROR_OPERATION_DENYLIST = ["sendLoginCode", "signInWithEmail"];

const isDevelopment = process.env.NEXT_PUBLIC_ENV === "development";

const authLink = new ApolloLink((operation, forward) => {
  // add the recent-activity custom header to the headers
  operation.setContext(
    ({ headers = {} }: { headers?: { [name: string]: string } }) => ({
      headers: {
        ...headers,
        authorization: localStorage.getItem(JWT_KEY),
      },
    })
  );

  return forward(operation);
});

const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (networkError) {
    // include errors in console logs so that we can help users debug
    console.warn("qawolf:", networkError);
    if (isDevelopment) {
      state.setError(`Network error: ${networkError}`);
    }
  }

  if (graphQLErrors) {
    graphQLErrors.forEach(({ message }) => {
      const formattedMessage = message.replace("Context creation failed: ", "");

      const error = isDevelopment
        ? `Error (${operation.operationName}): ${formattedMessage}`
        : `Error: ${formattedMessage}`;

      console.warn("qawolf:", error);

      if (!ERROR_OPERATION_DENYLIST.includes(operation.operationName)) {
        state.setError(error);
      }
    });
  }
});

const httpLink = new HttpLink({ uri: "/api/graphql" });

export const client = new ApolloClient({
  cache: new InMemoryCache({
    typePolicies: {
      TestTriggers: {
        keyFields: ["test_id"],
      },
    },
  }),
  link: authLink.concat(errorLink).concat(httpLink),
});
