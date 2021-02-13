import { findIntegrationsForTeam } from "../models/integration";
import { Context, Integration, TeamIdQuery } from "../types";
import { ensureTeamAccess } from "./utils";

export const integrationsResolver = async (
  _: Record<string, unknown>,
  { team_id }: TeamIdQuery,
  { db, logger, teams }: Context
): Promise<Integration[]> => {
  ensureTeamAccess({ logger, team_id, teams });

  const log = logger.prefix("integrationsResolver");
  log.debug("team", team_id);

  return findIntegrationsForTeam({ team_id }, { db, logger });
};
