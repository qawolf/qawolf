import retry from "async-retry";
import axios from "axios";
import Debug from "debug";

import config from "../config";
import { Email, Run } from "../types";

type GraphQLRequestData = {
  query: string;
  variables: Record<string, unknown>;
};

type PollForEamil = {
  apiKey: string;
  createdAfter: string;
  timeoutMs: number;
  to: string;
};

type PollForQuery = {
  apiKey: string;
  dataKey: string;
  logName: string;
  requestData: GraphQLRequestData;
  timeoutError: string;
  timeoutMs: number;
};

type RunFinishedParams = {
  current_line: number | null;
  error?: string;
  pass: boolean;
  run_id: string;
};

type RunStartedParams = {
  run_id: string;
};

type UpdateRunner = {
  is_healthy?: boolean;
  is_ready?: boolean;
};

const debug = Debug("qawolf:api");

const emailQuery = `
query email($created_after: String!, $to: String!) {
  email(created_after: $created_after, to: $to) {
    from
    html
    subject
    text
    to
  }
}
`;

const updateRunMutation = `
mutation updateRun($current_line: Int, $error: String, $id: ID!, $status: RunStatus!) {
  updateRun(current_line: $current_line, error: $error, id: $id, status: $status) {
    id
  }
}
`;

const updateRunnerMutation = `
mutation updateRunner($id: ID!, $is_healthy: Boolean, $is_ready: Boolean) {
  updateRunner(id: $id, is_healthy: $is_healthy, is_ready: $is_ready) {
    artifacts {
      gifUrl
      jsonUrl
      logsUrl
      videoUrl
    }
    code
    env
    helpers
    id
    test_id
    version
  }
}
`;

export const mutateWithRetry = async (
  requestData: GraphQLRequestData,
  logName: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> => {
  return retry(async (_, attempt) => {
    debug("%s attempt %s", logName, attempt);

    try {
      const apiKey = config.RUNNER_API_KEY;
      const headers = apiKey ? { authorization: apiKey } : {};

      const result = await axios.post(
        `${config.API_URL}/graphql`,
        requestData,
        { headers }
      );

      const data = result.data;

      const errors = data?.errors;
      if (errors?.length > 0) {
        debug("%s failed %o", logName, errors);
        throw new Error("GraphQL Errors " + JSON.stringify(errors));
      }

      debug(`${logName} success`);

      return data;
    } catch (e) {
      debug(`${logName} failed ${e} ${JSON.stringify(e.response.data)}`);
      throw e;
    }
  });
};

export const pollForQuery = async ({
  apiKey,
  dataKey,
  logName,
  timeoutError,
  timeoutMs,
  requestData,
}: PollForQuery): // eslint-disable-next-line @typescript-eslint/no-explicit-any
Promise<any> => {
  debug("pollForQuery: api key", apiKey);

  return Promise.race([
    retry(
      async (_, attempt) => {
        debug("%s attempt %s", logName, attempt);

        try {
          debug("pollForQuery: api key request", apiKey);

          const result = await axios.post(
            `${config.API_URL}/graphql`,
            requestData,
            { headers: { authorization: apiKey } }
          );

          const errors = result.data?.errors;
          if (errors?.length > 0) {
            debug("%s failed %o", logName, errors);
            throw new Error("GraphQL Errors " + JSON.stringify(errors));
          }

          if (!(result.data?.data || {})[dataKey]) {
            debug("%s not found", dataKey);
            throw new Error("Not found");
          }

          return result.data?.data[dataKey];
        } catch (e) {
          debug(`${logName} failed ${e} ${JSON.stringify(e.response.data)}`);
          throw e;
        }
      },
      {
        factor: 1,
        minTimeout: 3000,
        retries: Math.round(timeoutMs / 3000),
      }
    ),
    new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(timeoutError));
      }, timeoutMs);
    }),
  ]);
};

export const notifyRunStarted = async ({
  run_id,
}: RunStartedParams): Promise<void> => {
  await mutateWithRetry(
    {
      query: updateRunMutation,
      variables: {
        id: run_id,
        status: "created",
      },
    },
    "notifyRunStarted"
  );
};

export const notifyRunFinished = async ({
  current_line,
  error,
  run_id,
  pass,
}: RunFinishedParams): Promise<void> => {
  await mutateWithRetry(
    {
      query: updateRunMutation,
      variables: {
        current_line,
        error,
        id: run_id,
        status: pass ? "pass" : "fail",
      },
    },
    "notifyRunFinished"
  );
};

export const pollForEmail = async ({
  apiKey,
  createdAfter,
  timeoutMs,
  to,
}: PollForEamil): Promise<Email> => {
  debug("pollForEmail:", apiKey);

  return pollForQuery({
    apiKey,
    dataKey: "email",
    logName: "pollForEmail",
    requestData: {
      query: emailQuery,
      variables: {
        created_after: createdAfter,
        to,
      },
    },
    timeoutError: `Email to ${to} not received`,
    timeoutMs,
  });
};

export const updateRunner = async ({
  is_healthy,
  is_ready,
}: UpdateRunner): Promise<Run | null> => {
  const result = await mutateWithRetry(
    {
      query: updateRunnerMutation,
      variables: {
        id: config.RUNNER_ID,
        is_healthy,
        is_ready,
      },
    },
    "updateRunner"
  );

  const run = result.data?.updateRunner;
  if (!run) return null;

  return {
    ...run,
    env: JSON.parse(run.env || "{}"),
  };
};
