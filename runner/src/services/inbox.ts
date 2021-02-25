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

type WaitForMessageContext = {
  apiKey: string;
  calledAt: Date;
  to: string;
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

  async function waitFn(
    this: WaitForMessageContext,
    { after, timeout }: WaitForMessage = {}
  ): Promise<Email> {
    if (after && !(after instanceof Date)) {
      throw new Error("after must be a Date");
    }

    return pollForEmail({
      apiKey: this.apiKey,
      createdAfter: (after || this.calledAt).toISOString(),
      timeoutMs: timeout || 60000,
      to: this.to,
    });
  }

  const waitForMessage = waitFn.bind({
    apiKey: context.apiKey,
    calledAt: new Date(),
    to: email,
  });

  return { email, waitForMessage };
};
