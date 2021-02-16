import { Email, ModelOptions } from "../types";
import { cuid } from "../utils";

type CreateEmail = {
  body: string;
  from: string;
  subject: string;
  team_id: string;
  to: string;
};

export const createEmail = async (
  fields: CreateEmail,
  { db, logger }: ModelOptions
): Promise<Email> => {
  const log = logger.prefix("createTrigger");
  log.debug(`create email for team ${fields.team_id}`);

  const email = { ...fields, id: cuid() };
  await db("emails").insert(email);

  log.debug("created", email.id);

  return email;
};
