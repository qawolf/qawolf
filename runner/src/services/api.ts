import retry from "async-retry";
import axios from "axios";
import Debug from "debug";

import config from "../config";
import { Email, Run } from "../types";

type GraphQLRequestData = {
  query: string;
  variables: Record<string, unknown>;
};

type PollForEmail = {
  apiKey: string;
  createdAfter: Date;
  timeoutMs: number;
  to: string;
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

type SendEmail = {
  apiKey: string;
  from: string;
  html?: string;
  subject: string;
  text?: string;
  to: string;
};

type UpdateRunner = {
  is_healthy?: boolean;
  is_ready?: boolean;
};

const debug = Debug("qawolf:api");
const debugPublic = Debug("qawolf:public");

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

const sendEmailMutation = `
mutation sendEmail($from: String!, $html: String, $subject: String!, $text: String, $to: String!) {
  sendEmail(from: $from, html: $html, subject: $subject, text: $text, to: $to) {
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
}: PollForEmail): Promise<Email> => {
  let timeout = false;

  const requestPromise = retry(
    async (_, attempt) => {
      if (timeout) return;

      try {
        debugPublic(`wait for email to ${to}, attempt ${attempt}`);

        const result = await axios.post(
          `${config.API_URL}/graphql`,
          {
            query: emailQuery,
            variables: {
              created_after: createdAfter.toISOString(),
              to,
            },
          },
          { headers: { authorization: apiKey } }
        );

        const { data, errors } = result?.data || {};
        if (errors?.length > 0) {
          throw new Error("GraphQL Errors " + JSON.stringify(errors));
        }

        const email = data?.email;
        if (!email) throw new Error(`email to ${to} not received`);

        debugPublic(`found email to ${to} with subject ${email.subject}`);

        return email;
      } catch (e) {
        debug(`pollForEmail failed ${e} ${JSON.stringify(e.response?.data)}`);
        throw e;
      }
    },
    {
      factor: 1,
      maxTimeout: 3000,
      minTimeout: 3000,
      retries: Math.round(timeoutMs / 3000),
    }
  );

  const timeoutPromise = new Promise<Email>((_, reject) => {
    setTimeout(() => {
      timeout = true;
      reject(new Error(`Email to ${to} not found`));
    }, timeoutMs);
  });

  return Promise.race([requestPromise, timeoutPromise]);
};

export const sendEmail = async ({
  apiKey,
  ...email
}: SendEmail): Promise<Email> => {
  debugPublic(`send email to ${email.to}`);

  const result = await axios.post(
    `${config.API_URL}/graphql`,
    {
      query: sendEmailMutation,
      variables: email,
    },
    { headers: { authorization: apiKey } }
  );

  const { data, errors } = result?.data || {};
  const sentEmail = data?.sendEmail || null;

  if (!sentEmail) {
    let message = "";

    if (errors?.length) {
      message = errors.map((e: { message: string }) => e.message).join(", ");
    }

    throw new Error(`Error sending email${message ? ": " + message : ""}`);
  }

  debugPublic(`sent email to ${email.to}`);

  return sentEmail;
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
