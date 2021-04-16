import { slug } from "cuid";
import getUrls from "get-urls";

import { Email, ParsedEmail } from "../types";
import { pollForEmail, sendEmail } from "./api";

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
  waitForMessage: (options: WaitForMessage) => Promise<ParsedEmail>;
};

type SendMessage = {
  html?: string;
  subject: string;
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

  const sendMessage = (options: SendMessage): Promise<Email> => {
    if (!options.to) throw new Error("must include the to field");
    if (!options.subject) throw new Error("must include the subject field");
    if (!options.html && !options.text) {
      throw new Error("must include the html field or text field");
    }

    return sendEmail({
      ...options,
      apiKey,
      from: email,
    });
  };

  const waitForMessage = async ({
    after,
    timeout,
  }: WaitForMessage = {}): Promise<ParsedEmail> => {
    if (after && !(after instanceof Date)) {
      throw new Error("after must be a Date");
    }

    const message = await pollForEmail({
      apiKey,
      createdAfter: after || calledAt,
      timeoutMs: timeout || 60000,
      to: email,
    });

    // text first since it will have less noisy urls
    const urls = Array.from(getUrls([message.text, message.html].join(" ")))
      // ignore xml
      .filter((u) => !u.includes("w3.org"))
      // sort for deterministic order
      .sort();

    return { ...message, urls };
  };

  return { email, sendMessage, waitForMessage };
};
