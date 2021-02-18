import { findEmail } from "../models/email";
import { decrypt } from "../models/encrypt";
import { findTeamForEmail } from "../models/team";
import { Context, Email, EmailQuery } from "../types";

export const emailResolver = async (
  _: Record<string, unknown>,
  { created_after, to }: EmailQuery,
  { api_key, db, logger }: Context
): Promise<Email | null> => {
  const log = logger.prefix("emailResolver");
  log.debug("to", to);

  const team = await findTeamForEmail(to, { db, logger });

  if (!team || api_key !== decrypt(team.api_key)) {
    log.error("unauthorized");
    throw new Error("Unauthorized");
  }

  const createdAfterWithoutMs = new Date(created_after);
  createdAfterWithoutMs.setMilliseconds(0);

  return findEmail(
    { created_after: createdAfterWithoutMs.toISOString(), to },
    { db, logger }
  );
};
