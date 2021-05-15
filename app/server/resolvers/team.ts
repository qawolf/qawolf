import { createDefaultTeam, findTeam, updateTeam } from "../models/team";
import { createTeamUser } from "../models/team_user";
import { Context, IdQuery, Team, UpdateTeamMutation } from "../types";
import { ensureTeamAccess, ensureUser } from "./utils";

export const createTeamResolver = async (
  _: Record<string, unknown>,
  __: Record<string, unknown>,
  { db, logger, user: contextUser }: Context
): Promise<Team> => {
  const log = logger.prefix("createTeamResolver");

  const user = ensureUser({ logger, user: contextUser });
  log.debug("user", user.id);

  return db.transaction(async (trx) => {
    const team = await createDefaultTeam({ db: trx, logger });
    await createTeamUser(
      { team_id: team.id, role: "admin", user_id: user.id },
      { db: trx, logger }
    );

    return team;
  });
};

export const teamResolver = async (
  _: Record<string, unknown>,
  { id }: IdQuery,
  { db, logger, teams }: Context
): Promise<Team> => {
  const log = logger.prefix("teamResolver");
  log.debug(id);

  ensureTeamAccess({ logger, team_id: id, teams });

  return findTeam(id, { db, logger });
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

  return updateTeam(args, { db, logger });
};
