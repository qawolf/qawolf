import { findEmail } from "../models/email";
import { findTeamForEmail } from "../models/team";
import { Context, Email, EmailQuery } from "../types";
import { ensureTeamAccess } from "./utils";

export const emailResolver = async (
  _: Record<string, unknown>,
  { created_after, to }: EmailQuery,
  { db, logger, teams }: Context
): Promise<Email | null> => {
  const log = logger.prefix("emailResolver");
  log.debug("to", to);

  const team = await findTeamForEmail(to, { db, logger });
  ensureTeamAccess({ logger, team_id: team.id, teams });

  return findEmail({ created_after, to }, { db, logger });
};
