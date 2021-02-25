import cuid from "cuid";
import { ClientError } from "../errors";
import { Group, ModelOptions } from "../types";

type CreateGroup = {
  name: string;
  team_id: string;
};

export const createGroup = async (
  { name, team_id }: CreateGroup,
  { db, logger }: ModelOptions
): Promise<Group> => {
  const log = logger.prefix("createGroup");
  log.debug(`create ${name} for team ${team_id}`);

  const group = {
    id: cuid(),
    name,
    team_id,
  };

  try {
    await db("groups").insert(group);
  } catch (error) {
    if (error.message.includes("groups_name_team_id_unique")) {
      throw new ClientError("group name must be unique");
    }

    throw error;
  }
  log.debug("created", group.id);

  return group;
};
