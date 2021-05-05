import {
  createGroup,
  deleteGroup,
  findGroupsForTeam,
  updateGroup,
} from "../models/tag";
import {
  Context,
  CreateGroupMutation,
  Group,
  IdQuery,
  TeamIdQuery,
  UpdateGroupMutation,
} from "../types";
import { ensureGroupAccess, ensureTeamAccess } from "./utils";

export const createGroupResolver = async (
  _: Record<string, unknown>,
  { name, team_id }: CreateGroupMutation,
  { db, logger, teams }: Context
): Promise<Group> => {
  const log = logger.prefix("createGroupResolver");
  log.debug("team", team_id);

  ensureTeamAccess({ logger, team_id, teams });

  return createGroup({ name, team_id }, { db, logger });
};

export const deleteGroupResolver = async (
  _: Record<string, unknown>,
  { id }: IdQuery,
  { db, logger, teams }: Context
): Promise<Group> => {
  const log = logger.prefix("deleteGroupResolver");
  log.debug("group", id);

  await ensureGroupAccess({ group_id: id, teams }, { db, logger });

  return deleteGroup(id, { db, logger });
};

export const groupsResolver = async (
  _: Record<string, unknown>,
  { team_id }: TeamIdQuery,
  { db, logger, teams }: Context
): Promise<Group[]> => {
  const log = logger.prefix("groupsResolver");
  log.debug("team", team_id);

  ensureTeamAccess({ logger, team_id, teams });

  return findGroupsForTeam(team_id, { db, logger });
};

export const updateGroupResolver = async (
  _: Record<string, unknown>,
  { id, name }: UpdateGroupMutation,
  { db, logger, teams }: Context
): Promise<Group> => {
  const log = logger.prefix("updateGroupResolver");
  log.debug("group", id);

  await ensureGroupAccess({ group_id: id, teams }, { db, logger });

  return updateGroup({ id, name }, { db, logger });
};
