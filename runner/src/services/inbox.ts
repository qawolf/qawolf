import { slug } from "cuid";

import { Email } from "../types";
import { pollForEmail } from "./api";

type GetInbox = {
  new?: boolean;
};

type GetInboxResult = {
  email: string;
  getMessage: () => Promise<Email>;
};

export const getInbox = (args: GetInbox = {}): GetInboxResult => {
  let email = process.env.TEAM_INBOX!;
  if (args.new) {
    const [inbox, domain] = email.split("@");
    email = `${inbox}+${slug()}@${domain}`;
  }

  const getMessage = async (): Promise<Email> => {
    return pollForEmail(email, new Date().toISOString());
  };

  return { email, getMessage };
};
