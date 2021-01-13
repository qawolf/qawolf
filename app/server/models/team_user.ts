import { db } from "../db";
import { ClientError } from "../errors";
import { ModelOptions, TeamUser, TeamUserRole } from "../types";
import { cuid } from "../utils";

type CreateTeamUser = {
  team_id: string;
  role?: TeamUserRole;
  user_id: string;
};

export const createTeamUser = async (
  { team_id, role, user_id }: CreateTeamUser,
  { logger, trx }: ModelOptions
): Promise<TeamUser> => {
  const log = logger.prefix("createTeamUser");

  log.debug("team", team_id, "user", user_id, "role", role);

  const teamUser = {
    team_id,
    id: cuid(),
    role: role || "admin",
    user_id,
  };

  try {
    await (trx || db)("team_users").insert(teamUser);
  } catch (error) {
    if (error.message.includes("team_users_team_id_user_id_unique")) {
      throw new ClientError("user already on team");
    }

    throw error;
  }

  log.debug("created", teamUser);

  return teamUser;
};
