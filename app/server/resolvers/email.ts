import { AuthenticationError } from "../errors";
import {
  countOutboundEmailsForTeam,
  createEmail,
  findEmail,
} from "../models/email";
import { decrypt } from "../models/encrypt";
import { findTeamForEmail } from "../models/team";
import {
  Context,
  SendEmailMutation,
  Email,
  EmailQuery,
  ModelOptions,
  Team,
} from "../types";

type ValidateApiKey = {
  api_key: string;
  team: Team;
};

export const ensureCanSendEmail = async (
  team: Team | null,
  { db, logger }: ModelOptions
): Promise<void> => {
  const log = logger.prefix("ensureCanSendEmail");

  if (!team) throw new AuthenticationError();

  if (team.plan === "free") {
    log.error(`team ${team.id} cannot send email`);
    throw new Error(
      "Your team must be whitelisted to send emails. Please contact us at hello@qawolf for support."
    );
  }

  const count = await countOutboundEmailsForTeam(team.id, { db, logger });
  if (count > 1000) {
    log.alert(`team ${team.id} at email limit with ${count} emails`);
    throw new Error(
      "You have sent the maximum number of emails allowed this month"
    );
  }
};

const validateApiKey = (
  { api_key, team }: ValidateApiKey,
  logger: ModelOptions["logger"]
): void => {
  const log = logger.prefix("validateApiKey");

  if (api_key !== decrypt(team.api_key)) {
    log.debug("invalid api key", api_key);
    throw new AuthenticationError();
  }
};

export const emailResolver = async (
  _: Record<string, unknown>,
  { created_after, to }: EmailQuery,
  { api_key, db, logger }: Context
): Promise<Email | null> => {
  const log = logger.prefix("emailResolver");
  log.debug("to", to);

  const team = await findTeamForEmail(to, { db, logger });
  if (!team) throw new AuthenticationError();

  validateApiKey({ api_key, team }, logger);

  const createdAfterWithoutMs = new Date(created_after);
  createdAfterWithoutMs.setMilliseconds(0);

  return findEmail(
    { created_after: createdAfterWithoutMs.toISOString(), to },
    { db, logger }
  );
};

export const sendEmailResolver = async (
  _: Record<string, unknown>,
  { from, html, subject, text, to }: SendEmailMutation,
  { api_key, db, logger }: Context
): Promise<Email> => {
  const log = logger.prefix("sendEmailResolver");
  log.debug("from", from, "to", to);

  const team = await findTeamForEmail(from, { db, logger });

  validateApiKey({ api_key, team }, logger);
  await ensureCanSendEmail(team, { db, logger });

  return createEmail(
    { from, html, subject, team_id: team.id, text, to },
    { db, logger }
  );
};
