import { minutesFromNow } from "../../shared/utils";
import { db } from "../db";
import { ClientError } from "../errors";
import { DeploymentEnvironment, Group, ModelOptions } from "../types";
import { cuid } from "../utils";

const DAILY_HOUR = 16; // 9 am PST
const MINUTES_PER_DAY = 24 * 60;

type CreateGroup = {
  creator_id: string;
  is_default?: boolean;
  name: string;
  repeat_minutes: number | null;
  team_id: string;
};

type UpdateGroup = {
  deployment_branches?: string | null;
  deployment_environment?: DeploymentEnvironment | null;
  deployment_integration_id?: string | null;
  id: string;
  is_email_enabled?: boolean;
  name?: string;
  alert_integration_id?: string | null;
  repeat_minutes?: number | null;
};

export const DEFAULT_GROUP_NAME = "All Tests";

const clearMinutes = (date: Date): void => {
  date.setUTCMinutes(0);
  date.setUTCSeconds(0);
  date.setUTCMilliseconds(0);
};

const formatBranches = (branches: string | null): string | null => {
  if (!branches) return null;

  return branches.split(/[\s,]+/).join(",");
};

export const getNextDay = (): string => {
  const date = new Date();
  // if already passed 9 am PST, schedule run for tomorrow
  if (date.getUTCHours() >= DAILY_HOUR) {
    date.setUTCDate(date.getUTCDate() + 1);
  }
  date.setUTCHours(DAILY_HOUR);
  clearMinutes(date);

  return date.toISOString();
};

export const getNextHour = (): string => {
  const date = new Date();

  date.setUTCHours(date.getUTCHours() + 1);
  clearMinutes(date);

  return date.toISOString();
};

export const getNextAt = (repeat_minutes: number | null): string | null => {
  if (!repeat_minutes) return null;

  if (repeat_minutes === 60) return getNextHour();
  if (repeat_minutes === MINUTES_PER_DAY) return getNextDay();

  throw new Error(`Cannot get next_at for repeat minutes ${repeat_minutes}`);
};

export const getUpdatedNextAt = ({
  next_at,
  repeat_minutes,
}: Group): string | null => {
  if (!next_at || !repeat_minutes) return null;

  const nextDate = new Date(next_at);
  nextDate.setMinutes(nextDate.getMinutes() + repeat_minutes);

  if (nextDate >= new Date()) {
    return nextDate.toISOString();
  }
  // if there was an issue such that jobs were delayed, reset next_at
  return getNextAt(repeat_minutes);
};

export const createGroup = async (
  { creator_id, is_default, name, repeat_minutes, team_id }: CreateGroup,
  { logger, trx }: ModelOptions
): Promise<Group> => {
  const log = logger.prefix("createGroup");

  log.debug(`create ${name} for team ${team_id}`);

  const group = {
    alert_integration_id: null,
    creator_id,
    deleted_at: null,
    deployment_integration_id: null,
    id: cuid(),
    is_default: is_default || false,
    is_email_enabled: true,
    name,
    next_at: getNextAt(repeat_minutes),
    repeat_minutes,
    team_id,
  };
  await (trx || db)("groups").insert(group);

  log.debug(`create ${group.id}`);

  return group;
};

export const findDefaultGroupForTeam = async (
  team_id: string,
  { logger, trx }: ModelOptions
): Promise<Group> => {
  const log = logger.prefix("findDefaultGroupForTeam");

  const groups = await (trx || db)
    .select("*")
    .from("groups")
    .where({ deleted_at: null, is_default: true, team_id });

  if (!groups.length) {
    log.error(`no default group for team ${team_id}`);
    throw new Error("group not found");
  }

  return groups[0];
};

export const findGroup = async (
  id: string,
  { logger, trx }: ModelOptions
): Promise<Group> => {
  const log = logger.prefix("findGroup");
  log.debug(`find ${id}`);

  const group = await (trx || db)
    .select("*")
    .from("groups")
    .where({ id })
    .first();

  if (!group || group.deleted_at) {
    log.error(`not found ${id}`);
    throw new Error("group not found");
  }

  log.debug(`found ${id}`);
  return group;
};

export const findGroupsForGitHubIntegration = async (
  github_repo_id: number,
  { logger, trx }: ModelOptions
): Promise<Group[]> => {
  const log = logger.prefix("findGroupsForGitHubIntegration");
  log.debug("github repo", github_repo_id);

  const groups = await (trx || db)
    .select("groups.*" as "*")
    .from("groups")
    .innerJoin(
      "integrations",
      "groups.deployment_integration_id",
      "integrations.id"
    )
    .where({
      "groups.deleted_at": null,
      "integrations.github_repo_id": github_repo_id,
    })
    .orderBy("groups.name", "asc");
  log.debug(`found ${groups.length} groups`);

  return groups;
};

export const findGroupsForTest = async (
  test_id: string,
  { logger, trx }: ModelOptions
): Promise<Group[]> => {
  const log = logger.prefix("findGroupsForTest");
  log.debug("test", test_id);

  const groups = await (trx || db)
    .select("groups.*" as "*")
    .from("groups")
    .innerJoin("group_tests", "groups.id", "group_tests.group_id")
    .where({ "groups.deleted_at": null, "group_tests.test_id": test_id })
    .orderBy("groups.name", "asc");
  log.debug(`found ${groups.length} groups`);

  return groups;
};

export const deleteGroup = async (
  id: string,
  { logger, trx }: ModelOptions
): Promise<Group> => {
  const log = logger.prefix("deleteGroup");
  log.debug("group", id);

  const group = await findGroup(id, { logger, trx });
  if (group.is_default) {
    log.error(`do not delete default group ${id}`);
    throw new Error("cannot delete default group");
  }

  const deleted_at = minutesFromNow();

  await (trx || db)("groups").where({ id }).update({ deleted_at });
  log.debug("deleted group", id);

  return { ...group, deleted_at };
};

export const findGroupsForTeam = async (
  team_id: string,
  { logger, trx }: ModelOptions
): Promise<Group[]> => {
  const log = logger.prefix("findGroupsForTeam");

  log.debug(team_id);

  const groups = await (trx || db)
    .select("*")
    .from("groups")
    .where({ deleted_at: null, team_id })
    .orderBy("is_default", "desc") // show default group first
    .orderBy("name", "asc");

  log.debug(`found ${groups.length} groups for team ${team_id}`);

  return groups;
};

export const buildGroupName = async (
  team_id: string,
  { logger, trx }: ModelOptions
): Promise<string> => {
  const log = logger.prefix("buildGroupName");

  log.debug("team", team_id);
  const groups = await findGroupsForTeam(team_id, { logger, trx });

  const groupNames = new Set(groups.map((group) => group.name));
  let groupNumber = 1;

  while (
    groupNames.has(`My Tests${groupNumber === 1 ? "" : ` ${groupNumber}`}`)
  ) {
    groupNumber++;
  }

  const name = `My Tests${groupNumber === 1 ? "" : ` ${groupNumber}`}`;
  log.debug(`built name ${name} for team ${team_id}`);

  return name;
};

export const findPendingGroups = async ({
  logger,
  trx,
}: ModelOptions): Promise<Group[]> => {
  const log = logger.prefix("findPendingGroups");

  const groups = await (trx || db)
    .select("groups.*" as "*")
    .from("groups")
    .innerJoin("teams", "groups.team_id", "teams.id")
    .whereNull("groups.deleted_at")
    .andWhere("groups.next_at", "<=", minutesFromNow())
    .andWhere({ "teams.is_enabled": true })
    .orderBy("next_at", "asc");

  log.debug(`found ${groups.length} pending groups`);

  return groups;
};

export const updateGroup = async (
  {
    alert_integration_id,
    deployment_branches,
    deployment_environment,
    deployment_integration_id,
    id,
    is_email_enabled,
    name,
    repeat_minutes,
  }: UpdateGroup,
  { logger, trx }: ModelOptions
): Promise<Group> => {
  const log = logger.prefix("updateGroup");
  log.debug(`update group ${id} name ${name}`);

  const group = await (trx || db).transaction(async (trx) => {
    const existingGroup = await findGroup(id, { logger, trx });

    const updates: Partial<Group> = {
      updated_at: minutesFromNow(),
    };

    if (alert_integration_id !== undefined) {
      updates.alert_integration_id = alert_integration_id;
    }
    if (deployment_branches !== undefined) {
      updates.deployment_branches = formatBranches(deployment_branches);
    }
    if (deployment_environment !== undefined) {
      updates.deployment_environment = deployment_environment;
    }
    if (deployment_integration_id !== undefined) {
      updates.deployment_integration_id = deployment_integration_id;
    }
    if (is_email_enabled !== undefined) {
      updates.is_email_enabled = is_email_enabled;
    }
    if (name !== undefined) {
      if (existingGroup.is_default) {
        log.error(`do not rename default group ${id}`);
        throw new Error("cannot rename default group");
      }
      updates.name = name;
    }
    if (repeat_minutes !== undefined) {
      updates.repeat_minutes = repeat_minutes;
      updates.next_at = getNextAt(repeat_minutes);
    }

    try {
      await trx("groups").update(updates).where({ id });
    } catch (error) {
      if (error.message.includes("groups_unique_name_team_id")) {
        throw new ClientError("group name must be unique");
      }

      throw error;
    }

    log.debug("updated group", id, updates);

    return { ...existingGroup, ...updates };
  });

  return group;
};

// TODO make this part of updateGroup
export const updateGroupNextAt = async (
  group: Group,
  { logger, trx }: ModelOptions
): Promise<void> => {
  const log = logger.prefix("updateGroupNextAt");

  const next_at = getUpdatedNextAt(group);

  await (trx || db)("groups")
    .update({ next_at, updated_at: minutesFromNow() })
    .where({ id: group.id });

  log.debug(
    `updated group ${group.id} repeat_minutes ${group.repeat_minutes} next_at ${next_at}`
  );
};
