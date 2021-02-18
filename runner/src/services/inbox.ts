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
  timeout?: number;
};

export const getInbox = (
  args: GetInbox = {},
  context: GetInboxContext
): GetInboxResult => {
  let email = context.inbox;

  if (args.new) {
    const [inbox, domain] = email.split("@");
    email = `${inbox}+${slug()}@${domain}`;
  }

  const createdAfter = new Date().toISOString();

  const waitForMessage = async ({
    timeout,
  }: WaitForMessage = {}): Promise<Email> => {
    return pollForEmail({
      apiKey: context.apiKey,
      createdAfter,
      timeoutMs: timeout || 60000,
      to: email,
    });
  };

  return { email, waitForMessage };
};
