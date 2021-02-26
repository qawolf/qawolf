import { decrypt } from "../models/encrypt";
import { findTeam, updateTeam } from "../models/team";
import { Context, IdQuery, Team, UpdateTeamMutation } from "../types";
import { ensureTeamAccess, formatTeam } from "./utils";

export const teamResolver = async (
  _: Record<string, unknown>,
  { id }: IdQuery,
  { db, logger, teams }: Context
): Promise<Team> => {
  const log = logger.prefix("teamResolver");
  log.debug(id);

  ensureTeamAccess({ logger, team_id: id, teams });

  const team = await findTeam(id, { db, logger });

  return formatTeam(team);
};

/**
 * @returns Updated team record
 */
export const updateTeamResolver = async (
  _: Record<string, unknown>,
  args: UpdateTeamMutation,
  { db, logger, teams }: Context
): Promise<Team> => {
  const log = logger.prefix("updateTeamResolver");
  log.debug(args.id);

  ensureTeamAccess({ logger, team_id: args.id, teams });

  const team = await updateTeam(args, { db, logger });

  return formatTeam(team);
};
