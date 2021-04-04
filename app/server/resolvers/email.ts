import { AuthenticationError } from "../errors";
import { findEmail } from "../models/email";
import { decrypt } from "../models/encrypt";
import { findTeamForEmail } from "../models/team";
import { Context, CreateEmailMutation, Email, EmailQuery } from "../types";

export const createEmailResolver = async (
  _: Record<string, unknown>,
  { from, subject, text, to, html }: CreateEmailMutation,
  { api_key, db, logger }: Context
): Promise<Email> => {
  const log = logger.prefix("createEmailResolver");
  log.debug("to", to);
};

export const emailResolver = async (
  _: Record<string, unknown>,
  { created_after, to }: EmailQuery,
  { api_key, db, logger }: Context
): Promise<Email | null> => {
  const log = logger.prefix("emailResolver");
  log.debug("to", to);

  const team = await findTeamForEmail(to, { db, logger });
  if (!team) {
    throw new AuthenticationError();
  }

  if (api_key !== decrypt(team.api_key)) {
    log.debug("invalid api key", api_key);
    throw new AuthenticationError();
  }

  const createdAfterWithoutMs = new Date(created_after);
  createdAfterWithoutMs.setMilliseconds(0);

  return findEmail(
    { created_after: createdAfterWithoutMs.toISOString(), to },
    { db, logger }
  );
};
