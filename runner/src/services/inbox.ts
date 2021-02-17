import { Email } from "../types";
import { pollForEmail } from "./api";

type GetInbox = {
  new?: boolean;
};

type GetInboxResult = {
  email: string;
  getMessage: () => Promise<Email>;
};

const randomCharacters = (): string => {
  return Math.random().toString(36).substr(2, 8);
};

export const getInbox = (args: GetInbox = {}): GetInboxResult => {
  const tail = args.new ? `+${randomCharacters()}` : "";
  const email = `${process.env.TEAM_INBOX}${tail}@qawolf.email`;

  const getMessage = async (): Promise<Email> => {
    return pollForEmail(email, new Date().toISOString());
  };

  return { email, getMessage };
};
