import { minutesFromNow } from "../../shared/utils";
import { Email, ModelOptions } from "../types";
import { cuid } from "../utils";

type CreateEmail = {
  created_at: string;
  from: string;
  html: string;
  subject: string;
  team_id: string;
  text: string;
  to: string;
};

type FindEmail = {
  created_after: string;
  to: string;
};

export const createEmail = async (
  fields: CreateEmail,
  { db, logger }: ModelOptions
): Promise<Email> => {
  const log = logger.prefix("createEmail");
  log.debug(`create email for team ${fields.team_id}`);

  const email = { ...fields, id: cuid(), to: fields.to.toLowerCase() };
  await db("emails").insert(email);

  log.debug("created", email.id);

  return email;
};

export const deleteOldEmails = async ({
  db,
  logger,
}: ModelOptions): Promise<void> => {
  const log = logger.prefix("deleteOldEmails");

  const deleteCount = await db("emails")
    .where("created_at", "<", minutesFromNow(-60))
    .del();

  log.debug(`deleted ${deleteCount} emails`);
};

export const findEmail = async (
  { created_after, to }: FindEmail,
  { db, logger }: ModelOptions
): Promise<Email | null> => {
  const log = logger.prefix("findEmail");
  log.debug(`find email to ${to} created after ${created_after}`);

  const email = await db("emails")
    .where("created_at", ">=", created_after)
    .andWhere({ to: to.toLowerCase() })
    .orderBy("created_at", "desc")
    .first();

  log.debug(email ? `found ${email.id}` : "not found");

  return email || null;
};
