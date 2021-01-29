import { db } from "../db";
import {
  buildGroupName,
  createGroup,
  deleteGroup,
  findDefaultGroupForTeam,
  findGroupsForTeam,
  findGroupsForTest,
  updateGroup,
} from "../models/group";
import { deleteGroupTestsForGroup } from "../models/group_test";
import {
  Context,
  DeleteGroup,
  Group,
  IdQuery,
  TeamIdQuery,
  Test,
  UpdateGroupMutation,
} from "../types";
import { ensureGroupAccess, ensureTeamAccess, ensureUser } from "./utils";

/**
 * @returns The new group object
 */
export const createGroupResolver = async (
  _: Record<string, unknown>,
  { team_id }: TeamIdQuery,
  { logger, teams, user: contextUser }: Context
): Promise<Group> => {
  const log = logger.prefix("createGroupResolver");

  const user = ensureUser({ logger, user: contextUser });
  ensureTeamAccess({ logger, team_id, teams });

  log.debug(`user ${user.id} for team ${team_id}`);

  const group = await db.transaction(async (trx) => {
    const name = await buildGroupName(team_id, { logger, trx });

    return createGroup(
      { creator_id: user.id, name, repeat_minutes: null, team_id },
      { logger, trx }
    );
  });

  log.debug(`created group ${group.id} for team ${team_id}`);

  return group;
};

/**
 * @returns An object with default group and deleted group IDs
 */
export const deleteGroupResolver = async (
  _: Record<string, unknown>,
  { id }: IdQuery,
  { logger, teams }: Context
): Promise<DeleteGroup> => {
  const log = logger.prefix("deleteGroupResolver");
  log.debug("group", id);

  const team = await ensureGroupAccess({ logger, group_id: id, teams });

  const group = await db.transaction(async (trx) => {
    await deleteGroupTestsForGroup({ group_id: id }, { logger, trx });
    return deleteGroup(id, { logger, trx });
  });

  const defaultGroup = await findDefaultGroupForTeam(team.id, { logger });

  log.debug("deleted group", id);
  return { default_group_id: defaultGroup.id, id: group.id };
};

/**
 * @returns An array of the non-deleted groups for the team,
 *   sorted alphabetically ascending by name.
 */
export const groupsResolver = async (
  _: Record<string, unknown>,
  { team_id }: TeamIdQuery,
  { logger, teams }: Context
): Promise<Group[]> => {
  ensureTeamAccess({ logger, team_id, teams });

  return findGroupsForTeam(team_id, { logger });
};

/**
 * @returns An array of the non-deleted groups this test belongs to,
 *   sorted alphabetically ascending by name.
 */
export const testGroupsResolver = async (
  { id }: Test,
  _: Record<string, unknown>,
  { logger }: Context
): Promise<Group[]> => {
  const log = logger.prefix("testGroupsResolver");
  log.debug("test", id);

  return findGroupsForTest(id, { logger });
};

/**
 * @returns Updated group object
 */
export const updateGroupResolver = async (
  _: Record<string, unknown>,
  args: UpdateGroupMutation,
  { logger, teams }: Context
): Promise<Group> => {
  logger.debug("updateGroupResolver", args.id);
  await ensureGroupAccess({ logger, group_id: args.id, teams });

  const updatedGroup = await updateGroup(args, { logger });

  return updatedGroup;
};
