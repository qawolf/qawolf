import { slug } from "cuid";

import { Email } from "../types";
import { pollForEmail } from "./api";

export type GetInbox = {
  new?: boolean;
};

type GetInboxContext = {
  apiKey: string;
  inbox: string;
};

type GetInboxResult = {
  email: string;
  waitForMessage: (options: WaitForMessage) => Promise<Email>;
};

type WaitForMessage = {
  after?: Date;
  timeout?: number;
};

export const getInbox = (
  args: GetInbox = {},
  context: GetInboxContext
): GetInboxResult => {
  const apiKey = context.apiKey;
  const calledAt = new Date();
  let email = context.inbox;
  if (args.new) {
    const [inbox, domain] = email.split("@");
    email = `${inbox}+${slug()}@${domain}`;
  }

  const waitForMessage = ({
    after,
    timeout,
  }: WaitForMessage = {}): Promise<Email> => {
    if (after && !(after instanceof Date)) {
      throw new Error("after must be a Date");
    }

    return pollForEmail({
      apiKey,
      createdAfter: after || calledAt,
      timeoutMs: timeout || 60000,
      to: email,
    });
  };

  return { email, waitForMessage };
};
