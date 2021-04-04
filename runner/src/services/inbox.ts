import { slug } from "cuid";

import { Email } from "../types";
import { pollForEmail } from "./api";

export type GetInbox = {
  id?: string;
  new?: boolean;
};

type GetInboxContext = {
  apiKey: string;
  inbox: string;
};

type GetInboxResult = {
  email: string;
  sendMessage: (options: SendMessage) => Promise<Email>;
  waitForMessage: (options: WaitForMessage) => Promise<Email>;
};

type SendMessage = {
  html?: string;
  subject?: string;
  text?: string;
  to: string;
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
  if (args.id || args.new) {
    const [inbox, domain] = email.split("@");
    email = `${inbox}+${args.id || slug()}@${domain}`;
  }

  const sendMessage = ({
    html,
    subject,
    text,
    to,
  }: SendMessage): Promise<Email> => {
    if (!html && !text) {
      throw new Error("must provide email html or text");
    }
  };

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

  return { email, sendMessage, waitForMessage };
};
