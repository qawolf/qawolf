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
  const tail = args.new ? `+${slug()}` : "";
  const email = `${process.env.TEAM_INBOX}${tail}@qawolf.email`.toLowerCase();

  const getMessage = async (): Promise<Email> => {
    return pollForEmail(email, new Date().toISOString());
  };

  return { email, getMessage };
};
