import retry from "async-retry";
import axios from "axios";
import Debug from "debug";

import config from "../config";
import { Run, Suite } from "../types";

type GraphQLRequestData = {
  query: string;
  variables: Record<string, unknown>;
};

type RunFinishedParams = {
  current_line: number | null;
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

const updateRunMutation = `
mutation updateRun($current_line: Int, $id: ID!, $status: RunStatus!) {
  updateRun(current_line: $current_line, id: $id, status: $status) {
    id
  }
}
`;

const updateRunnerMutation = `
mutation updateRunner($id: ID!, $is_healthy: Boolean, $is_ready: Boolean) {
  updateRunner(id: $id, is_healthy: $is_healthy, is_ready: $is_ready) {
    artifacts {
      gifUrl
      logsUrl
      videoUrl
    }
    code
    env
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
  run_id,
  pass,
}: RunFinishedParams): Promise<void> => {
  await mutateWithRetry(
    {
      query: updateRunMutation,
      variables: {
        current_line,
        id: run_id,
        status: pass ? "pass" : "fail",
      },
    },
    "notifyRunFinished"
  );
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
