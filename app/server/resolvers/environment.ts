import { findEnvironmentsForTeam } from "../models/environment";
import { Context, Environment, TeamIdQuery } from "../types";
import { ensureTeamAccess } from "./utils";

export const environmentsResolver = async (
  _: Record<string, unknown>,
  { team_id }: TeamIdQuery,
  { logger, teams }: Context
): Promise<Environment[]> => {
  const log = logger.prefix("environmentsResolver");
  log.debug("team", team_id);

  ensureTeamAccess({ logger, team_id, teams });

  return findEnvironmentsForTeam(team_id, { logger });
};
