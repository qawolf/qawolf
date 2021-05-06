import retry from "async-retry";
import axios from "axios";
import Debug from "debug";

import config from "../config";
import { Email } from "../types";

type PollForEmail = {
  apiKey: string;
  createdAfter: Date;
  timeoutMs: number;
  to: string;
};

type SendEmail = {
  apiKey: string;
  from: string;
  html?: string;
  subject: string;
  text?: string;
  to: string;
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
