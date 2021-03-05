import cuid from "cuid";

import { ClientError } from "../errors";
import { Group, ModelOptions } from "../types";

type CreateGroup = {
  name: string;
  team_id: string;
};

type UpdateGroup = {
  id: string;
  name: string;
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
    if (error.message.includes("unique")) {
      throw new ClientError("group name must be unique");
    }

    throw error;
  }
  log.debug("created", group.id);

  return group;
};

export const deleteGroup = async (
  id: string,
  { db, logger }: ModelOptions
): Promise<Group> => {
  const log = logger.prefix("deleteGroup");
  log.debug("group", id);

  const group = await findGroup(id, { db, logger });
  await db("groups").where({ id }).del();

  log.debug("deleted");

  return group;
};

export const findGroup = async (
  id: string,
  { db, logger }: ModelOptions
): Promise<Group> => {
  const log = logger.prefix("findGroup");
  log.debug("group", id);

  const group = await db("groups").where({ id }).first();

  if (!group) {
    log.error("not found");
    throw new Error("group not found");
  }

  log.debug("found");
  return group;
};

export const findGroupsForTeam = async (
  team_id: string,
  { db, logger }: ModelOptions
): Promise<Group[]> => {
  const log = logger.prefix("findGroupsForTeam");
  log.debug("team", team_id);

  const groups = await db("groups").where({ team_id }).orderBy("name", "asc");

  log.debug(`found ${groups.length} groups`);

  return groups;
};

export const updateGroup = async (
  { id, name }: UpdateGroup,
  { db, logger }: ModelOptions
): Promise<Group> => {
  const log = logger.prefix("updateGroup");
  log.debug("group", id, "name", name);

  const existingGroup = await findGroup(id, { db, logger });
  const updates: Partial<Group> = {
    name,
    updated_at: new Date().toISOString(),
  };

  try {
    await db("groups").update(updates).where({ id });
  } catch (error) {
    if (error.message.includes("unique")) {
      throw new ClientError("group name must be unique");
    }

    throw error;
  }

  log.debug("updates");

  return { ...existingGroup, ...updates };
};
