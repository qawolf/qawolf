import isNil from "lodash/isNil";

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
  { helpers, id, name }: UpdateTeamMutation,
  { logger, teams }: Context
): Promise<Team> => {
  const log = logger.prefix("updateTeamResolver");
  log.debug(id);

  ensureTeamAccess({ logger, team_id: id, teams });

  if (isNil(helpers) && isNil(name)) {
    throw new Error("Must pass helpers or name");
  }

  return updateTeam({ helpers, id, name }, { logger });
};
