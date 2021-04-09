import { Email, ModelOptions } from "../types";
import { cuid } from "../utils";

type CreateEmail = {
  created_at?: string;
  from: string;
  html?: string;
  is_outbound?: boolean;
  subject?: string;
  team_id: string;
  text?: string;
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

  const email = {
    created_at: fields.created_at || new Date().toISOString(),
    from: fields.from.toLowerCase(),
    html: fields.html || "",
    id: cuid(),
    is_outbound: fields.is_outbound || false,
    subject: fields.subject || "",
    team_id: fields.team_id,
    text: fields.text || "",
    to: fields.to.toLowerCase(),
  };
  await db("emails").insert(email);

  log.debug("created", email.id);

  return email;
};

export const countOutboundEmailsForTeam = async (
  team_id: string,
  { db, logger }: ModelOptions
): Promise<number> => {
  const log = logger.prefix("countOutboundEmailsForTeam");
  log.debug("team", team_id);

  const result = await db("emails")
    .count("id")
    .where({ is_outbound: true, team_id })
    .first();

  const count = Number(result.count);
  log.debug("count", count);

  return count;
};

export const deleteOldEmails = async ({
  db,
  logger,
}: ModelOptions): Promise<void> => {
  const log = logger.prefix("deleteOldEmails");

  const oneMonthAgo = new Date();
  oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);

  const deleteCount = await db("emails")
    .where("created_at", "<", oneMonthAgo.toISOString())
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
