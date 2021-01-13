import { findTeam, updateTeam } from "../models/team";
import { Context, IdQuery, Team, UpdateTeamMutation } from "../types";
import { ensureTeamAccess } from "./utils";

export const teamResolver = async (
  _: Record<string, unknown>,
  { id }: IdQuery,
  { logger, teams }: Context
): Promise<Team> => {
  const log = logger.prefix("teamResolver");
  log.debug(id);

  ensureTeamAccess({ logger, team_id: id, teams });

  return findTeam(id, { logger });
};

/**
 * @returns Updated team record
 */
export const updateTeamResolver = async (
  _: Record<string, unknown>,
  { id, name }: UpdateTeamMutation,
  { logger, teams }: Context
): Promise<Team> => {
  const log = logger.prefix("updateTeamResolver");
  log.debug(id);

  ensureTeamAccess({ logger, team_id: id, teams });

  return updateTeam({ id, name }, { logger });
};
