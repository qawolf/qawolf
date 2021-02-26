import { slug } from "cuid";
import Debug from "debug";

import { Email } from "../types";
import { pollForEmail } from "./api";

const debug = Debug("qawolf:inbox");

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
  debug(`getInbox ${JSON.stringify(args)} ${JSON.stringify(context)}`);
  let email = context.inbox;
  if (args.new) {
    const [inbox, domain] = email.split("@");
    email = `${inbox}+${slug()}@${domain}`;
  }

  async function waitFn(
    this: WaitForMessageContext,
    { after, timeout }: WaitForMessage = {}
  ): Promise<Email> {
    debug(`waitFn ${JSON.stringify(this)}`);

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

  const waitFnContext = {
    apiKey: context.apiKey,
    calledAt: new Date(),
    to: email,
  };

  debug(`waitFn bind ${JSON.stringify(waitFnContext)}`);

  const waitForMessage = waitFn.bind(waitFnContext);

  return { email, waitForMessage };
};
