import {
  ApolloError,
  AuthenticationError as ApolloAuthenticationError,
} from "apollo-server-micro";

// These errors are forwarded to the client / user
export const CLIENT_ERROR_CODES = ["CLIENT", "UNAUTHENTICATED"];

export class AuthenticationError extends ApolloAuthenticationError {
  constructor(message = "unauthorized") {
    super(message);
  }
}

export class ClientError extends ApolloError {
  constructor(message: string) {
    super(message, "CLIENT");

    Object.defineProperty(this, "name", { value: "ClientError" });
  }
}
