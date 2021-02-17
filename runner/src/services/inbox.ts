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
  getMessage: () => Promise<Email>;
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

  const getMessage = async (): Promise<Email> => {
    return pollForEmail(email, createdAfter, context.apiKey);
  };

  return { email, getMessage };
};
